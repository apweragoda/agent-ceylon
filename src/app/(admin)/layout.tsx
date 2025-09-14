'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ComponentLoader } from '@/components/ui/loading-spinner'
import { 
  LayoutDashboard, 
  MapPin, 
  Building, 
  Calendar, 
  Users, 
  BarChart3,
  Settings,
  Menu,
  X,
  Database
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'

interface User {
  id: string
  email: string
  full_name: string
  user_type: string
}

const adminNavItems = [
  {
    href: '/admin',
    icon: LayoutDashboard,
    label: 'Dashboard',
    description: 'Overview and statistics'
  },
  {
    href: '/admin/tours',
    icon: MapPin,
    label: 'Tours',
    description: 'Manage tour listings'
  },
  {
    href: '/admin/providers',
    icon: Building,
    label: 'Providers',
    description: 'Service provider management'
  },
  {
    href: '/admin/bookings',
    icon: Calendar,
    label: 'Bookings',
    description: 'Booking management'
  },
  {
    href: '/admin/users',
    icon: Users,
    label: 'Users',
    description: 'User management'
  },
  {
    href: '/admin/analytics',
    icon: BarChart3,
    label: 'Analytics',
    description: 'Reports and insights'
  },
  {
    href: '/admin/seed',
    icon: Database,
    label: 'Seed Data',
    description: 'Sample data management'
  }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!userData || userData.user_type !== 'admin') {
        router.push('/dashboard')
        return
      }

      setUser(userData)
    } catch (error) {
      console.error('Admin auth check error:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <ComponentLoader message="Verifying admin access..." />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">
                  <span className="text-blue-600">Agent</span>
                  <span className="text-green-600">Ceylon</span>
                </h1>
                <Badge variant="secondary" className="mt-1 text-xs">
                  Admin Panel
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors group"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5 text-gray-500 group-hover:text-blue-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-blue-600">
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Link href="/dashboard" className="block mt-3">
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    User Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Admin Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}