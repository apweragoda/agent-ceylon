import { NextRequest } from 'next/server'
import { createApiResponse, createApiError, handleApiError } from '@/lib/utils/api-response'
import { requireAuth } from '@/lib/utils/auth-middleware'

// GET /api/preferences/recommendations - Get personalized tour recommendations
export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    // Get user preferences
    const { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (prefError) {
      return createApiError('User preferences not found. Please complete the preference questionnaire first.', 404)
    }

    // Use the recommendation function we created in the database
    const { data: recommendations, error: recError } = await supabase
      .rpc('get_recommended_tours', {
        user_preferences_id: preferences.id
      })

    if (recError) {
      // Fallback to client-side filtering if RPC fails
      console.log('RPC failed, using fallback:', recError)
      
      const { data: allTours, error: toursError } = await supabase
        .from('tours')
        .select(`
          *,
          service_providers (
            business_name,
            location,
            rating
          )
        `)
        .eq('is_active', true)
        .order('rating', { ascending: false })

      if (toursError) {
        return handleApiError(toursError)
      }

      // Calculate match scores client-side
      const scoredTours = (allTours || []).map(tour => ({
        ...tour,
        match_score: calculateMatchScore(tour, preferences)
      }))
      .filter(tour => tour.match_score > 0.3)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, limit)

      return createApiResponse({
        recommendations: scoredTours,
        preferences,
        total: scoredTours.length
      })
    }

    // Get full tour details for recommended tours
    const tourIds = recommendations.map((rec: any) => rec.tour_id)
    const { data: tours, error: tourDetailsError } = await supabase
      .from('tours')
      .select(`
        *,
        service_providers (
          business_name,
          location,
          rating
        )
      `)
      .in('id', tourIds)
      .eq('is_active', true)

    if (tourDetailsError) {
      return handleApiError(tourDetailsError)
    }

    // Merge recommendations with tour details
    const recommendedTours = recommendations.map((rec: any) => {
      const tour = tours?.find(t => t.id === rec.tour_id)
      return {
        ...tour,
        match_score: rec.match_score,
        reasons: generateMatchReasons(tour, preferences, rec.match_score)
      }
    }).filter(Boolean).slice(0, limit)

    return createApiResponse({
      recommendations: recommendedTours,
      preferences,
      total: recommendedTours.length
    })

  } catch (error: any) {
    return handleApiError(error)
  }
}

// Helper function to calculate match score (fallback)
function calculateMatchScore(tour: any, preferences: any): number {
  let score = 0

  // Budget match (30% weight)
  if (preferences.budget_range === 'budget' && tour.price <= 15000) score += 0.3
  if (preferences.budget_range === 'mid_range' && tour.price > 15000 && tour.price <= 50000) score += 0.3
  if (preferences.budget_range === 'luxury' && tour.price > 50000) score += 0.3

  // Duration match (20% weight)
  if (tour.duration <= preferences.travel_duration) score += 0.2

  // Group size match (20% weight)
  if (tour.max_participants >= preferences.group_size) score += 0.2

  // Activity match (30% weight)
  if (preferences.preferred_activities.includes(tour.category)) score += 0.3

  return Math.round(score * 100) / 100
}

// Helper function to generate match reasons
function generateMatchReasons(tour: any, preferences: any, matchScore: number): string[] {
  const reasons: string[] = []

  // Budget reasons
  if (preferences.budget_range === 'budget' && tour.price <= 15000) {
    reasons.push('Fits your budget range')
  } else if (preferences.budget_range === 'mid_range' && tour.price > 15000 && tour.price <= 50000) {
    reasons.push('Within your preferred price range')
  } else if (preferences.budget_range === 'luxury' && tour.price > 50000) {
    reasons.push('Premium experience matching your luxury preferences')
  }

  // Duration reasons
  if (tour.duration <= preferences.travel_duration) {
    reasons.push(`Perfect ${tour.duration}-day duration for your ${preferences.travel_duration}-day trip`)
  }

  // Group size reasons
  if (tour.max_participants >= preferences.group_size) {
    reasons.push(`Accommodates your group of ${preferences.group_size}`)
  }

  // Activity reasons
  if (preferences.preferred_activities.includes(tour.category)) {
    reasons.push(`Matches your interest in ${tour.category} activities`)
  }

  // High rating reason
  if (tour.rating >= 4.5) {
    reasons.push('Highly rated by other travelers')
  }

  return reasons
}