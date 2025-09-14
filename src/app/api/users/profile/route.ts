import { NextRequest } from 'next/server'
import { createApiResponse, createApiError, handleApiError } from '@/lib/utils/api-response'
import { requireAuth } from '@/lib/utils/auth-middleware'
import { z } from 'zod'

const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phone: z.string().min(1, 'Phone number is required').optional(),
  country: z.string().optional()
})

// GET /api/users/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth(request)

    const { data: profile, error } = await supabase
      .from('users')
      .select(`
        *,
        user_preferences (*),
        service_providers (*)
      `)
      .eq('id', user.id)
      .single()

    if (error) {
      return handleApiError(error)
    }

    // Get additional stats
    const { data: bookingStats } = await supabase
      .from('bookings')
      .select('status, total_amount')
      .eq('user_id', user.id)

    const stats = {
      total_bookings: bookingStats?.length || 0,
      confirmed_bookings: bookingStats?.filter(b => b.status === 'confirmed').length || 0,
      completed_bookings: bookingStats?.filter(b => b.status === 'completed').length || 0,
      total_spent: bookingStats?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0
    }

    return createApiResponse({
      ...profile,
      stats
    })

  } catch (error: any) {
    return handleApiError(error)
  }
}

// PUT /api/users/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth(request)
    const body = await request.json()

    // Validate input
    const validatedData = updateProfileSchema.parse(body)

    // Update user profile
    const { data: updatedProfile, error } = await supabase
      .from('users')
      .update(validatedData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse(updatedProfile, 'Profile updated successfully')

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return createApiError(`Validation error: ${error.errors.map((e: any) => e.message).join(', ')}`)
    }
    return handleApiError(error)
  }
}

// DELETE /api/users/profile - Delete user account
export async function DELETE(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth(request)

    // Check for active bookings
    const { data: activeBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['pending', 'confirmed'])

    if (activeBookings && activeBookings.length > 0) {
      return createApiError('Cannot delete account with active bookings. Please cancel or complete your bookings first.', 400)
    }

    // Delete user account (this will cascade to related records due to foreign key constraints)
    const { error } = await supabase.auth.admin.deleteUser(user.id)

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse(null, 'Account deleted successfully')

  } catch (error: any) {
    return handleApiError(error)
  }
}