import { z } from 'zod'

export const BookingSchema = z.object({
  tour_id: z.string().uuid('Invalid tour ID'),
  user_id: z.string().uuid('Invalid user ID'),
  booking_date: z.string().datetime('Invalid booking date'),
  participants: z.number().min(1, 'At least 1 participant required').max(50, 'Maximum 50 participants allowed'),
  total_amount: z.number().min(0, 'Amount must be positive'),
  special_requests: z.string().optional(),
  contact_phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  emergency_contact: z.object({
    name: z.string().min(2, 'Emergency contact name required'),
    phone: z.string().min(10, 'Emergency contact phone required'),
    relationship: z.string().min(2, 'Relationship required')
  }).optional(),
  participant_details: z.array(z.object({
    name: z.string().min(2, 'Participant name required'),
    age: z.number().min(1, 'Age must be positive').max(120, 'Invalid age'),
    dietary_restrictions: z.string().optional(),
    medical_conditions: z.string().optional()
  })).optional()
})

export const BookingUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed'], {
    required_error: 'Status is required'
  }),
  notes: z.string().optional(),
  cancellation_reason: z.string().optional()
})

export const PaymentIntentSchema = z.object({
  tour_id: z.string().uuid('Invalid tour ID'),
  participants: z.number().min(1, 'At least 1 participant required'),
  booking_date: z.string().datetime('Invalid booking date'),
  amount: z.number().min(100, 'Minimum amount is LKR 100') // Minimum in cents/paisa
})

export const PaymentConfirmationSchema = z.object({
  payment_intent_id: z.string().min(1, 'Payment intent ID required'),
  booking_id: z.string().uuid('Invalid booking ID')
})

export type BookingData = z.infer<typeof BookingSchema>
export type BookingUpdateData = z.infer<typeof BookingUpdateSchema>
export type PaymentIntentData = z.infer<typeof PaymentIntentSchema>
export type PaymentConfirmationData = z.infer<typeof PaymentConfirmationSchema>

// Booking status options
export const BOOKING_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' }
] as const

// Payment status options
export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  { value: 'succeeded', label: 'Succeeded', color: 'bg-green-100 text-green-800' },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
  { value: 'refunded', label: 'Refunded', color: 'bg-purple-100 text-purple-800' }
] as const

// Currency configuration
export const CURRENCY_CONFIG = {
  code: 'LKR',
  symbol: 'Rs.',
  locale: 'en-LK',
  multiplier: 100 // Convert to cents/paisa for Stripe
} as const