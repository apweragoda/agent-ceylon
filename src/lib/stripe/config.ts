import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// Client-side Stripe promise
let stripePromise: Promise<Stripe | null>
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'lkr',
  payment_method_types: ['card'],
  capture_method: 'automatic',
  confirmation_method: 'automatic',
} as const

// Convert LKR to Stripe format (cents/paisa)
export const formatAmountForStripe = (amount: number, currency: string = 'lkr'): number => {
  // LKR uses 2 decimal places, so multiply by 100 to get cents/paisa
  return Math.round(amount * 100)
}

// Convert Stripe amount back to LKR
export const formatAmountFromStripe = (amount: number, currency: string = 'lkr'): number => {
  return amount / 100
}

// Format currency for display
export const formatCurrency = (amount: number, currency: string = 'LKR'): string => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount)
}

// Stripe webhook signature verification
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret)
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Payment intent metadata
export interface PaymentMetadata {
  tour_id: string
  user_id: string
  booking_date: string
  participants: string
  booking_id?: string
}

// Create payment intent with metadata
export const createPaymentIntent = async (
  amount: number,
  metadata: PaymentMetadata,
  options?: Partial<Stripe.PaymentIntentCreateParams>
): Promise<Stripe.PaymentIntent> => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: formatAmountForStripe(amount),
    currency: STRIPE_CONFIG.currency,
    payment_method_types: STRIPE_CONFIG.payment_method_types,
    capture_method: STRIPE_CONFIG.capture_method,
    confirmation_method: STRIPE_CONFIG.confirmation_method,
    metadata: {
      ...metadata,
      platform: 'AgentCeylon',
      version: '1.0'
    },
    description: `Tour booking payment for ${metadata.participants} participant(s)`,
    ...options
  })

  return paymentIntent
}

// Update payment intent
export const updatePaymentIntent = async (
  paymentIntentId: string,
  updates: Partial<Stripe.PaymentIntentUpdateParams>
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.update(paymentIntentId, updates)
}

// Retrieve payment intent
export const retrievePaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.retrieve(paymentIntentId)
}

// Cancel payment intent
export const cancelPaymentIntent = async (
  paymentIntentId: string,
  reason?: Stripe.PaymentIntentCancelParams.CancellationReason
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.cancel(paymentIntentId, {
    cancellation_reason: reason
  })
}

// Create refund
export const createRefund = async (
  paymentIntentId: string,
  amount?: number,
  reason?: Stripe.RefundCreateParams.Reason
): Promise<Stripe.Refund> => {
  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
    reason: reason || 'requested_by_customer'
  }

  if (amount) {
    refundParams.amount = formatAmountForStripe(amount)
  }

  return await stripe.refunds.create(refundParams)
}