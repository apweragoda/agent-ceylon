import { NextRequest } from 'next/server'
import { createApiError } from './api-response'

// Rate limiting (in-memory store - in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  maxRequests: number
  windowMinutes: number
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Authentication endpoints
  'POST:/api/auth/login': { maxRequests: 5, windowMinutes: 15 },
  'POST:/api/auth/register': { maxRequests: 3, windowMinutes: 60 },
  'POST:/api/auth/reset-password': { maxRequests: 3, windowMinutes: 60 },
  
  // General API endpoints
  'GET:*': { maxRequests: 100, windowMinutes: 15 },
  'POST:*': { maxRequests: 30, windowMinutes: 15 },
  'PUT:*': { maxRequests: 20, windowMinutes: 15 },
  'DELETE:*': { maxRequests: 10, windowMinutes: 15 },
  
  // Specific endpoints
  'POST:/api/bookings': { maxRequests: 5, windowMinutes: 60 },
  'POST:/api/reviews': { maxRequests: 3, windowMinutes: 60 },
  'POST:/api/providers': { maxRequests: 1, windowMinutes: 60 },
}

export function checkRateLimit(request: NextRequest): boolean {
  const ip = getClientIP(request)
  const method = request.method
  const pathname = new URL(request.url).pathname
  
  // Create rate limit key
  const specificKey = `${method}:${pathname}`
  const generalKey = `${method}:*`
  
  // Get rate limit config (specific first, then general)
  const config = RATE_LIMITS[specificKey] || RATE_LIMITS[generalKey]
  
  if (!config) {
    return true // No rate limit configured
  }
  
  const rateLimitKey = `${ip}:${specificKey}`
  const now = Date.now()
  const windowMs = config.windowMinutes * 60 * 1000
  
  const current = rateLimitStore.get(rateLimitKey)
  
  if (!current) {
    // First request
    rateLimitStore.set(rateLimitKey, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }
  
  if (now > current.resetTime) {
    // Window expired, reset counter
    rateLimitStore.set(rateLimitKey, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }
  
  if (current.count >= config.maxRequests) {
    return false // Rate limit exceeded
  }
  
  // Increment counter
  current.count++
  rateLimitStore.set(rateLimitKey, current)
  
  return true
}

export function getClientIP(request: NextRequest): string {
  // Try various headers for getting real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const clientIp = request.headers.get('x-client-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp.trim()
  }
  
  if (clientIp) {
    return clientIp.trim()
  }
  
  // Fallback to connection remote address
  return request.ip || 'unknown'
}

export function validateCSRFToken(request: NextRequest): boolean {
  // Skip CSRF validation for GET requests
  if (request.method === 'GET') {
    return true
  }
  
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'https://localhost:3000'
  ].filter(Boolean)
  
  // Check if request comes from allowed origins
  if (origin && allowedOrigins.includes(origin)) {
    return true
  }
  
  if (referer) {
    const refererUrl = new URL(referer)
    const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`
    if (allowedOrigins.includes(refererOrigin)) {
      return true
    }
  }
  
  return false
}

export function sanitizeHeaders(request: NextRequest): Record<string, string> {
  const dangerousHeaders = [
    'x-forwarded-host',
    'x-forwarded-server',
    'x-forwarded-proto'
  ]
  
  const sanitized: Record<string, string> = {}
  
  request.headers.forEach((value, key) => {
    if (!dangerousHeaders.includes(key.toLowerCase())) {
      sanitized[key] = value
    }
  })
  
  return sanitized
}

export function validateContentType(request: NextRequest, allowedTypes: string[]): boolean {
  const contentType = request.headers.get('content-type')
  
  if (!contentType) {
    return request.method === 'GET' // GET requests don't need content-type
  }
  
  return allowedTypes.some(type => contentType.includes(type))
}

export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\b(UNION|SELECT).*\b(FROM|WHERE)\b)/gi
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi
  ]
  
  return xssPatterns.some(pattern => pattern.test(input))
}

export function validateRequestSize(request: NextRequest, maxSizeMB: number = 10): boolean {
  const contentLength = request.headers.get('content-length')
  
  if (!contentLength) {
    return true // No content length header
  }
  
  const sizeBytes = parseInt(contentLength, 10)
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  
  return sizeBytes <= maxSizeBytes
}

export function createSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  }
}

// Middleware for security checks
export async function securityMiddleware(
  request: NextRequest,
  config: {
    checkRateLimit?: boolean
    checkCSRF?: boolean
    checkContentType?: boolean
    allowedContentTypes?: string[]
    maxRequestSizeMB?: number
  } = {}
) {
  const {
    checkRateLimit: checkRL = true,
    checkCSRF = true,
    checkContentType = true,
    allowedContentTypes = ['application/json', 'multipart/form-data', 'text/plain'],
    maxRequestSizeMB = 10
  } = config

  // Rate limiting
  if (checkRL && !checkRateLimit(request)) {
    throw createApiError('Too many requests. Please try again later.', 429)
  }

  // CSRF protection
  if (checkCSRF && !validateCSRFToken(request)) {
    throw createApiError('Invalid request origin', 403)
  }

  // Content type validation
  if (checkContentType && !validateContentType(request, allowedContentTypes)) {
    throw createApiError('Invalid content type', 400)
  }

  // Request size validation
  if (!validateRequestSize(request, maxRequestSizeMB)) {
    throw createApiError('Request too large', 413)
  }

  return true
}