'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { ComponentLoader } from '@/components/ui/loading-spinner'
import { Search, MapPin, Clock, Users, Star, Filter, Compass } from 'lucide-react'
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
}

const TOUR_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'beach', label: 'Beach & Relaxation' },
  { value: 'wildlife', label: 'Wildlife & Nature' },
  { value: 'diving', label: 'Diving & Snorkeling' },
  { value: 'food', label: 'Food & Culinary' },
  { value: 'photography', label: 'Photography' },
  { value: 'spiritual', label: 'Spiritual & Wellness' }
]

const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'duration_asc', label: 'Duration: Short to Long' },
  { value: 'duration_desc', label: 'Duration: Long to Short' }
]

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [filteredTours, setFilteredTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('rating')
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadTours()
  }, [])

  useEffect(() => {
    filterAndSortTours()
  }, [tours, searchQuery, selectedCategory, sortBy])

  const loadTours = async () => {
    try {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading tours:', error)
        return
      }

      setTours(data || [])
    } catch (error) {
      console.error('Error loading tours:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortTours = () => {
    let filtered = [...tours]

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(tour =>
        tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tour => tour.category === selectedCategory)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price
        case 'price_desc':
          return b.price - a.price
        case 'duration_asc':
          return a.duration - b.duration
        case 'duration_desc':
          return b.duration - a.duration
        case 'rating':
        default:
          return b.rating - a.rating
      }
    })

    setFilteredTours(filtered)
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
      <div className="min-h-screen bg-gray-50">
        <ComponentLoader message="Loading amazing tours for you..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Sri Lanka
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Explore handcrafted tours that showcase the best of our beautiful island nation
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg p-4 shadow-lg max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search tours, destinations, activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-gray-900"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px] text-gray-900">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TOUR_CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] text-gray-900">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredTours.length} {filteredTours.length === 1 ? 'Tour' : 'Tours'} Found
          </h2>
          {(searchQuery || selectedCategory !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {filteredTours.length === 0 ? (
          <EmptyState
            icon={<Compass className="h-12 w-12" />}
            title="No tours found"
            description="Try adjusting your search criteria or browse all categories to find the perfect tour for you."
            action={{
              label: "Browse All Tours",
              onClick: () => {
                setSearchQuery('')
                setSelectedCategory('all')
              }
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTours.map((tour) => (
              <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 relative">
                  {tour.images[0] ? (
                    <img
                      src={tour.images[0]}
                      alt={tour.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <MapPin className="h-8 w-8 mx-auto mb-2" />
                        <span className="text-sm">Beautiful Sri Lanka</span>
                      </div>
                    </div>
                  )}
                  
                  <Badge className="absolute top-3 left-3 bg-white/90 text-gray-900 hover:bg-white">
                    {tour.category}
                  </Badge>
                </div>
                
                <CardHeader>
                  <CardTitle className="line-clamp-2">{tour.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {tour.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{tour.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{tour.duration} days</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Max {tour.max_participants}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{tour.rating}</span>
                      </div>
                      <span className="text-gray-600">
                        ({tour.reviews_count} {tour.reviews_count === 1 ? 'review' : 'reviews'})
                      </span>
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}