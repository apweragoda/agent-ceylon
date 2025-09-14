export const BUDGET_RANGES = [
  { value: 'budget', label: 'Budget (Under LKR 15,000)', description: 'Affordable options with basic amenities' },
  { value: 'mid_range', label: 'Mid-range (LKR 15,000 - 50,000)', description: 'Comfortable options with good amenities' },
  { value: 'luxury', label: 'Luxury (Above LKR 50,000)', description: 'Premium options with luxury amenities' }
] as const

export const ACTIVITIES = [
  { value: 'cultural', label: 'Cultural Sites', icon: '🏛️', description: 'Ancient temples, historical sites, museums' },
  { value: 'adventure', label: 'Adventure Sports', icon: '🏔️', description: 'Hiking, climbing, water sports' },
  { value: 'beach', label: 'Beach & Relaxation', icon: '🏖️', description: 'Beach resorts, spa treatments, leisure' },
  { value: 'wildlife', label: 'Wildlife & Nature', icon: '🐘', description: 'Safari tours, national parks, bird watching' },
  { value: 'diving', label: 'Diving & Snorkeling', icon: '🤿', description: 'Coral reefs, underwater exploration' },
  { value: 'food', label: 'Food & Culinary', icon: '🍛', description: 'Local cuisine, cooking classes, food tours' },
  { value: 'photography', label: 'Photography', icon: '📸', description: 'Scenic locations, sunrise/sunset spots' },
  { value: 'spiritual', label: 'Spiritual & Wellness', icon: '🧘', description: 'Meditation retreats, yoga, temples' }
] as const

export const ACCOMMODATION_TYPES = [
  { value: 'hotel', label: 'Hotel', description: 'Standard hotel rooms with full service' },
  { value: 'guesthouse', label: 'Guesthouse', description: 'Local guesthouses with personal touch' },
  { value: 'resort', label: 'Resort', description: 'All-inclusive resorts with amenities' },
  { value: 'homestay', label: 'Homestay', description: 'Stay with local families for authentic experience' }
] as const

export const DIETARY_RESTRICTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'gluten_free', label: 'Gluten-free' },
  { value: 'dairy_free', label: 'Dairy-free' },
  { value: 'nut_free', label: 'Nut-free' }
] as const

export const GROUP_SIZE_OPTIONS = [
  { value: 1, label: 'Solo traveler' },
  { value: 2, label: 'Couple' },
  { value: 3, label: '3-4 people' },
  { value: 5, label: '5-8 people' },
  { value: 10, label: '9+ people' }
] as const

export const DURATION_OPTIONS = [
  { value: 1, label: '1-2 days' },
  { value: 3, label: '3-5 days' },
  { value: 7, label: '1 week' },
  { value: 14, label: '2 weeks' },
  { value: 21, label: '3 weeks' },
  { value: 30, label: '1 month+' }
] as const