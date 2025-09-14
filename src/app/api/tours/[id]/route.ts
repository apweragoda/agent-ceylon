import { NextRequest } from 'next/server'
import { createApiResponse, createApiError, handleApiError } from '@/lib/utils/api-response'
import { validateAuthOptional, requireAuth } from '@/lib/utils/auth-middleware'
import { z } from 'zod'

const updateTourSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  duration: z.number().positive().optional(),
  max_participants: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  images: z.array(z.string().url()).optional(),
  itinerary: z.any().optional(),
  included_services: z.array(z.string()).optional(),
  is_active: z.boolean().optional()
})

// GET /api/tours/[id] - Get single tour by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase } = await validateAuthOptional(request)
    const { id } = params

    const { data: tour, error } = await supabase
      .from('tours')
      .select(`
        *,
        service_providers (
          id,
          business_name,
          location,
          rating,
          contact_info,
          amenities
        ),
        reviews (
          id,
          rating,
          title,
          comment,
          images,
          created_at,
          users (
            full_name
          )
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createApiError('Tour not found', 404)
      }
      return handleApiError(error)
    }

    return createApiResponse(tour)

  } catch (error: any) {
    return handleApiError(error)
  }
}

// PUT /api/tours/[id] - Update tour (Owner, Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, supabase } = await requireAuth(request)
    const { id } = params
    const body = await request.json()

    // Validate input
    const validatedData = updateTourSchema.parse(body)

    // Check if tour exists and get owner info
    const { data: existingTour, error: tourError } = await supabase
      .from('tours')
      .select(`
        *,
        service_providers (
          user_id
        )
      `)
      .eq('id', id)
      .single()

    if (tourError) {
      if (tourError.code === 'PGRST116') {
        return createApiError('Tour not found', 404)
      }
      return handleApiError(tourError)
    }

    // Check permissions
    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    const isOwner = existingTour.service_providers.user_id === user.id
    const isAdmin = userData?.user_type === 'admin'

    if (!isOwner && !isAdmin) {
      return createApiError('Not authorized to update this tour', 403)
    }

    // Update tour
    const { data: updatedTour, error: updateError } = await supabase
      .from('tours')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return handleApiError(updateError)
    }

    return createApiResponse(updatedTour, 'Tour updated successfully')

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return createApiError(`Validation error: ${error.errors.map((e: any) => e.message).join(', ')}`)
    }
    return handleApiError(error)
  }
}

// DELETE /api/tours/[id] - Delete/deactivate tour (Owner, Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, supabase } = await requireAuth(request)
    const { id } = params

    // Check if tour exists and get owner info
    const { data: existingTour, error: tourError } = await supabase
      .from('tours')
      .select(`
        *,
        service_providers (
          user_id
        )
      `)
      .eq('id', id)
      .single()

    if (tourError) {
      if (tourError.code === 'PGRST116') {
        return createApiError('Tour not found', 404)
      }
      return handleApiError(tourError)
    }

    // Check permissions
    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    const isOwner = existingTour.service_providers.user_id === user.id
    const isAdmin = userData?.user_type === 'admin'

    if (!isOwner && !isAdmin) {
      return createApiError('Not authorized to delete this tour', 403)
    }

    // Check if there are active bookings
    const { data: activeBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('tour_id', id)
      .in('status', ['pending', 'confirmed'])

    if (activeBookings && activeBookings.length > 0) {
      return createApiError('Cannot delete tour with active bookings. Please cancel bookings first.', 400)
    }

    // Soft delete by setting is_active to false
    const { data: deletedTour, error: deleteError } = await supabase
      .from('tours')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single()

    if (deleteError) {
      return handleApiError(deleteError)
    }

    return createApiResponse(deletedTour, 'Tour deactivated successfully')

  } catch (error: any) {
    return handleApiError(error)
  }
}