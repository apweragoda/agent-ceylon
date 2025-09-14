import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const userType = searchParams.get('user_type')

    let query = supabase
      .from('users')
      .select('id, email, full_name, user_type, created_at')

    // Apply search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Apply user type filter
    if (userType && userType !== 'all') {
      query = query.eq('user_type', userType)
    }

    // Exclude users who already have provider profiles
    const { data: existingProviders } = await supabase
      .from('service_providers')
      .select('user_id')

    const existingProviderIds = existingProviders?.map(p => p.user_id) || []
    
    if (existingProviderIds.length > 0) {
      query = query.not('id', 'in', `(${existingProviderIds.join(',')})`)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}