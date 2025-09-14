import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PaymentIntentSchema } from '@/lib/validations/booking'
import { createPaymentIntent } from '@/lib/stripe/config'
import { rateLimit } from '@/lib/utils/security'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the request body
    const validationResult = PaymentIntentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { tour_id, participants, booking_date, amount } = validationResult.data

    // Verify the tour exists and is available
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('id, title, price, max_participants, is_active, provider_id')
      .eq('id', tour_id)
      .eq('is_active', true)
      .single()

    if (tourError || !tour) {
      return NextResponse.json(
        { error: 'Tour not found or not available' },
        { status: 404 }
      )
    }

    // Check if participants count is valid
    if (participants > tour.max_participants) {
      return NextResponse.json(
        { error: `Maximum ${tour.max_participants} participants allowed for this tour` },
        { status: 400 }
      )
    }

    // Calculate expected amount (basic validation)
    const expectedAmount = tour.price * participants
    if (Math.abs(amount - expectedAmount) > 0.01) {
      return NextResponse.json(
        { error: 'Amount mismatch. Please refresh and try again.' },
        { status: 400 }
      )
    }

    // Check for date availability (basic check - can be enhanced)
    const bookingDateObj = new Date(booking_date)
    const now = new Date()
    if (bookingDateObj < now) {
      return NextResponse.json(
        { error: 'Cannot book tours for past dates' },
        { status: 400 }
      )
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent(amount, {
      tour_id,
      user_id: user.id,
      booking_date,
      participants: participants.toString()
    })

    // Store payment intent reference in database
    const { error: paymentError } = await supabase
      .from('payment_intents')
      .insert({
        id: paymentIntent.id,
        user_id: user.id,
        tour_id,
        amount: amount,
        currency: 'LKR',
        status: paymentIntent.status,
        participants,
        booking_date,
        metadata: {
          tour_title: tour.title,
          provider_id: tour.provider_id
        }
      })

    if (paymentError) {
      console.error('Error storing payment intent:', paymentError)
      // Don't fail the request as Stripe payment intent was created successfully
    }

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: amount,
      currency: 'LKR'
    })

  } catch (error) {
    console.error('Payment intent error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('payment_intent_id')

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID required' },
        { status: 400 }
      )
    }

    // Get payment intent from database
    const { data: paymentIntent, error } = await supabase
      .from('payment_intents')
      .select(`
        *,
        tours (
          title,
          price,
          location,
          duration
        )
      `)
      .eq('id', paymentIntentId)
      .eq('user_id', user.id)
      .single()

    if (error || !paymentIntent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(paymentIntent)

  } catch (error) {
    console.error('Payment intent retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve payment intent' },
      { status: 500 }
    )
  }
}