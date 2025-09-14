import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Sample tour data
const sampleTours = [
  {
    title: 'Ancient Wonders of Kandy & Sigiriya',
    description: 'Explore Sri Lanka\'s most iconic cultural sites including the Temple of the Tooth, Sigiriya Rock Fortress, and traditional villages. Experience centuries of history and stunning architecture.',
    price: 45000,
    duration: 3,
    max_participants: 15,
    category: 'cultural',
    location: 'Kandy, Sigiriya',
    itinerary: [
      'Day 1: Arrive in Kandy, Temple of the Tooth visit, cultural show',
      'Day 2: Travel to Sigiriya, climb the Rock Fortress',
      'Day 3: Village tour and return to Colombo'
    ],
    inclusions: ['Accommodation', 'Breakfast', 'Professional guide', 'Entrance fees', 'Transportation'],
    exclusions: ['Lunch and dinner', 'Personal expenses', 'Tips'],
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800'
    ],
    rating: 4.8,
    reviews_count: 24,
    is_active: true
  },
  {
    title: 'Galle Fort Heritage Walk',
    description: 'Step back in time with a guided tour through the UNESCO World Heritage Galle Fort. Discover Dutch colonial architecture, charming cafes, and stunning ocean views.',
    price: 8500,
    duration: 1,
    max_participants: 20,
    category: 'cultural',
    location: 'Galle',
    itinerary: [
      'Morning: Meet at Galle Fort entrance',
      'Guided walk through historic streets',
      'Visit lighthouse and ramparts',
      'Lunch at colonial restaurant',
      'Shopping at local boutiques'
    ],
    inclusions: ['Professional guide', 'Entrance fees', 'Light refreshments'],
    exclusions: ['Lunch', 'Transportation', 'Shopping expenses'],
    images: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
      'https://images.unsplash.com/photo-1578050575477-60b3b24bd92a?w=800'
    ],
    rating: 4.6,
    reviews_count: 18,
    is_active: true
  },
  {
    title: 'Ella Rock Hiking Adventure',
    description: 'Challenge yourself with this spectacular hike to Ella Rock. Enjoy breathtaking views of tea plantations, valleys, and the famous Nine Arch Bridge along the way.',
    price: 12000,
    duration: 1,
    max_participants: 12,
    category: 'adventure',
    location: 'Ella',
    itinerary: [
      'Early morning departure',
      'Guided hike to Ella Rock (4-5 hours)',
      'Packed lunch with mountain views',
      'Visit Nine Arch Bridge',
      'Return by evening'
    ],
    inclusions: ['Professional guide', 'Packed lunch', 'Water bottles', 'Safety equipment'],
    exclusions: ['Transportation to Ella', 'Personal gear', 'Tips'],
    images: [
      'https://images.unsplash.com/photo-1571847140471-1d7766e8f4e4?w=800',
      'https://images.unsplash.com/photo-1578050575692-a35eaca5b1a6?w=800'
    ],
    rating: 4.7,
    reviews_count: 31,
    is_active: true
  },
  {
    title: 'White Water Rafting at Kitulgala',
    description: 'Experience the thrill of white water rafting on the Kelani River. Perfect for adventure seekers looking for an adrenaline rush in beautiful natural surroundings.',
    price: 8500,
    duration: 1,
    max_participants: 8,
    category: 'adventure',
    location: 'Kitulgala',
    itinerary: [
      'Safety briefing and equipment',
      '2-3 hours white water rafting',
      'Lunch by the river',
      'Optional jungle walk',
      'Return journey'
    ],
    inclusions: ['Safety equipment', 'Professional instructor', 'Lunch', 'Changing facilities'],
    exclusions: ['Transportation', 'Personal clothes', 'Waterproof camera'],
    images: [
      'https://images.unsplash.com/photo-1544737149-6e4d999de2a4?w=800',
      'https://images.unsplash.com/photo-1571847140471-1d7766e8f4e4?w=800'
    ],
    rating: 4.5,
    reviews_count: 16,
    is_active: true
  },
  {
    title: 'Mirissa Whale Watching Experience',
    description: 'Embark on an unforgettable whale watching journey from Mirissa. Spot blue whales, sperm whales, and dolphins in their natural habitat in the Indian Ocean.',
    price: 7500,
    duration: 1,
    max_participants: 25,
    category: 'beach',
    location: 'Mirissa',
    itinerary: [
      'Early morning boat departure',
      '3-4 hours whale watching',
      'Dolphin spotting',
      'Return to harbor',
      'Beach lunch optional'
    ],
    inclusions: ['Boat ride', 'Life jackets', 'Experienced crew', 'Light refreshments'],
    exclusions: ['Meals', 'Transportation to Mirissa', 'Seasickness medication'],
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
    ],
    rating: 4.9,
    reviews_count: 42,
    is_active: true
  },
  {
    title: 'Unawatuna Beach Paradise Day',
    description: 'Relax and unwind at one of Sri Lanka\'s most beautiful beaches. Enjoy snorkeling, beach games, and stunning sunset views at Unawatuna.',
    price: 5500,
    duration: 1,
    max_participants: 30,
    category: 'beach',
    location: 'Unawatuna',
    itinerary: [
      'Morning arrival at Unawatuna Beach',
      'Snorkeling session',
      'Beach volleyball and games',
      'Beachside lunch',
      'Sunset viewing',
      'Evening return'
    ],
    inclusions: ['Snorkeling equipment', 'Beach chairs', 'Lunch', 'Fresh fruit'],
    exclusions: ['Transportation', 'Alcoholic beverages', 'Water sports'],
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1571847140471-1d7766e8f4e4?w=800'
    ],
    rating: 4.4,
    reviews_count: 28,
    is_active: true
  },
  {
    title: 'Yala National Park Safari',
    description: 'Experience the wild side of Sri Lanka at Yala National Park. Spot leopards, elephants, sloth bears, and over 200 bird species in their natural habitat.',
    price: 18000,
    duration: 2,
    max_participants: 6,
    category: 'wildlife',
    location: 'Yala National Park',
    itinerary: [
      'Day 1: Arrival and afternoon safari',
      'Evening at safari lodge',
      'Day 2: Early morning safari',
      'Return journey with packed lunch'
    ],
    inclusions: ['Safari jeep', 'Professional guide', 'Accommodation', 'All meals', 'Park fees'],
    exclusions: ['Personal expenses', 'Alcoholic beverages', 'Tips'],
    images: [
      'https://images.unsplash.com/photo-1549366021-9f761d040a94?w=800',
      'https://images.unsplash.com/photo-1571847140471-1d7766e8f4e4?w=800'
    ],
    rating: 4.8,
    reviews_count: 35,
    is_active: true
  },
  {
    title: 'Udawalawe Elephant Safari',
    description: 'Visit the famous Udawalawe National Park, home to over 600 elephants. Also visit the Elephant Transit Home to see rescued baby elephants being cared for.',
    price: 15000,
    duration: 1,
    max_participants: 8,
    category: 'wildlife',
    location: 'Udawalawe',
    itinerary: [
      'Morning departure',
      'Udawalawe National Park safari',
      'Elephant Transit Home visit',
      'Lunch at local restaurant',
      'Return journey'
    ],
    inclusions: ['Safari vehicle', 'Park entrance', 'Professional guide', 'Lunch'],
    exclusions: ['Transportation', 'Personal expenses', 'Tips'],
    images: [
      'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=800',
      'https://images.unsplash.com/photo-1578050575477-60b3b24bd92a?w=800'
    ],
    rating: 4.6,
    reviews_count: 22,
    is_active: true
  },
  {
    title: 'Hikkaduwa Coral Reef Diving',
    description: 'Discover the underwater world of Hikkaduwa with its vibrant coral reefs and diverse marine life. Perfect for both beginners and experienced divers.',
    price: 12500,
    duration: 1,
    max_participants: 10,
    category: 'diving',
    location: 'Hikkaduwa',
    itinerary: [
      'Morning briefing and equipment check',
      'Two diving sessions',
      'Surface interval with refreshments',
      'Marine life identification',
      'Certificate presentation'
    ],
    inclusions: ['Diving equipment', 'Professional instructor', 'Refreshments', 'Certificate'],
    exclusions: ['Lunch', 'Transportation', 'Underwater camera'],
    images: [
      'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
    ],
    rating: 4.7,
    reviews_count: 19,
    is_active: true
  },
  {
    title: 'Colombo Street Food Adventure',
    description: 'Embark on a culinary journey through Colombo\'s vibrant street food scene. Taste authentic local dishes and learn about Sri Lankan food culture.',
    price: 6500,
    duration: 1,
    max_participants: 15,
    category: 'food',
    location: 'Colombo',
    itinerary: [
      'Meet at Pettah Market',
      'Street food tastings',
      'Traditional sweet shop visit',
      'Spice market tour',
      'Cooking demonstration',
      'Tea tasting session'
    ],
    inclusions: ['Food tastings', 'Professional guide', 'Recipe cards', 'Tea tasting'],
    exclusions: ['Transportation', 'Additional food purchases', 'Tips'],
    images: [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
      'https://images.unsplash.com/photo-1578050575477-60b3b24bd92a?w=800'
    ],
    rating: 4.5,
    reviews_count: 26,
    is_active: true
  },
  {
    title: 'Golden Hour Photography Tour - Sigiriya',
    description: 'Capture the perfect shot of Sigiriya Rock Fortress during golden hour. Professional photography guidance included for stunning landscape photos.',
    price: 9500,
    duration: 1,
    max_participants: 8,
    category: 'photography',
    location: 'Sigiriya',
    itinerary: [
      'Pre-dawn departure',
      'Best viewpoint setup',
      'Golden hour photography',
      'Breakfast with view',
      'Photo review session',
      'Editing tips'
    ],
    inclusions: ['Professional guide', 'Photography tips', 'Breakfast', 'Basic editing guidance'],
    exclusions: ['Camera equipment', 'Transportation', 'Personal expenses'],
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      'https://images.unsplash.com/photo-1571847140471-1d7766e8f4e4?w=800'
    ],
    rating: 4.8,
    reviews_count: 14,
    is_active: true
  },
  {
    title: 'Sacred Temples of Kandy',
    description: 'A spiritual journey through Kandy\'s most sacred temples. Experience Buddhist culture, meditation sessions, and traditional ceremonies.',
    price: 11000,
    duration: 2,
    max_participants: 12,
    category: 'spiritual',
    location: 'Kandy',
    itinerary: [
      'Day 1: Temple of the Tooth, evening ceremony',
      'Meditation session',
      'Day 2: Additional temples',
      'Monk blessing ceremony',
      'Traditional lunch'
    ],
    inclusions: ['Temple entrance fees', 'Meditation guide', 'Traditional lunch', 'Professional guide'],
    exclusions: ['Accommodation', 'Dinner', 'Personal donations'],
    images: [
      'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800',
      'https://images.unsplash.com/photo-1578050575692-a35eaca5b1a6?w=800'
    ],
    rating: 4.6,
    reviews_count: 17,
    is_active: true
  }
]

