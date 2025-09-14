import { NextRequest } from 'next/server'
import { createApiResponse, createApiError, handleApiError } from '@/lib/utils/api-response'
import { requireAuth, validateAuthOptional } from '@/lib/utils/auth-middleware'
import { z } from 'zod'

const createReviewSchema = z.object({
  tour_id: z.string().uuid().optional(),
  provider_id: z.string().uuid().optional(),
  booking_id: z.string().uuid('Booking ID is required'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(2000, 'Comment too long'),
  images: z.array(z.string().url()).max(5, 'Maximum 5 images allowed').default([])
}).refine(data => data.tour_id || data.provider_id, {
  message: 'Either tour_id or provider_id is required'
})

// GET /api/reviews - Get reviews with filtering
export async function GET(request: NextRequest) {
  try {
    const { supabase } = await validateAuthOptional(request)
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const tourId = searchParams.get('tour_id')
    const providerId = searchParams.get('provider_id')
    const minRating = searchParams.get('rating_min') ? parseInt(searchParams.get('rating_min')!) : undefined
    const verified = searchParams.get('verified') === 'true'

    let query = supabase
      .from('reviews')
      .select(`
        *,
        users (
          full_name
        ),
        tour:tours (
          title,
          location
        ),
        service_provider:service_providers (
          business_name
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (tourId) {
      query = query.eq('tour_id', tourId)
    }
    
    if (providerId) {
      query = query.eq('provider_id', providerId)
    }
    
    if (minRating) {
      query = query.gte('rating', minRating)
    }
    
    if (verified) {
      query = query.eq('is_verified', true)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const { data: reviews, error, count } = await query.range(from, to)

    if (error) {
      return handleApiError(error)
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return createApiResponse({
      reviews: reviews || [],
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

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth(request)
    const body = await request.json()

    // Validate input
    const validatedData = createReviewSchema.parse(body)

    // Verify the booking belongs to the user and is completed
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        tour:tours (
          id,
          provider_id
        )
      `)
      .eq('id', validatedData.booking_id)
      .eq('user_id', user.id)
      .single()

    if (bookingError) {
      if (bookingError.code === 'PGRST116') {
        return createApiError('Booking not found', 404)
      }
      return handleApiError(bookingError)
    }

    if (booking.status !== 'completed') {
      return createApiError('Can only review completed bookings', 400)
    }

    // Check if user has already reviewed this booking
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', validatedData.booking_id)
      .single()

    if (existingReview) {
      return createApiError('You have already reviewed this booking', 400)
    }

    // Set tour_id and provider_id from booking if not provided
    const reviewData = {
      ...validatedData,
      user_id: user.id,
      tour_id: validatedData.tour_id || booking.tour.id,
      provider_id: validatedData.provider_id || booking.tour.provider_id
    }

    // Create review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select(`
        *,
        users (
          full_name
        ),
        tour:tours (
          title
        )
      `)
      .single()

    if (reviewError) {
      return handleApiError(reviewError)
    }

    return createApiResponse(review, 'Review created successfully', 201)

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return createApiError(`Validation error: ${error.errors.map((e: any) => e.message).join(', ')}`)
    }
    return handleApiError(error)
  }
}