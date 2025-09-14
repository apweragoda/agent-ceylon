'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { preferenceSchema, type PreferenceFormData } from '@/lib/validations/preferences'
import {
  BUDGET_RANGES,
  ACTIVITIES,
  ACCOMMODATION_TYPES,
  DIETARY_RESTRICTIONS,
  GROUP_SIZE_OPTIONS,
  DURATION_OPTIONS
} from '@/constants/preferences'

interface PreferenceQuestionnaireProps {
  onSubmit: (data: PreferenceFormData) => void
  initialData?: Partial<PreferenceFormData>
  isLoading?: boolean
}

export function PreferenceQuestionnaire({ 
  onSubmit, 
  initialData, 
  isLoading = false 
}: PreferenceQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<PreferenceFormData>({
    resolver: zodResolver(preferenceSchema),
    defaultValues: {
      budget_range: initialData?.budget_range || undefined,
      preferred_activities: initialData?.preferred_activities || [],
      accommodation_type: initialData?.accommodation_type || undefined,
      group_size: initialData?.group_size || 2,
      travel_duration: initialData?.travel_duration || 7,
      accessibility_needs: initialData?.accessibility_needs || false,
      dietary_restrictions: initialData?.dietary_restrictions || []
    }
  })

  const watchedValues = watch()
  const totalSteps = 6

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isStepValid = await trigger(fieldsToValidate)
    
    if (isStepValid && currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getFieldsForStep = (step: number): (keyof PreferenceFormData)[] => {
    switch (step) {
      case 0: return ['budget_range']
      case 1: return ['preferred_activities']
      case 2: return ['accommodation_type']
      case 3: return ['group_size']
      case 4: return ['travel_duration']
      case 5: return ['accessibility_needs', 'dietary_restrictions']
      default: return []
    }
  }

  const handleActivityToggle = (activity: string) => {
    const currentActivities = watchedValues.preferred_activities || []
    const updatedActivities = currentActivities.includes(activity)
      ? currentActivities.filter(a => a !== activity)
      : [...currentActivities, activity]
    
    setValue('preferred_activities', updatedActivities)
  }

  const handleDietaryToggle = (restriction: string) => {
    const currentRestrictions = watchedValues.dietary_restrictions || []
    const updatedRestrictions = currentRestrictions.includes(restriction)
      ? currentRestrictions.filter(r => r !== restriction)
      : [...currentRestrictions, restriction]
    
    setValue('dietary_restrictions', updatedRestrictions)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">What's your budget range?</h3>
              <p className="text-sm text-gray-600 mb-4">
                This helps us suggest tours that fit your budget
              </p>
            </div>
            
            <RadioGroup
              value={watchedValues.budget_range}
              onValueChange={(value) => setValue('budget_range', value as any)}
            >
              {BUDGET_RANGES.map((range) => (
                <div key={range.value} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={range.value} id={range.value} />
                  <div className="flex-1">
                    <Label htmlFor={range.value} className="font-medium cursor-pointer">
                      {range.label}
                    </Label>
                    <p className="text-sm text-gray-600">{range.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
            {errors.budget_range && (
              <p className="text-red-500 text-sm">{errors.budget_range.message}</p>
            )}
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">What activities interest you?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Select all that apply. We'll customize your tour recommendations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACTIVITIES.map((activity) => (
                <div
                  key={activity.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    watchedValues.preferred_activities?.includes(activity.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleActivityToggle(activity.value)}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{activity.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.label}</h4>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                    <Checkbox
                      checked={watchedValues.preferred_activities?.includes(activity.value)}
                      onCheckedChange={(checked) => {
                        // Prevent double triggering by stopping event propagation
                        if (checked !== watchedValues.preferred_activities?.includes(activity.value)) {
                          handleActivityToggle(activity.value)
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              ))}
            </div>
            {errors.preferred_activities && (
              <p className="text-red-500 text-sm">{errors.preferred_activities.message}</p>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Preferred accommodation type?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose the type of accommodation you prefer during your stay
              </p>
            </div>
            
            <RadioGroup
              value={watchedValues.accommodation_type}
              onValueChange={(value) => setValue('accommodation_type', value as any)}
            >
              {ACCOMMODATION_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <div className="flex-1">
                    <Label htmlFor={type.value} className="font-medium cursor-pointer">
                      {type.label}
                    </Label>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
            {errors.accommodation_type && (
              <p className="text-red-500 text-sm">{errors.accommodation_type.message}</p>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">How many people in your group?</h3>
              <p className="text-sm text-gray-600 mb-4">
                This helps us recommend appropriate tours and group sizes
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="px-4">
                <Slider
                  value={[watchedValues.group_size || 2]}
                  onValueChange={([value]) => setValue('group_size', value)}
                  max={20}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>1 person</span>
                  <span className="font-medium">{watchedValues.group_size} people</span>
                  <span>20+ people</span>
                </div>
              </div>
            </div>
            {errors.group_size && (
              <p className="text-red-500 text-sm">{errors.group_size.message}</p>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">How long do you plan to travel?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Duration of your trip in Sri Lanka
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="px-4">
                <Slider
                  value={[watchedValues.travel_duration || 7]}
                  onValueChange={([value]) => setValue('travel_duration', value)}
                  max={30}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>1 day</span>
                  <span className="font-medium">{watchedValues.travel_duration} days</span>
                  <span>30+ days</span>
                </div>
              </div>
            </div>
            {errors.travel_duration && (
              <p className="text-red-500 text-sm">{errors.travel_duration.message}</p>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Special requirements</h3>
              <p className="text-sm text-gray-600 mb-4">
                Let us know about any accessibility needs or dietary restrictions
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accessibility"
                  checked={watchedValues.accessibility_needs}
                  onCheckedChange={(checked) => setValue('accessibility_needs', !!checked)}
                />
                <Label htmlFor="accessibility" className="cursor-pointer">
                  I have accessibility requirements (wheelchair access, etc.)
                </Label>
              </div>

              <div>
                <h4 className="font-medium mb-3">Dietary restrictions (optional)</h4>
                <div className="grid grid-cols-2 gap-2">
                  {DIETARY_RESTRICTIONS.map((restriction) => (
                    <div key={restriction.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={restriction.value}
                        checked={watchedValues.dietary_restrictions?.includes(restriction.value)}
                        onCheckedChange={() => handleDietaryToggle(restriction.value)}
                      />
                      <Label htmlFor={restriction.value} className="cursor-pointer text-sm">
                        {restriction.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Travel Preferences</CardTitle>
        <CardDescription>
          Help us create the perfect Sri Lankan adventure for you
        </CardDescription>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Step {currentStep + 1} of {totalSteps}
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            {currentStep < totalSteps - 1 ? (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Get My Recommendations'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}