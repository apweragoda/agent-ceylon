export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          country: string | null
          user_type: 'tourist' | 'provider' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          phone?: string | null
          country?: string | null
          user_type?: 'tourist' | 'provider' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          country?: string | null
          user_type?: 'tourist' | 'provider' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          budget_range: 'budget' | 'mid_range' | 'luxury'
          preferred_activities: string[]
          accommodation_type: 'hotel' | 'guesthouse' | 'resort' | 'homestay'
          group_size: number
          travel_duration: number
          accessibility_needs: boolean
          dietary_restrictions: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          budget_range: 'budget' | 'mid_range' | 'luxury'
          preferred_activities: string[]
          accommodation_type: 'hotel' | 'guesthouse' | 'resort' | 'homestay'
          group_size: number
          travel_duration: number
          accessibility_needs?: boolean
          dietary_restrictions?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          budget_range?: 'budget' | 'mid_range' | 'luxury'
          preferred_activities?: string[]
          accommodation_type?: 'hotel' | 'guesthouse' | 'resort' | 'homestay'
          group_size?: number
          travel_duration?: number
          accessibility_needs?: boolean
          dietary_restrictions?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      tours: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          duration: number
          max_participants: number
          category: string
          location: string
          images: string[]
          itinerary: Json
          included_services: string[]
          rating: number
          reviews_count: number
          provider_id: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          duration: number
          max_participants: number
          category: string
          location: string
          images?: string[]
          itinerary: Json
          included_services?: string[]
          rating?: number
          reviews_count?: number
          provider_id: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          duration?: number
          max_participants?: number
          category?: string
          location?: string
          images?: string[]
          itinerary?: Json
          included_services?: string[]
          rating?: number
          reviews_count?: number
          provider_id?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      service_providers: {
        Row: {
          id: string
          user_id: string
          business_name: string
          business_type: 'hotel' | 'restaurant' | 'diving' | 'transport' | 'tour_guide'
          description: string
          location: string
          contact_info: Json
          services: Json
          amenities: string[]
          images: string[]
          rating: number
          reviews_count: number
          is_verified: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          business_type: 'hotel' | 'restaurant' | 'diving' | 'transport' | 'tour_guide'
          description: string
          location: string
          contact_info: Json
          services?: Json
          amenities?: string[]
          images?: string[]
          rating?: number
          reviews_count?: number
          is_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          business_type?: 'hotel' | 'restaurant' | 'diving' | 'transport' | 'tour_guide'
          description?: string
          location?: string
          contact_info?: Json
          services?: Json
          amenities?: string[]
          images?: string[]
          rating?: number
          reviews_count?: number
          is_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          tour_id: string
          participants: number
          booking_date: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          total_amount: number
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_intent_id: string | null
          special_requests: string | null
          contact_info: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tour_id: string
          participants: number
          booking_date: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          total_amount: number
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_intent_id?: string | null
          special_requests?: string | null
          contact_info: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tour_id?: string
          participants?: number
          booking_date?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          total_amount?: number
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_intent_id?: string | null
          special_requests?: string | null
          contact_info?: Json
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          tour_id: string | null
          provider_id: string | null
          booking_id: string
          rating: number
          title: string
          comment: string
          images: string[]
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tour_id?: string | null
          provider_id?: string | null
          booking_id: string
          rating: number
          title: string
          comment: string
          images?: string[]
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tour_id?: string | null
          provider_id?: string | null
          booking_id?: string
          rating?: number
          title?: string
          comment?: string
          images?: string[]
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type: 'tourist' | 'provider' | 'admin'
      budget_range: 'budget' | 'mid_range' | 'luxury'
      accommodation_type: 'hotel' | 'guesthouse' | 'resort' | 'homestay'
      business_type: 'hotel' | 'restaurant' | 'diving' | 'transport' | 'tour_guide'
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
    }
  }
}