export async function POST(request: NextRequest) {
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

    // Check if tours already exist
    const { count } = await supabase
      .from('tours')
      .select('*', { count: 'exact', head: true })

    if (count && count > 0) {
      return NextResponse.json({ 
        message: `Database already contains ${count} tours. Seeding skipped.`,
        count 
      })
    }

    // Get the first active service provider to assign tours to
    const { data: provider } = await supabase
      .from('service_providers')
      .select('id')
      .eq('is_active', true)
      .limit(1)
      .single()

    // Prepare tour data for insertion
    const toursToInsert = sampleTours.map(tour => ({
      ...tour,
      provider_id: provider?.id || null,
      itinerary: JSON.stringify(tour.itinerary),
      inclusions: JSON.stringify(tour.inclusions),
      exclusions: JSON.stringify(tour.exclusions),
      images: JSON.stringify(tour.images)
    }))

    // Insert sample tours
    const { data, error } = await supabase
      .from('tours')
      .insert(toursToInsert)
      .select()

    if (error) {
      console.error('Error seeding tours:', error)
      return NextResponse.json({ 
        error: 'Failed to seed tours',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: `Successfully seeded ${data.length} sample tours`,
      count: data.length,
      tours: data.map(tour => ({ id: tour.id, title: tour.title }))
    }, { status: 201 })

  } catch (error) {
    console.error('Seeding error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    // Delete all tours (be careful with this!)
    const { error } = await supabase
      .from('tours')
      .delete()
      .neq('id', '')

    if (error) {
      console.error('Error deleting tours:', error)
      return NextResponse.json({ 
        error: 'Failed to delete tours',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'All tours deleted successfully'
    })

  } catch (error) {
    console.error('Deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}