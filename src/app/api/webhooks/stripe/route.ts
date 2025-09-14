import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { verifyWebhookSignature } from '@/lib/stripe/config'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable')
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 500 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = verifyWebhookSignature(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update payment intent status in database
        const { error } = await supabase
          .from('payment_intents')
          .update({ 
            status: 'succeeded',
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentIntent.id)

        if (error) {
          console.error('Error updating payment intent status:', error)
        }

        console.log(`Payment succeeded: ${paymentIntent.id}`)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update payment intent status in database
        const { error } = await supabase
          .from('payment_intents')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentIntent.id)

        if (error) {
          console.error('Error updating payment intent status:', error)
        }

        console.log(`Payment failed: ${paymentIntent.id}`)
        break
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update payment intent status in database
        const { error } = await supabase
          .from('payment_intents')
          .update({ 
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentIntent.id)

        if (error) {
          console.error('Error updating payment intent status:', error)
        }

        console.log(`Payment canceled: ${paymentIntent.id}`)
        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        
        // Handle dispute - update booking status if needed
        if (dispute.payment_intent) {
          const { data: paymentIntent } = await supabase
            .from('payment_intents')
            .select('booking_id')
            .eq('id', dispute.payment_intent)
            .single()

          if (paymentIntent?.booking_id) {
            await supabase
              .from('bookings')
              .update({ 
                status: 'disputed',
                notes: `Dispute created: ${dispute.reason}`,
                updated_at: new Date().toISOString()
              })
              .eq('id', paymentIntent.booking_id)
          }
        }

        console.log(`Dispute created: ${dispute.id}`)
        break
      }

      case 'refund.created': {
        const refund = event.data.object as Stripe.Refund
        
        // Handle refund - update booking and payment status
        if (refund.payment_intent) {
          const { data: paymentIntent } = await supabase
            .from('payment_intents')
            .select('booking_id')
            .eq('id', refund.payment_intent)
            .single()

          if (paymentIntent?.booking_id) {
            // Update booking status
            await supabase
              .from('bookings')
              .update({ 
                status: 'cancelled',
                payment_status: 'refunded',
                notes: `Refund processed: ${refund.amount / 100} LKR`,
                updated_at: new Date().toISOString()
              })
              .eq('id', paymentIntent.booking_id)
          }

          // Update payment intent status
          await supabase
            .from('payment_intents')
            .update({ 
              status: 'refunded',
              updated_at: new Date().toISOString()
            })
            .eq('id', refund.payment_intent)
        }

        console.log(`Refund created: ${refund.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Disable body parsing for webhooks
export const runtime = 'nodejs'