import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PaymentConfirmationSchema, BookingSchema } from '@/lib/validations/booking'
import { retrievePaymentIntent } from '@/lib/stripe/config'
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
    const validationResult = PaymentConfirmationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { payment_intent_id, booking_id } = validationResult.data

    // Retrieve payment intent from Stripe
    const paymentIntent = await retrievePaymentIntent(payment_intent_id)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Verify payment intent belongs to this user
    const { data: storedPaymentIntent, error: paymentError } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('id', payment_intent_id)
      .eq('user_id', user.id)
      .single()

    if (paymentError || !storedPaymentIntent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      )
    }

    // Check if booking already exists
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('id', booking_id)
      .single()

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Booking already exists' },
        { status: 409 }
      )
    }

    // Get tour details
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('*')
      .eq('id', storedPaymentIntent.tour_id)
      .single()

    if (tourError || !tour) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      )
    }

    // Create booking record
    const bookingData = {
      id: booking_id,
      user_id: user.id,
      tour_id: storedPaymentIntent.tour_id,
      booking_date: storedPaymentIntent.booking_date,
      participants: storedPaymentIntent.participants,
      total_amount: storedPaymentIntent.amount,
      status: 'confirmed',
      payment_status: 'succeeded',
      payment_intent_id: payment_intent_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select(`
        *,
        tours (
          title,
          description,
          location,
          duration,
          price,
          provider_id
        ),
        users (
          full_name,
          email
        )
      `)
      .single()

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    // Update payment intent status
    await supabase
      .from('payment_intents')
      .update({ 
        status: 'succeeded',
        booking_id: booking_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment_intent_id)

    // Generate booking confirmation number
    const confirmationNumber = `AC${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Update booking with confirmation number
    await supabase
      .from('bookings')
      .update({ confirmation_number: confirmationNumber })
      .eq('id', booking_id)

    // TODO: Send confirmation email (implement email service)
    // TODO: Send notification to service provider
    
    return NextResponse.json({
      message: 'Booking confirmed successfully',
      booking: {
        ...booking,
        confirmation_number: confirmationNumber
      },
      payment_intent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100 // Convert back from cents
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}