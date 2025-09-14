'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { ComponentLoader } from '@/components/ui/loading-spinner'
import { 
  MapPin, 
  Calendar, 
  Star, 
  Users, 
  CreditCard, 
  Settings,
  Heart,
  Clock,
  TrendingUp,
  Compass
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'

interface User {
  id: string
  email: string
  full_name: string
  user_type: string
}

interface Booking {
  id: string
  tour: {
    title: string
    location: string
    price: number
    duration: number
  }
  participants: number
  booking_date: string
  status: string
  total_amount: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) return

      // Load user data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (userData) {
        setUser(userData)
      }

      // Load bookings with tour details
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          tour:tours(title, location, price, duration)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setBookings(bookingsData || [])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
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
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return <ComponentLoader message="Loading your dashboard..." />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.full_name || 'Traveler'}! 👋
        </h1>
        <p className="text-gray-600">
          Here's an overview of your Sri Lankan adventure journey
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tours</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
            <p className="text-xs text-muted-foreground">Confirmed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(bookings.reduce((sum, booking) => sum + booking.total_amount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Type</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user?.user_type}</div>
            <p className="text-xs text-muted-foreground">Membership level</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>
              Your latest tour bookings and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <EmptyState
                icon={<Compass className="h-12 w-12" />}
                title="No bookings yet"
                description="Start exploring our amazing tours and book your first Sri Lankan adventure!"
                action={{
                  label: "Browse Tours",
                  onClick: () => window.location.href = '/tours'
                }}
              />
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-semibold">{booking.tour.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {booking.tour.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(booking.booking_date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {booking.participants} people
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <div className="font-semibold">
                        {formatPrice(booking.total_amount)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {bookings.length > 0 && (
                  <div className="text-center pt-4">
                    <Link href="/bookings">
                      <Button variant="outline">View All Bookings</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/preferences">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <Heart className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <h3 className="font-semibold">Update Preferences</h3>
                  <p className="text-sm text-gray-600">Get better recommendations</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tours">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <Compass className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <h3 className="font-semibold">Browse Tours</h3>
                  <p className="text-sm text-gray-600">Discover new adventures</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <Settings className="h-8 w-8 text-gray-500 mr-3" />
                <div>
                  <h3 className="font-semibold">Account Settings</h3>
                  <p className="text-sm text-gray-600">Manage your profile</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/support">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <h3 className="font-semibold">Get Help</h3>
                  <p className="text-sm text-gray-600">Contact support team</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}