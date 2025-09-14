import { z } from 'zod'

export const preferenceSchema = z.object({
  budget_range: z.enum(['budget', 'mid_range', 'luxury'], {
    required_error: 'Please select your budget range'
  }),
  preferred_activities: z.array(z.string()).min(1, {
    message: 'Please select at least one activity'
  }),
  accommodation_type: z.enum(['hotel', 'guesthouse', 'resort', 'homestay'], {
    required_error: 'Please select your preferred accommodation type'
  }),
  group_size: z.number().min(1).max(50, {
    message: 'Group size must be between 1 and 50'
  }),
  travel_duration: z.number().min(1).max(30, {
    message: 'Travel duration must be between 1 and 30 days'
  }),
  accessibility_needs: z.boolean().default(false),
  dietary_restrictions: z.array(z.string()).default([])
})

export type PreferenceFormData = z.infer<typeof preferenceSchema>