import { NextRequest } from 'next/server'
import { createApiResponse, createApiError, handleApiError } from '@/lib/utils/api-response'
import { requireAuth } from '@/lib/utils/auth-middleware'
import { z } from 'zod'

const preferencesSchema = z.object({
  budget_range: z.enum(['budget', 'mid_range', 'luxury']),
  preferred_activities: z.array(z.string()).min(1, 'At least one activity is required'),
  accommodation_type: z.enum(['hotel', 'guesthouse', 'resort', 'homestay']),
  group_size: z.number().min(1).max(50),
  travel_duration: z.number().min(1).max(30),
  accessibility_needs: z.boolean().default(false),
  dietary_restrictions: z.array(z.string()).default([])
})

// GET /api/preferences - Get user preferences
export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth(request)

    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createApiResponse(null, 'No preferences found')
      }
      return handleApiError(error)
    }

    return createApiResponse(preferences)

  } catch (error: any) {
    return handleApiError(error)
  }
}

// POST /api/preferences - Create or update user preferences
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth(request)
    const body = await request.json()

    // Validate input
    const validatedData = preferencesSchema.parse(body)

    // Upsert preferences (insert or update if exists)
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        ...validatedData
      })
      .select()
      .single()

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse(preferences, 'Preferences saved successfully')

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return createApiError(`Validation error: ${error.errors.map((e: any) => e.message).join(', ')}`)
    }
    return handleApiError(error)
  }
}

// PUT /api/preferences - Update user preferences
export async function PUT(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth(request)
    const body = await request.json()

    // Validate input (all fields optional for updates)
    const updateSchema = preferencesSchema.partial()
    const validatedData = updateSchema.parse(body)

    // Update preferences
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .update(validatedData)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createApiError('Preferences not found', 404)
      }
      return handleApiError(error)
    }

    return createApiResponse(preferences, 'Preferences updated successfully')

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return createApiError(`Validation error: ${error.errors.map((e: any) => e.message).join(', ')}`)
    }
    return handleApiError(error)
  }
}

// DELETE /api/preferences - Delete user preferences
export async function DELETE(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth(request)

    const { error } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse(null, 'Preferences deleted successfully')

  } catch (error: any) {
    return handleApiError(error)
  }
}