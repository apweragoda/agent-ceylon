'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PreferenceQuestionnaire } from '@/components/features/preference-questionnaire'
import { PreferenceFormData } from '@/lib/validations/preferences'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function PreferencesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleSubmit = async (data: PreferenceFormData) => {
    setIsLoading(true)
    
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        toast.error('Please log in to save your preferences')
        router.push('/login')
        return
      }

      // Save preferences to Supabase
      const { error: saveError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...data
        })

      if (saveError) {
        console.error('Error saving preferences:', saveError)
        toast.error('Failed to save preferences. Please try again.')
        return
      }

      toast.success('Preferences saved! Finding your perfect tours...')
      
      // Redirect to recommendations page
      router.push('/preferences/results')
      
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to AgentCeylon
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the beauty of Sri Lanka with personalized tour recommendations. 
            Tell us about your travel preferences, and we'll create the perfect itinerary for you.
          </p>
        </div>
        
        <PreferenceQuestionnaire 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  )
}