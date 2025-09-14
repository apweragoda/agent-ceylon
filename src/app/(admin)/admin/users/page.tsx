'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ComponentLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { 
  Users, 
  Search,
  Filter,
  MoreVertical,
  Mail,
  Calendar,
  MapPin
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createSupabaseClient } from '@/lib/supabase/client'

interface User {
  id: string
  email: string
  full_name: string
  phone: string | null
  country: string | null
  user_type: string
  created_at: string
  updated_at: string
  bookings?: { length: number }[]
  service_providers?: { business_name: string }[]
}

const USER_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'tourist', label: 'Tourist' },
  { value: 'provider', label: 'Provider' },
  { value: 'admin', label: 'Admin' }
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserType, setSelectedUserType] = useState('all')
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, selectedUserType])

  const loadUsers = async () => {
    try {
      // Get users with booking counts and provider info
      const { data: usersData, error } = await supabase
        .from('users')
        .select(`
          *,
          bookings(id),
          service_providers(business_name)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading users:', error)
        return
      }

      setUsers(usersData || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.country && user.country.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // User type filter
    if (selectedUserType !== 'all') {
      filtered = filtered.filter(user => user.user_type === selectedUserType)
    }

    setFilteredUsers(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'provider': return 'bg-blue-100 text-blue-800'
      case 'tourist': return 'bg-green-100 text-green-800'
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
    return <ComponentLoader message="Loading users..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600 mt-2">
          Manage all users on the platform
        </p>
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
                placeholder="Search users by name, email, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedUserType} onValueChange={setSelectedUserType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="User Type" />
              </SelectTrigger>
              <SelectContent>
                {USER_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
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
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-sm text-gray-600">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.user_type === 'tourist').length}
            </div>
            <p className="text-sm text-gray-600">Tourists</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.user_type === 'provider').length}
            </div>
            <p className="text-sm text-gray-600">Providers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.user_type === 'admin').length}
            </div>
            <p className="text-sm text-gray-600">Admins</p>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No users found"
          description="Try adjusting your search criteria."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>
              All registered users on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {getInitials(user.full_name)}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{user.full_name}</h3>
                        <Badge className={getUserTypeColor(user.user_type)}>
                          {user.user_type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        
                        {user.country && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {user.country}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined {formatDate(user.created_at)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        {user.user_type === 'tourist' && (
                          <span>
                            {user.bookings?.length || 0} bookings
                          </span>
                        )}
                        
                        {user.user_type === 'provider' && user.service_providers && user.service_providers.length > 0 && (
                          <span>
                            Business: {user.service_providers[0].business_name}
                          </span>
                        )}
                        
                        {user.phone && (
                          <span>Phone: {user.phone}</span>
                        )}
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
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          View Bookings
                        </DropdownMenuItem>
                        {user.user_type !== 'admin' && (
                          <DropdownMenuItem className="text-red-600">
                            Suspend User
                          </DropdownMenuItem>
                        )}
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