'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  CalendarIcon, 
  UsersIcon, 
  CreditCardIcon, 
  ShieldCheckIcon,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { BookingSchema, type BookingData } from '@/lib/validations/booking'
import { formatCurrency } from '@/lib/stripe/config'
import { getStripe } from '@/lib/stripe/config'

interface Tour {
  id: string
  title: string
  description: string
  price: number
  duration: number
  max_participants: number
  location: string
  images: string[]
  category: string
  service_providers: {
    business_name: string
  }
}

interface BookingFormProps {
  tour: Tour
  onBookingComplete?: (booking: any) => void
  onCancel?: () => void
}

const BookingFormInner: React.FC<BookingFormProps> = ({ tour, onBookingComplete, onCancel }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [bookingStep, setBookingStep] = useState<'details' | 'payment' | 'confirmation'>('details')
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<BookingData>({
    resolver: zodResolver(BookingSchema),
    defaultValues: {
      tour_id: tour.id,
      participants: 1,
      booking_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      special_requests: '',
      contact_phone: '',
    }
  })

  const participants = watch('participants')
  const bookingDate = watch('booking_date')
  const totalAmount = (participants || 1) * tour.price

  // Step 1: Booking Details
  const handleBookingDetails = async (data: BookingData) => {
    try {
      setIsProcessing(true)
      setPaymentError(null)

      // Create payment intent
      const response = await fetch('/api/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tour_id: tour.id,
          participants: data.participants,
          booking_date: data.booking_date,
          amount: totalAmount
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment intent')
      }

      setPaymentIntentId(result.payment_intent_id)
      setBookingId(crypto.randomUUID()) // Generate booking ID
      setBookingStep('payment')

    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  // Step 2: Payment Processing
  const handlePayment = async () => {
    if (!stripe || !elements || !paymentIntentId) {
      setPaymentError('Payment system not ready. Please try again.')
      return
    }

    try {
      setIsProcessing(true)
      setPaymentError(null)

      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(paymentIntentId, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: watch('contact_phone'), // You might want to add a name field
          },
        },
      })

      if (error) {
        throw new Error(error.message || 'Payment failed')
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm booking
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment_intent_id: paymentIntentId,
            booking_id: bookingId
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to confirm booking')
        }

        setBookingStep('confirmation')
        onBookingComplete?.(result.booking)
      }

    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  if (bookingStep === 'confirmation') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
          <CardDescription>
            Your tour has been successfully booked. You'll receive a confirmation email shortly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">{tour.title}</h3>
            <p className="text-gray-600">
              {formatCurrency(totalAmount)} for {participants} participant(s)
            </p>
            <p className="text-sm text-gray-500">
              Date: {new Date(bookingDate).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button onClick={() => window.location.href = '/dashboard/bookings'}>
              View My Bookings
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {bookingStep === 'details' ? 'Book Your Tour' : 'Payment Details'}
        </CardTitle>
        <CardDescription>
          {bookingStep === 'details' 
            ? 'Fill in your booking details and preferences'
            : 'Secure payment processing powered by Stripe'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Tour Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold">{tour.title}</h3>
              <p className="text-sm text-gray-600">{tour.location}</p>
            </div>
            <Badge variant="outline">{tour.category}</Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1 text-gray-500" />
              {tour.duration} day(s)
            </div>
            <div className="flex items-center">
              <UsersIcon className="w-4 h-4 mr-1 text-gray-500" />
              Max {tour.max_participants}
            </div>
            <div className="font-semibold text-right">
              {formatCurrency(tour.price)}/person
            </div>
          </div>
        </div>

        {bookingStep === 'details' && (
          <form onSubmit={handleSubmit(handleBookingDetails)} className="space-y-6">
            {/* Booking Date */}
            <div>
              <Label htmlFor="booking_date">Preferred Date</Label>
              <Input
                id="booking_date"
                type="date"
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                {...register('booking_date')}
              />
              {errors.booking_date && (
                <p className="text-red-500 text-sm mt-1">{errors.booking_date.message}</p>
              )}
            </div>

            {/* Participants */}
            <div>
              <Label htmlFor="participants">Number of Participants</Label>
              <Input
                id="participants"
                type="number"
                min="1"
                max={tour.max_participants}
                {...register('participants', { valueAsNumber: true })}
              />
              {errors.participants && (
                <p className="text-red-500 text-sm mt-1">{errors.participants.message}</p>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                type="tel"
                placeholder="+94 77 123 4567"
                {...register('contact_phone')}
              />
              {errors.contact_phone && (
                <p className="text-red-500 text-sm mt-1">{errors.contact_phone.message}</p>
              )}
            </div>

            {/* Special Requests */}
            <div>
              <Label htmlFor="special_requests">Special Requests (Optional)</Label>
              <Textarea
                id="special_requests"
                placeholder="Any special dietary requirements, accessibility needs, or other requests..."
                {...register('special_requests')}
              />
            </div>

            <Separator />

            {/* Pricing Summary */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Price per person:</span>
                <span>{formatCurrency(tour.price)}</span>
              </div>
              <div className="flex justify-between">
                <span>Participants:</span>
                <span>{participants || 1}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {paymentError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{paymentError}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>
            </div>
          </form>
        )}

        {bookingStep === 'payment' && (
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Payment Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{tour.title}</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{participants} participant(s) on {new Date(bookingDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Card Element */}
            <div>
              <Label>Card Details</Label>
              <div className="p-3 border rounded-md">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center text-sm text-gray-600">
              <ShieldCheckIcon className="w-4 h-4 mr-2" />
              Your payment is secured with 256-bit SSL encryption
            </div>

            {paymentError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{paymentError}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBookingStep('details')}
                disabled={isProcessing}
              >
                Back
              </Button>
              <Button
                onClick={handlePayment}
                disabled={!stripe || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="w-4 h-4 mr-2" />
                    Pay {formatCurrency(totalAmount)}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const BookingForm: React.FC<BookingFormProps> = (props) => {
  const [stripePromise] = useState(() => getStripe())

  return (
    <Elements stripe={stripePromise}>
      <BookingFormInner {...props} />
    </Elements>
  )
}