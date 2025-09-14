'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Star, MapPin, Clock, Users, DollarSign } from 'lucide-react'

interface Tour {
  id: string
  title: string
  description: string
  price: number
  duration: number
  max_participants: number
  category: string
  location: string
  images: string[]
  rating: number
  reviews_count: number
  match_score?: number
}

interface UserPreferences {
  budget_range: string
  preferred_activities: string[]
  accommodation_type: string
  group_size: number
  travel_duration: number
  accessibility_needs: boolean
  dietary_restrictions: string[]
}

export default function PreferenceResultsPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/login')
        return
      }

      // Get user preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (preferencesError || !preferencesData) {
        router.push('/preferences')
        return
      }

      setPreferences(preferencesData)

      // For now, get all tours and do client-side filtering
      // In production, you'd use the SQL function we created
      const { data: toursData, error: toursError } = await supabase
        .from('tours')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false })

      if (toursError) {
        console.error('Error loading tours:', toursError)
        return
      }

      // Simple recommendation algorithm (client-side for demo)
      const recommendedTours = toursData?.map(tour => ({
        ...tour,
        match_score: calculateMatchScore(tour, preferencesData)
      }))
      .filter(tour => tour.match_score > 0.3) // Only show tours with good match
      .sort((a, b) => b.match_score - a.match_score) || []

      setTours(recommendedTours)

    } catch (error) {
      console.error('Error loading recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateMatchScore = (tour: any, prefs: UserPreferences): number => {
    let score = 0

    // Budget match (30% weight)
    if (prefs.budget_range === 'budget' && tour.price <= 15000) score += 0.3
    if (prefs.budget_range === 'mid_range' && tour.price > 15000 && tour.price <= 50000) score += 0.3
    if (prefs.budget_range === 'luxury' && tour.price > 50000) score += 0.3

    // Duration match (20% weight)
    if (tour.duration <= prefs.travel_duration) score += 0.2

    // Group size match (20% weight)
    if (tour.max_participants >= prefs.group_size) score += 0.2

    // Activity match (30% weight)
    if (prefs.preferred_activities.includes(tour.category)) score += 0.3

    return Math.round(score * 100) / 100
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Finding your perfect tours...</h2>
          <p className="text-gray-600">Analyzing your preferences and matching with available tours</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your Personalized Tour Recommendations
          </h1>
          <p className="text-gray-600 mb-6">
            Based on your preferences, we found {tours.length} perfect matches for your Sri Lankan adventure!
          </p>
          
          {/* Preferences Summary */}
          {preferences && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Your Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Budget: {preferences.budget_range.replace('_', '-')}</Badge>
                  <Badge variant="secondary">{preferences.group_size} people</Badge>
                  <Badge variant="secondary">{preferences.travel_duration} days</Badge>
                  <Badge variant="secondary">{preferences.accommodation_type}</Badge>
                  {preferences.preferred_activities.map(activity => (
                    <Badge key={activity} variant="outline">{activity}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {tours.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-xl font-semibold mb-4">No tours found matching your preferences</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your preferences or check back later for new tours.
              </p>
              <Button onClick={() => router.push('/preferences')}>
                Update Preferences
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  {tour.images[0] ? (
                    <img
                      src={tour.images[0]}
                      alt={tour.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                      <span className="text-xl font-semibold">No Image</span>
                    </div>
                  )}
                  
                  {/* Match Score Badge */}
                  {tour.match_score && (
                    <Badge className="absolute top-2 right-2 bg-green-500">
                      {Math.round(tour.match_score * 100)}% match
                    </Badge>
                  )}
                </div>
                
                <CardHeader>
                  <CardTitle className="line-clamp-2">{tour.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {tour.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{tour.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{tour.duration} days</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Max {tour.max_participants} people</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{tour.rating} ({tour.reviews_count} reviews)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(tour.price)}
                    </div>
                    <Button size="sm">
                      View Details
                    </Button>
                  </div>
                  
                  <Badge variant="outline" className="mt-2">
                    {tour.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Button onClick={() => router.push('/preferences')} variant="outline" className="mr-4">
            Update Preferences
          </Button>
          <Button onClick={() => router.push('/tours')}>
            Browse All Tours
          </Button>
        </div>
      </div>
    </div>
  )
}