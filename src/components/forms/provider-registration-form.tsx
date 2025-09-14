'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plus, X, Building, MapPin, Phone, Mail } from 'lucide-react'
import { z } from 'zod'
import { createSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const providerSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  business_type: z.enum(['hotel', 'restaurant', 'diving', 'transport', 'tour_guide'], {
    required_error: 'Please select a business type'
  }),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  location: z.string().min(1, 'Location is required'),
  contact_info: z.object({
    phone: z.string().min(1, 'Phone number is required'),
    email: z.string().email('Valid email is required'),
    address: z.string().min(10, 'Address must be at least 10 characters'),
    website: z.string().url().optional().or(z.literal(''))
  }),
  services: z.array(z.object({
    name: z.string().min(1, 'Service name is required'),
    price: z.number().positive('Price must be positive'),
    description: z.string().min(1, 'Service description is required'),
    duration: z.string().optional(),
    capacity: z.number().positive().optional()
  })).min(1, 'At least one service is required'),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([])
})

type ProviderFormData = z.infer<typeof providerSchema>

const BUSINESS_TYPES = [
  { value: 'hotel', label: 'Hotel', icon: '🏨', description: 'Accommodation services' },
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️', description: 'Dining and food services' },
  { value: 'diving', label: 'Diving Center', icon: '🤿', description: 'Diving and water sports' },
  { value: 'transport', label: 'Transportation', icon: '🚐', description: 'Transport services' },
  { value: 'tour_guide', label: 'Tour Guide', icon: '🗺️', description: 'Guided tour services' }
]

const COMMON_AMENITIES = [
  'WiFi', 'Parking', 'Air Conditioning', 'Restaurant', 'Pool', 'Spa', 'Gym', 'Beach Access',
  'Room Service', 'Laundry', 'Pet Friendly', 'Wheelchair Accessible', 'Bar/Lounge',
  'Conference Room', 'Airport Shuttle', 'Breakfast Included', 'Garden', 'Terrace'
]

