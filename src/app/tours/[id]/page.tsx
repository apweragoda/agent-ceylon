'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ComponentLoader } from '@/components/ui/loading-spinner'
import { BookingForm } from '@/components/features/booking-form'
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Calendar,
  CheckCircle,
  ArrowLeft,
  Camera,
  Utensils,
  Car,
  Shield,
  Heart,
  Share2
} from 'lucide-react'
import { formatCurrency } from '@/lib/stripe/config'
import { createSupabaseClient } from '@/lib/supabase/client'

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
  is_active: boolean
  itinerary: string[]
  inclusions: string[]
  exclusions: string[]
  service_providers: {
    business_name: string
    phone: string
    email: string
  }
}

export default function TourDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tour, setTour] = useState<Tour | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (params.id) {
      loadTour(params.id as string)
    }
  }, [params.id])

  const loadTour = async (tourId: string) => {
    try {
      const { data, error } = await supabase
        .from('tours')
        .select(`
          *,
          service_providers (
            business_name,
            phone,
            email
          )
        `)
        .eq('id', tourId)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Tour not found')
        } else {
          setError('Failed to load tour details')
        }
        return
      }

      // Parse JSON fields
      const tourData = {
        ...data,
        itinerary: typeof data.itinerary === 'string' ? JSON.parse(data.itinerary) : data.itinerary || [],
        inclusions: typeof data.inclusions === 'string' ? JSON.parse(data.inclusions) : data.inclusions || [],
        exclusions: typeof data.exclusions === 'string' ? JSON.parse(data.exclusions) : data.exclusions || [],
        images: typeof data.images === 'string' ? JSON.parse(data.images) : data.images || []
      }

      setTour(tourData)
    } catch (error) {
      console.error('Error loading tour:', error)
      setError('Failed to load tour details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookingComplete = (booking: any) => {
    setShowBookingForm(false)
    router.push(`/dashboard/bookings/${booking.id}`)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tour?.title,
          text: tour?.description,
          url: window.location.href
        })
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (isLoading) {
    return <ComponentLoader message="Loading tour details..." />
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tour Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/tours')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tours
          </Button>
        </div>
      </div>
    )
  }

  if (showBookingForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setShowBookingForm(false)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tour Details
            </Button>
          </div>
          <BookingForm 
            tour={tour}
            onBookingComplete={handleBookingComplete}
            onCancel={() => setShowBookingForm(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <div className="lg:col-span-3">
            <div className="aspect-video rounded-lg overflow-hidden mb-4">
              <Image
                src={tour.images[selectedImageIndex] || '/placeholder-tour.jpg'}
                alt={tour.title}
                width={800}
                height={450}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {tour.images.slice(0, 4).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-video rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${tour.title} ${index + 1}`}
                    width={200}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{formatCurrency(tour.price)}</CardTitle>
                    <CardDescription>per person</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsWishlisted(!isWishlisted)}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium">{tour.rating}</span>
                    </div>
                    <span className="text-gray-600">({tour.reviews_count} reviews)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-500 mr-2" />
                      {tour.duration} day(s)
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-500 mr-2" />
                      Max {tour.max_participants}
                    </div>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => setShowBookingForm(true)}
                  >
                    Book Now
                  </Button>

                  <div className="text-center text-sm text-gray-500">
                    Free cancellation up to 24 hours before
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tour Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline">{tour.category}</Badge>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {tour.location}
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{tour.title}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{tour.description}</p>
            </div>

            {/* Itinerary */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Itinerary</h2>
                <div className="space-y-4">
                  {tour.itinerary.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                      </div>
                      <p className="text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What's Included */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tour.inclusions && tour.inclusions.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Included</h3>
                  <div className="space-y-2">
                    {tour.inclusions.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tour.exclusions && tour.exclusions.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Not Included</h3>
                  <div className="space-y-2">
                    {tour.exclusions.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tour Operator */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tour Operator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-semibold">{tour.service_providers.business_name}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Verified operator</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>4.8/5 rating</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-blue-500" />
                    <span className="text-sm">Photo opportunities</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Utensils className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Local cuisine</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-purple-500" />
                    <span className="text-sm">Transportation included</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-orange-500" />
                    <span className="text-sm">Small group experience</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Cancellation:</span>
                    <p className="text-gray-600">Free cancellation up to 24 hours before the tour</p>
                  </div>
                  <div>
                    <span className="font-medium">Payment:</span>
                    <p className="text-gray-600">Secure payment via Stripe</p>
                  </div>
                  <div>
                    <span className="font-medium">Confirmation:</span>
                    <p className="text-gray-600">Instant confirmation via email</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}