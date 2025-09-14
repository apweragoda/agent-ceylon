import { NextRequest } from 'next/server'
import { createApiResponse, createApiError, handleApiError } from '@/lib/utils/api-response'
import { requireAuth } from '@/lib/utils/auth-middleware'
import { z } from 'zod'

const updateBookingSchema = z.object({
  participants: z.number().min(1).max(50).optional(),
  booking_date: z.string().refine(date => {
    const bookingDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return bookingDate >= today
  }, 'Booking date must be today or in the future').optional(),
  special_requests: z.string().optional(),
  contact_info: z.object({
    phone: z.string().min(1).optional(),
    emergency_contact: z.string().optional(),
    dietary_restrictions: z.array(z.string()).optional(),
    accessibility_needs: z.string().optional()
  }).optional()
})

// GET /api/bookings/[id] - Get specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, supabase } = await requireAuth(request)
    const { id } = params

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        tour:tours (
          id,
          title,
          description,
          price,
          duration,
          location,
          images,
          category,
          itinerary,
          included_services,
          service_providers (
            id,
            business_name,
            contact_info,
            location
          )
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createApiError('Booking not found', 404)
      }
      return handleApiError(error)
    }

    return createApiResponse(booking)

  } catch (error: any) {
    return handleApiError(error)
  }
}

// PUT /api/bookings/[id] - Update booking
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, supabase } = await requireAuth(request)
    const { id } = params
    const body = await request.json()

    // Validate input
    const validatedData = updateBookingSchema.parse(body)

    // Check if booking exists and belongs to user
    const { data: existingBooking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        tour:tours (
          price,
          max_participants
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (bookingError) {
      if (bookingError.code === 'PGRST116') {
        return createApiError('Booking not found', 404)
      }
      return handleApiError(bookingError)
    }

    // Check if booking can be modified (not completed or cancelled)
    if (['completed', 'cancelled'].includes(existingBooking.status)) {
      return createApiError('Cannot modify completed or cancelled bookings', 400)
    }

    // Check booking date is not in the past (if being updated)
    if (validatedData.booking_date) {
      const bookingDate = new Date(validatedData.booking_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (bookingDate < today) {
        return createApiError('Cannot modify booking date to a past date', 400)
      }
    }

    // Recalculate total amount if participants changed
    let updateData = { ...validatedData }
    if (validatedData.participants && validatedData.participants !== existingBooking.participants) {
      updateData.total_amount = existingBooking.tour.price * validatedData.participants
    }

    // Update booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        tour:tours (
          title,
          location,
          service_providers (
            business_name
          )
        )
      `)
      .single()

    if (updateError) {
      return handleApiError(updateError)
    }

    return createApiResponse(updatedBooking, 'Booking updated successfully')

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return createApiError(`Validation error: ${error.errors.map((e: any) => e.message).join(', ')}`)
    }
    return handleApiError(error)
  }
}

// DELETE /api/bookings/[id] - Cancel booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, supabase } = await requireAuth(request)
    const { id } = params

    // Check if booking exists and belongs to user
    const { data: existingBooking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (bookingError) {
      if (bookingError.code === 'PGRST116') {
        return createApiError('Booking not found', 404)
      }
      return handleApiError(bookingError)
    }

    // Check if booking can be cancelled
    if (existingBooking.status === 'completed') {
      return createApiError('Cannot cancel completed bookings', 400)
    }

    if (existingBooking.status === 'cancelled') {
      return createApiError('Booking is already cancelled', 400)
    }

    // Check cancellation deadline (24 hours before booking date)
    const bookingDate = new Date(existingBooking.booking_date)
    const cancelDeadline = new Date(bookingDate.getTime() - (24 * 60 * 60 * 1000))
    const now = new Date()

    if (now > cancelDeadline) {
      return createApiError('Cannot cancel booking less than 24 hours before the tour date', 400)
    }

    // Cancel booking
    const { data: cancelledBooking, error: cancelError } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled',
        payment_status: existingBooking.payment_status === 'paid' ? 'refunded' : 'cancelled'
      })
      .eq('id', id)
      .select()
      .single()

    if (cancelError) {
      return handleApiError(cancelError)
    }

    return createApiResponse(cancelledBooking, 'Booking cancelled successfully')

  } catch (error: any) {
    return handleApiError(error)
  }
}