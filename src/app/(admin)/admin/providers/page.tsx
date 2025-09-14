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
  Building, 
  Search,
  Plus,
  MapPin,
  Phone,
  Mail,
  Star,
  Users,
  MoreVertical,
  Filter,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createSupabaseClient } from '@/lib/supabase/client'

interface ServiceProvider {
  id: string
  user_id: string
  business_name: string
  business_type: string
  description: string
  phone: string
  email: string
  address: string
  city: string
  website: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  users: {
    full_name: string
    email: string
  }
}

const BUSINESS_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'tour_operator', label: 'Tour Operator' },
  { value: 'transport', label: 'Transport' },
  { value: 'activity', label: 'Activity Provider' }
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
]

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBusinessType, setSelectedBusinessType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadProviders()
  }, [])

  useEffect(() => {
    filterProviders()
  }, [providers, searchQuery, selectedBusinessType, selectedStatus])

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select(`
          *,
          users (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading providers:', error)
        return
      }

      setProviders(data || [])
    } catch (error) {
      console.error('Error loading providers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterProviders = () => {
    let filtered = [...providers]

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(provider =>
        provider.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.business_type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Business type filter
    if (selectedBusinessType !== 'all') {
      filtered = filtered.filter(provider => provider.business_type === selectedBusinessType)
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(provider => 
        selectedStatus === 'active' ? provider.is_active : !provider.is_active
      )
    }

    setFilteredProviders(filtered)
  }

  const handleToggleStatus = async (providerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('service_providers')
        .update({ is_active: !currentStatus })
        .eq('id', providerId)

      if (error) {
        console.error('Error updating provider status:', error)
        return
      }

      await loadProviders()
    } catch (error) {
      console.error('Error updating provider status:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getBusinessTypeColor = (type: string) => {
    switch (type) {
      case 'hotel': return 'bg-blue-100 text-blue-800'
      case 'restaurant': return 'bg-orange-100 text-orange-800'
      case 'tour_operator': return 'bg-green-100 text-green-800'
      case 'transport': return 'bg-purple-100 text-purple-800'
      case 'activity': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return <ComponentLoader message="Loading service providers..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Providers</h1>
          <p className="text-gray-600 mt-2">
            Manage service providers and their registrations
          </p>
        </div>
        <Link href="/admin/providers/register">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Button>
        </Link>
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
                placeholder="Search providers by name, email, city, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedBusinessType} onValueChange={setSelectedBusinessType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Business Type" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
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
            <div className="text-2xl font-bold">{providers.length}</div>
            <p className="text-sm text-gray-600">Total Providers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {providers.filter(p => p.is_active).length}
            </div>
            <p className="text-sm text-gray-600">Active Providers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {providers.filter(p => !p.is_active).length}
            </div>
            <p className="text-sm text-gray-600">Inactive Providers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {new Set(providers.map(p => p.business_type)).size}
            </div>
            <p className="text-sm text-gray-600">Business Types</p>
          </CardContent>
        </Card>
      </div>

      {/* Providers List */}
      {filteredProviders.length === 0 ? (
        <EmptyState
          icon={<Building className="h-12 w-12" />}
          title="No providers found"
          description="Try adjusting your search criteria or add a new provider."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Providers ({filteredProviders.length})</CardTitle>
            <CardDescription>
              All registered service providers on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProviders.map((provider) => (
                <div 
                  key={provider.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {getInitials(provider.business_name)}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{provider.business_name}</h3>
                        <Badge className={getBusinessTypeColor(provider.business_type)}>
                          {provider.business_type.replace('_', ' ')}
                        </Badge>
                        {provider.is_active ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {provider.email}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {provider.phone}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {provider.city}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {provider.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Owner: {provider.users.full_name}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Registered: {formatDate(provider.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Edit Provider
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          View Services
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleStatus(provider.id, provider.is_active)}
                        >
                          {provider.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}