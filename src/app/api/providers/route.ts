import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ProviderRegistrationSchema } from '@/lib/validations/provider'
import { z } from 'zod'
import { rateLimit } from '@/lib/utils/security'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const businessType = searchParams.get('business_type')
    const isActive = searchParams.get('is_active')

    let query = supabase
      .from('service_providers')
      .select(`
        *,
        users (
          full_name,
          email
        )
      `, { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(`business_name.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`)
    }

    if (businessType && businessType !== 'all') {
      query = query.eq('business_type', businessType)
    }

    if (isActive !== null && isActive !== 'all') {
      query = query.eq('is_active', isActive === 'true')
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 })
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (!userData || userData.user_type !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate the request body
    const validationResult = ProviderRegistrationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const {
      userId,
      businessInfo,
      contactInfo,
      services,
      amenities
    } = validationResult.data

    // Check if user exists and doesn't already have a provider profile
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: existingProvider } = await supabase
      .from('service_providers')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingProvider) {
      return NextResponse.json(
        { error: 'User already has a provider profile' },
        { status: 409 }
      )
    }

    // Create the service provider
    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .insert({
        user_id: userId,
        business_name: businessInfo.businessName,
        business_type: businessInfo.businessType,
        description: businessInfo.description,
        phone: contactInfo.phone,
        email: contactInfo.email,
        address: contactInfo.address,
        city: contactInfo.city,
        website: contactInfo.website || null,
        is_active: true
      })
      .select()
      .single()

    if (providerError) {
      console.error('Provider creation error:', providerError)
      return NextResponse.json(
        { error: 'Failed to create provider profile' },
        { status: 500 }
      )
    }

    // Create provider services
    if (services && services.length > 0) {
      const serviceInserts = services.map(service => ({
        provider_id: provider.id,
        name: service.name,
        description: service.description,
        price: service.price,
        category: service.category,
        is_active: true
      }))

      const { error: servicesError } = await supabase
        .from('provider_services')
        .insert(serviceInserts)

      if (servicesError) {
        console.error('Services creation error:', servicesError)
        // Don't fail the entire request, just log the error
      }
    }

    // Create provider amenities
    if (amenities && amenities.length > 0) {
      const amenityInserts = amenities.map(amenity => ({
        provider_id: provider.id,
        name: amenity,
        is_available: true
      }))

      const { error: amenitiesError } = await supabase
        .from('provider_amenities')
        .insert(amenityInserts)

      if (amenitiesError) {
        console.error('Amenities creation error:', amenitiesError)
        // Don't fail the entire request, just log the error
      }
    }

    // Update user type to provider if it's currently tourist
    const { data: currentUser } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', userId)
      .single()

    if (currentUser?.user_type === 'tourist') {
      await supabase
        .from('users')
        .update({ user_type: 'provider' })
        .eq('id', userId)
    }

    return NextResponse.json({
      message: 'Service provider registered successfully',
      provider
    }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('id')
    
    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID required' }, { status: 400 })
    }

    const body = await request.json()
    const { is_active } = body

    // Check if user is admin or the provider owner
    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    const { data: providerData } = await supabase
      .from('service_providers')
      .select('user_id')
      .eq('id', providerId)
      .single()

    if (!userData || !providerData) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    const isAdmin = userData.user_type === 'admin'
    const isOwner = providerData.user_id === user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update provider status
    const { data, error } = await supabase
      .from('service_providers')
      .update({ is_active })
      .eq('id', providerId)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Provider updated successfully',
      provider: data
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}