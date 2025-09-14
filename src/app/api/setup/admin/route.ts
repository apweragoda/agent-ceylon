import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// This endpoint helps create the first admin user
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    // Check if any admin users already exist
    const { count: adminCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'admin')

    if (adminCount && adminCount > 0) {
      return NextResponse.json(
        { error: 'Admin user already exists. Use Supabase dashboard to create additional admins.' },
        { status: 409 }
      )
    }

    // Use regular signup since we don't have service role permissions
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Failed to create admin user', details: authError.message },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create the user profile with admin type
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        user_type: 'admin'
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      
      return NextResponse.json(
        { error: 'Failed to create user profile', details: profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Admin user created successfully. Please check your email to verify your account if email confirmation is enabled.',
      user: {
        id: authData.user.id,
        email,
        full_name: fullName,
        user_type: 'admin'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}