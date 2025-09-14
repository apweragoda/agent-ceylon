import { NextResponse } from 'next/server'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function createApiResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message
    },
    { status }
  )
}

export function createApiError(
  error: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error
    },
    { status }
  )
}

export function handleApiError(error: any, fallbackMessage = 'An unexpected error occurred') {
  console.error('API Error:', error)
  
  if (error?.message) {
    return createApiError(error.message, 500)
  }
  
  return createApiError(fallbackMessage, 500)
}