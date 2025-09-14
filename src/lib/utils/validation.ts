import { z } from 'zod'

// Common validation schemas
export const phoneSchema = z.string()
  .min(1, 'Phone number is required')
  .regex(/^\+?[\d\s-()]{8,}$/, 'Please enter a valid phone number')

export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .toLowerCase()

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')

export const uuidSchema = z.string()
  .uuid('Invalid ID format')

export const priceSchema = z.number()
  .positive('Price must be positive')
  .max(1000000, 'Price cannot exceed 1,000,000 LKR')

export const ratingSchema = z.number()
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating cannot exceed 5')

// Date validations
export const futureDateSchema = z.string()
  .refine(date => {
    const inputDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return inputDate >= today
  }, 'Date must be today or in the future')

export const pastDateSchema = z.string()
  .refine(date => {
    const inputDate = new Date(date)
    const today = new Date()
    return inputDate <= today
  }, 'Date cannot be in the future')

// File validations
export const imageUrlSchema = z.string()
  .url('Must be a valid URL')
  .refine(url => {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    return validExtensions.some(ext => url.toLowerCase().includes(ext))
  }, 'Must be a valid image URL (jpg, jpeg, png, webp, gif)')

export const multipleImagesSchema = z.array(imageUrlSchema)
  .max(10, 'Maximum 10 images allowed')

// Text content validations
export const safeTextSchema = z.string()
  .transform(text => text.trim())
  .refine(text => {
    // Basic XSS protection - reject strings with script tags or javascript:
    const dangerous = /<script|javascript:|on\w+=/i
    return !dangerous.test(text)
  }, 'Text contains potentially unsafe content')

export const descriptionSchema = safeTextSchema
  .min(10, 'Description must be at least 10 characters')
  .max(5000, 'Description cannot exceed 5000 characters')

export const titleSchema = safeTextSchema
  .min(1, 'Title is required')
  .max(200, 'Title cannot exceed 200 characters')

// Location validation
export const locationSchema = z.string()
  .min(1, 'Location is required')
  .max(100, 'Location name too long')
  .refine(location => {
    // Basic validation - should contain only letters, spaces, commas, and common punctuation
    const validPattern = /^[a-zA-Z\s,.-]+$/
    return validPattern.test(location)
  }, 'Location contains invalid characters')

// Capacity validations
export const participantsSchema = z.number()
  .int('Must be a whole number')
  .min(1, 'At least 1 participant required')
  .max(100, 'Maximum 100 participants allowed')

export const durationSchema = z.number()
  .int('Duration must be a whole number')
  .min(1, 'Minimum duration is 1 day')
  .max(365, 'Maximum duration is 365 days')

// Contact info validation
export const contactInfoSchema = z.object({
  phone: phoneSchema,
  email: emailSchema,
  address: z.string().min(5, 'Address must be at least 5 characters'),
  website: z.string().url().optional()
})

// Helper functions for validation
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
}

export function validateFileSize(size: number, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return size <= maxSizeBytes
}

export function validateFileType(filename: string, allowedTypes: string[]): boolean {
  const extension = filename.toLowerCase().split('.').pop()
  return allowedTypes.includes(extension || '')
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Rate limiting helpers
export function createRateLimitKey(identifier: string, endpoint: string): string {
  return `rate_limit:${identifier}:${endpoint}`
}

export function getRateLimitWindow(windowMinutes: number = 15): number {
  return Math.floor(Date.now() / (windowMinutes * 60 * 1000))
}