'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ComponentLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Search,
  Plus,
  Edit,
  Eye,
  MoreVertical,
  Filter
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  created_at: string
  service_providers: {
    business_name: string
    user_id: string
  }
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

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
]

export default function AdminToursPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [filteredTours, setFilteredTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadTours()
  }, [])

  useEffect(() => {
    filterTours()
  }, [tours, searchQuery, selectedCategory, selectedStatus])

  const loadTours = async () => {
    try {
      const { data, error } = await supabase
        .from('tours')
        .select(`
          *,
          service_providers (
            business_name,
            user_id
          )
        `)
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

  const filterTours = () => {
    let filtered = [...tours]

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(tour =>
        tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.service_providers.business_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tour => tour.category === selectedCategory)
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(tour => 
        selectedStatus === 'active' ? tour.is_active : !tour.is_active
      )
    }

    setFilteredTours(filtered)
  }

  const handleToggleStatus = async (tourId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tours')
        .update({ is_active: !currentStatus })
        .eq('id', tourId)

      if (error) {
        console.error('Error updating tour status:', error)
        return
      }

      // Reload tours
      await loadTours()
    } catch (error) {
      console.error('Error updating tour status:', error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return <ComponentLoader message="Loading tours..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tours Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all tours on the platform
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Tour
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tours, locations, providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
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
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{tours.length}</div>
            <p className="text-sm text-gray-600">Total Tours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {tours.filter(t => t.is_active).length}
            </div>
            <p className="text-sm text-gray-600">Active Tours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {tours.filter(t => !t.is_active).length}
            </div>
            <p className="text-sm text-gray-600">Inactive Tours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {tours.reduce((sum, t) => sum + t.reviews_count, 0)}
            </div>
            <p className="text-sm text-gray-600">Total Reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Tours List */}
      {filteredTours.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-12 w-12" />}
          title="No tours found"
          description="Try adjusting your search criteria or add a new tour."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => (
            <Card key={tour.id} className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 relative">
                {tour.images[0] ? (
                  <img
                    src={tour.images[0]}
                    alt={tour.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <MapPin className="h-8 w-8" />
                  </div>
                )}
                
                <div className="absolute top-3 left-3">
                  <Badge 
                    className={tour.is_active ? 'bg-green-500' : 'bg-red-500'}
                  >
                    {tour.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="bg-white/90 hover:bg-white">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Tour
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleToggleStatus(tour.id, tour.is_active)}
                      >
                        {tour.is_active ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-lg line-clamp-1">{tour.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{tour.description}</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      {tour.location}
                    </div>
                    <Badge variant="outline">{tour.category}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-3 w-3 mr-1" />
                      {tour.duration} days
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-3 w-3 mr-1" />
                      Max {tour.max_participants}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                      {tour.rating} ({tour.reviews_count})
                    </div>
                    <div className="font-semibold text-blue-600">
                      {formatPrice(tour.price)}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 border-t pt-3">
                  <div>Provider: {tour.service_providers.business_name}</div>
                  <div>Created: {formatDate(tour.created_at)}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}