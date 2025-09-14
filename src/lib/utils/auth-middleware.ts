import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { createApiError } from './api-response'

export async function validateAuth(request: NextRequest) {
  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component context
          }
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  return { user, supabase }
}

export async function validateAuthOptional(request: NextRequest) {
  try {
    return await validateAuth(request)
  } catch {
    const cookieStore = cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Server component context
            }
          },
        },
      }
    )

    return { user: null, supabase }
  }
}

export async function requireAuth(request: NextRequest) {
  try {
    return await validateAuth(request)
  } catch {
    throw createApiError('Authentication required', 401)
  }
}

export async function requireAdmin(request: NextRequest) {
  const { user, supabase } = await requireAuth(request)
  
  const { data: userData } = await supabase
    .from('users')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (userData?.user_type !== 'admin') {
    throw createApiError('Admin access required', 403)
  }

  return { user, supabase }
}