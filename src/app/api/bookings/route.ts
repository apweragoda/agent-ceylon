import { NextRequest } from 'next/server'
import { createApiResponse, createApiError, handleApiError } from '@/lib/utils/api-response'
import { requireAuth } from '@/lib/utils/auth-middleware'
import { BookingSchema, BookingUpdateSchema } from '@/lib/validations/booking'
import { createSupabaseServerClient } from '@/lib/supabase/server'
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
  }).optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional()
})

// GET /api/bookings - Get user's bookings
export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const status = searchParams.get('status')

    let query = supabase
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
          service_providers (
            business_name,
            contact_info
          )
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const { data: bookings, error, count } = await query.range(from, to)

    if (error) {
      return handleApiError(error)
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return createApiResponse({
      bookings: bookings || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error: any) {
    return handleApiError(error)
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth(request)
    const body = await request.json()

    // Validate input
    const validatedData = BookingSchema.parse(body)

    // Check if tour exists and is available
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('*')
      .eq('id', validatedData.tour_id)
      .eq('is_active', true)
      .single()

    if (tourError) {
      if (tourError.code === 'PGRST116') {
        return createApiError('Tour not found or not available', 404)
      }
      return handleApiError(tourError)
    }

    // Check if tour can accommodate the number of participants
    if (validatedData.participants > tour.max_participants) {
      return createApiError(`Tour can only accommodate ${tour.max_participants} participants`, 400)
    }

    // Check for existing bookings on the same date (optional - implement capacity checking)
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('participants')
      .eq('tour_id', validatedData.tour_id)
      .eq('booking_date', validatedData.booking_date)
      .in('status', ['pending', 'confirmed'])

    const totalBooked = existingBookings?.reduce((sum, booking) => sum + booking.participants, 0) || 0
    const remainingCapacity = tour.max_participants - totalBooked

    if (validatedData.participants > remainingCapacity) {
      return createApiError(`Only ${remainingCapacity} spots available for this date`, 400)
    }

    // Calculate total amount
    const totalAmount = tour.price * validatedData.participants

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        tour_id: validatedData.tour_id,
        participants: validatedData.participants,
        booking_date: validatedData.booking_date,
        total_amount: totalAmount,
        special_requests: validatedData.special_requests,
        contact_info: validatedData.contact_phone,
        status: 'pending',
        payment_status: 'pending'
      })
      .select(`
        *,
        tour:tours (
          title,
          location,
          duration,
          service_providers (
            business_name
          )
        )
      `)
      .single()

    if (bookingError) {
      return handleApiError(bookingError)
    }

    return createApiResponse(booking, 'Booking created successfully', 201)

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return createApiError(`Validation error: ${error.errors.map((e: any) => e.message).join(', ')}`)
    }
    return handleApiError(error)
  }
}