export function ProviderRegistrationForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [newService, setNewService] = useState({ name: '', price: 0, description: '', duration: '', capacity: undefined })
  const [newAmenity, setNewAmenity] = useState('')
  const router = useRouter()
  const supabase = createSupabaseClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      services: [],
      amenities: [],
      images: [],
      contact_info: {
        phone: '',
        email: '',
        address: '',
        website: ''
      }
    }
  })

  const watchedValues = watch()
  const totalSteps = 4

  const onSubmit = async (data: ProviderFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to register as service provider')
        return
      }

      toast.success('Service provider registration submitted successfully!')
      router.push('/dashboard')

    } catch (error) {
      console.error('Registration error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

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

  const getFieldsForStep = (step: number): (keyof ProviderFormData | `contact_info.${keyof ProviderFormData['contact_info']}`)[] => {
    switch (step) {
      case 0: return ['business_name', 'business_type', 'description', 'location']
      case 1: return ['contact_info.phone', 'contact_info.email', 'contact_info.address', 'contact_info.website']
      case 2: return ['services']
      case 3: return []
      default: return []
    }
  }

  const addService = () => {
    if (newService.name && newService.price > 0 && newService.description) {
      const services = [...(watchedValues.services || []), {
        ...newService,
        capacity: newService.capacity || undefined
      }]
      setValue('services', services)
      setNewService({ name: '', price: 0, description: '', duration: '', capacity: undefined })
    }
  }

  const removeService = (index: number) => {
    const services = watchedValues.services?.filter((_, i) => i !== index) || []
    setValue('services', services)
  }

  const addAmenity = (amenity: string) => {
    const amenities = [...(watchedValues.amenities || []), amenity]
    setValue('amenities', amenities)
  }

  const removeAmenity = (amenity: string) => {
    const amenities = watchedValues.amenities?.filter(a => a !== amenity) || []
    setValue('amenities', amenities)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Business Information</h3>
              <p className="text-sm text-gray-600 mb-6">
                Tell us about your business and what services you offer
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  {...register('business_name')}
                  placeholder="Enter your business name"
                />
                {errors.business_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.business_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="business_type">Business Type</Label>
                <Select
                  value={watchedValues.business_type}
                  onValueChange={(value) => setValue('business_type', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <div>
                            <div>{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.business_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.business_type.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="City, Province"
                    className="pl-10"
                  />
                </div>
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe your business, services, and what makes you unique..."
                  rows={4}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
              <p className="text-sm text-gray-600 mb-6">
                How can customers and travelers reach you?
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    {...register('contact_info.phone')}
                    placeholder="+94 XX XXX XXXX"
                    className="pl-10"
                  />
                </div>
                {errors.contact_info?.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact_info.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    {...register('contact_info.email')}
                    placeholder="business@example.com"
                    className="pl-10"
                  />
                </div>
                {errors.contact_info?.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact_info.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  {...register('contact_info.address')}
                  placeholder="Complete business address including street, city, and postal code"
                  rows={3}
                />
                {errors.contact_info?.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact_info.address.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  {...register('contact_info.website')}
                  placeholder="https://your-website.com"
                />
                {errors.contact_info?.website && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact_info.website.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Services & Pricing</h3>
              <p className="text-sm text-gray-600 mb-6">
                List the services you offer with pricing information
              </p>
            </div>

            {/* Add New Service */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="service_name">Service Name</Label>
                    <Input
                      id="service_name"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      placeholder="e.g., Deluxe Room, City Tour, Diving Course"
                    />
                  </div>
                  <div>
                    <Label htmlFor="service_price">Price (LKR)</Label>
                    <Input
                      id="service_price"
                      type="number"
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="service_duration">Duration (Optional)</Label>
                    <Input
                      id="service_duration"
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                      placeholder="e.g., 2 hours, Full day, Per night"
                    />
                  </div>
                  <div>
                    <Label htmlFor="service_capacity">Capacity (Optional)</Label>
                    <Input
                      id="service_capacity"
                      type="number"
                      value={newService.capacity || ''}
                      onChange={(e) => setNewService({ ...newService, capacity: parseInt(e.target.value) || undefined })}
                      placeholder="Max people"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="service_description">Service Description</Label>
                  <Textarea
                    id="service_description"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder="Describe what's included in this service..."
                    rows={2}
                  />
                </div>
                <Button type="button" onClick={addService} disabled={!newService.name || !newService.description || newService.price <= 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </CardContent>
            </Card>

            {/* Services List */}
            {watchedValues.services && watchedValues.services.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Your Services ({watchedValues.services.length})</h4>
                <div className="space-y-2">
                  {watchedValues.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h5 className="font-medium">{service.name}</h5>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>LKR {service.price.toLocaleString()}</span>
                          {service.duration && <span>{service.duration}</span>}
                          {service.capacity && <span>Max {service.capacity} people</span>}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeService(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errors.services && (
              <p className="text-red-500 text-sm">{errors.services.message}</p>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Amenities & Features</h3>
              <p className="text-sm text-gray-600 mb-6">
                Select amenities and features that apply to your business
              </p>
            </div>

            {/* Common Amenities */}
            <div>
              <h4 className="font-medium mb-3">Common Amenities</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {COMMON_AMENITIES.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={watchedValues.amenities?.includes(amenity)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          addAmenity(amenity)
                        } else {
                          removeAmenity(amenity)
                        }
                      }}
                    />
                    <Label htmlFor={amenity} className="text-sm cursor-pointer">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Amenity */}
            <div>
              <h4 className="font-medium mb-3">Add Custom Amenity</h4>
              <div className="flex gap-2">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Enter custom amenity"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (newAmenity.trim() && !watchedValues.amenities?.includes(newAmenity.trim())) {
                      addAmenity(newAmenity.trim())
                      setNewAmenity('')
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Selected Amenities */}
            {watchedValues.amenities && watchedValues.amenities.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Selected Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {watchedValues.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Review Information */}
            <Alert>
              <Building className="h-4 w-4" />
              <AlertDescription>
                Your registration will be reviewed by our team. You'll receive an email notification once your account is approved and you can start receiving bookings.
              </AlertDescription>
            </Alert>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join AgentCeylon as a Service Provider
          </h1>
          <p className="text-xl text-gray-600">
            Connect with travelers and grow your business in Sri Lanka's tourism industry
          </p>
        </div>

        <Card className="mx-auto">
          <CardHeader>
            <CardTitle>Service Provider Registration</CardTitle>
            <CardDescription>
              Complete all steps to register your business with AgentCeylon
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
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Registration
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}