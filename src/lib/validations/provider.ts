import { z } from 'zod'

export const BusinessInfoSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessType: z.enum(['hotel', 'restaurant', 'tour_operator', 'transport', 'activity'], {
    required_error: 'Please select a business type'
  }),
  description: z.string().min(10, 'Description must be at least 10 characters')
})

export const ContactInfoSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Please enter a valid email address'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal(''))
})

export const ServiceSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters'),
  description: z.string().min(5, 'Service description must be at least 5 characters'),
  price: z.number().min(0, 'Price must be a positive number'),
  category: z.string().min(2, 'Category is required')
})

export const ProviderRegistrationSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  businessInfo: BusinessInfoSchema,
  contactInfo: ContactInfoSchema,
  services: z.array(ServiceSchema).optional(),
  amenities: z.array(z.string()).optional()
})

export type BusinessInfoData = z.infer<typeof BusinessInfoSchema>
export type ContactInfoData = z.infer<typeof ContactInfoSchema>
export type ServiceData = z.infer<typeof ServiceSchema>
export type ProviderRegistrationData = z.infer<typeof ProviderRegistrationSchema>

// Business type options
export const BUSINESS_TYPES = [
  { value: 'hotel', label: 'Hotel & Accommodation' },
  { value: 'restaurant', label: 'Restaurant & Dining' },
  { value: 'tour_operator', label: 'Tour Operator' },
  { value: 'transport', label: 'Transportation' },
  { value: 'activity', label: 'Activity Provider' }
] as const

// Service categories
export const SERVICE_CATEGORIES = [
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'dining', label: 'Dining' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'tour', label: 'Tours & Experiences' },
  { value: 'activity', label: 'Activities' },
  { value: 'wellness', label: 'Wellness & Spa' },
  { value: 'equipment', label: 'Equipment Rental' },
  { value: 'other', label: 'Other Services' }
] as const

// Common amenities
export const AMENITIES_OPTIONS = [
  // Hotel amenities
  'Free WiFi',
  'Swimming Pool',
  'Fitness Center',
  'Spa Services',
  'Restaurant',
  'Bar/Lounge',
  'Room Service',
  'Air Conditioning',
  'Parking',
  'Airport Shuttle',
  'Business Center',
  'Pet Friendly',
  'Family Rooms',
  'Non-smoking Rooms',
  'Wheelchair Accessible',
  
  // Restaurant amenities
  'Outdoor Seating',
  'Delivery',
  'Takeaway',
  'Live Music',
  'Private Dining',
  'Vegetarian Options',
  'Vegan Options',
  'Halal Food',
  'Kids Menu',
  'Happy Hour',
  
  // Tour operator amenities
  'Professional Guide',
  'Transportation Included',
  'Equipment Provided',
  'Insurance Coverage',
  'Small Groups',
  'Customizable Tours',
  'Multi-language Guide',
  'Photo Service',
  'Refreshments',
  'Safety Equipment',
  
  // Activity amenities
  'Beginner Friendly',
  'Advanced Level',
  'Age Restrictions',
  'Group Discounts',
  'Equipment Rental',
  'Instruction Included',
  'Safety Briefing',
  'Certificates',
  
  // Transportation amenities
  'Air Conditioning',
  'WiFi',
  'Comfortable Seating',
  'Luggage Space',
  'Professional Driver',
  'GPS Tracking',
  'Insurance',
  '24/7 Support'
] as const