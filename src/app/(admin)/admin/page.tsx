'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ComponentLoader } from '@/components/ui/loading-spinner'
import { 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Building,
  Star,
  AlertCircle
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'

interface DashboardStats {
  totalUsers: number
  totalTours: number
  totalBookings: number
  totalRevenue: number
  activeProviders: number
  pendingReviews: number
  recentBookings: any[]
  topTours: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      // Load all stats in parallel
      const [
        usersResult,
        toursResult,
        bookingsResult,
        providersResult,
        reviewsResult,
        recentBookingsResult,
        topToursResult
      ] = await Promise.all([
        // Total users
        supabase.from('users').select('id', { count: 'exact', head: true }),
        
        // Total tours
        supabase.from('tours').select('id', { count: 'exact', head: true }).eq('is_active', true),
        
        // Total bookings and revenue
        supabase.from('bookings').select('total_amount, status'),
        
        // Active providers
        supabase.from('service_providers').select('id', { count: 'exact', head: true }).eq('is_active', true),
        
        // Pending reviews
        supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('is_verified', false),
        
        // Recent bookings
        supabase
          .from('bookings')
          .select(`
            *,
            users (full_name, email),
            tours (title, location)
          `)
          .order('created_at', { ascending: false })
          .limit(5),
          
        // Top rated tours
        supabase
          .from('tours')
          .select('id, title, location, rating, reviews_count, price')
          .eq('is_active', true)
          .order('rating', { ascending: false })
          .limit(5)
      ])

      // Calculate stats
      const totalUsers = usersResult.count || 0
      const totalTours = toursResult.count || 0
      const bookingsData = bookingsResult.data || []
      const totalBookings = bookingsData.length
      const totalRevenue = bookingsData
        .filter(booking => booking.status === 'completed')
        .reduce((sum, booking) => sum + (booking.total_amount || 0), 0)
      const activeProviders = providersResult.count || 0
      const pendingReviews = reviewsResult.count || 0

      setStats({
        totalUsers,
        totalTours,
        totalBookings,
        totalRevenue,
        activeProviders,
        pendingReviews,
        recentBookings: recentBookingsResult.data || [],
        topTours: topToursResult.data || []
      })

    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return <ComponentLoader message="Loading admin dashboard..." />
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load dashboard data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of your AgentCeylon platform performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tours</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTours}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +23% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +18% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <Building className="h-4 w-4 mr-2 text-blue-600" />
              Active Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProviders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <Star className="h-4 w-4 mr-2 text-green-600" />
              Platform Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-gray-500">Based on all reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest booking activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{booking.tours?.title}</p>
                    <p className="text-xs text-gray-600">{booking.users?.full_name}</p>
                    <p className="text-xs text-gray-500">{formatDate(booking.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                    <p className="text-sm font-medium mt-1">
                      {formatCurrency(booking.total_amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Tours */}
        <Card>
          <CardHeader>
            <CardTitle>Top Rated Tours</CardTitle>
            <CardDescription>Highest rated tours on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topTours.map((tour, index) => (
                <div key={tour.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tour.title}</p>
                      <p className="text-xs text-gray-600">{tour.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">{tour.rating}</span>
                      <span className="text-gray-500 ml-1">({tour.reviews_count})</span>
                    </div>
                    <p className="text-xs text-gray-600">{formatCurrency(tour.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}