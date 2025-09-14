import { NextRequest } from 'next/server'
import { createApiResponse, createApiError, handleApiError } from '@/lib/utils/api-response'
import { validateAuthOptional, requireAuth } from '@/lib/utils/auth-middleware'
import { z } from 'zod'

const createTourSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  duration: z.number().positive('Duration must be positive'),
  max_participants: z.number().positive('Max participants must be positive'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(1, 'Location is required'),
  images: z.array(z.string().url()).default([]),
  itinerary: z.any().default({}),
  included_services: z.array(z.string()).default([])
})

// GET /api/tours - Get all tours with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { supabase } = await validateAuthOptional(request)
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Max 50 per page
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const minPrice = searchParams.get('price_min') ? parseFloat(searchParams.get('price_min')!) : undefined
    const maxPrice = searchParams.get('price_max') ? parseFloat(searchParams.get('price_max')!) : undefined
    const duration = searchParams.get('duration') ? parseInt(searchParams.get('duration')!) : undefined
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sort') || 'rating'

    // Build query
    let query = supabase
      .from('tours')
      .select(`
        *,
        service_providers (
          business_name,
          location,
          rating
        )
      `, { count: 'exact' })
      .eq('is_active', true)

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }
    
    if (minPrice !== undefined) {
      query = query.gte('price', minPrice)
    }
    
    if (maxPrice !== undefined) {
      query = query.lte('price', maxPrice)
    }
    
    if (duration) {
      query = query.eq('duration', duration)
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`)
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'duration_asc':
        query = query.order('duration', { ascending: true })
        break
      case 'duration_desc':
        query = query.order('duration', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'rating':
      default:
        query = query.order('rating', { ascending: false })
        break
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const { data: tours, error, count } = await query.range(from, to)

    if (error) {
      return handleApiError(error)
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return createApiResponse({
      tours: tours || [],
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

// POST /api/tours - Create a new tour (Admin or Provider only)
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth(request)
    const body = await request.json()

    // Validate input
    const validatedData = createTourSchema.parse(body)

    // Check if user can create tours (must be provider or admin)
    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (!userData || !['provider', 'admin'].includes(userData.user_type)) {
      return createApiError('Only service providers and admins can create tours', 403)
    }

    // Get provider ID if user is a provider
    let providerId = null
    if (userData.user_type === 'provider') {
      const { data: providerData } = await supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!providerData) {
        return createApiError('Provider profile not found', 400)
      }
      
      providerId = providerData.id
    } else if (body.provider_id) {
      // Admin can specify provider
      providerId = body.provider_id
    }

    if (!providerId) {
      return createApiError('Provider ID is required', 400)
    }

    // Create tour
    const { data: tour, error } = await supabase
      .from('tours')
      .insert({
        ...validatedData,
        provider_id: providerId
      })
      .select()
      .single()

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse(tour, 'Tour created successfully', 201)

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return createApiError(`Validation error: ${error.errors.map((e: any) => e.message).join(', ')}`)
    }
    return handleApiError(error)
  }
}