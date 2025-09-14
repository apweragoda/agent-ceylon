'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function SetupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [hasAdmin, setHasAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    checkForExistingAdmin()
  }, [])

  const checkForExistingAdmin = async () => {
    try {
      const response = await fetch('/api/users?user_type=admin&limit=1')
      if (response.ok) {
        const data = await response.json()
        setHasAdmin(data.data && data.data.length > 0)
      }
    } catch (error) {
      console.error('Error checking for admin:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('All fields are required')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)

    try {
      // Create admin user via API
      const response = await fetch('/api/setup/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin user')
      }

      setSuccess(`Admin user created successfully! You can now login with email: ${formData.email}`)
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
      })

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Checking system setup...</p>
        </div>
      </div>
    )
  }

  if (hasAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle>System Already Set Up</CardTitle>
            <CardDescription>
              An admin user already exists for this system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  The system is properly configured. You can proceed to login.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => router.push('/login')} 
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <CardTitle>
            <span className="text-blue-600">Agent</span>
            <span className="text-green-600">Ceylon</span> Setup
          </CardTitle>
          <CardDescription>
            Create the first admin user to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Admin User"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@agentceylon.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter a secure password"
                required
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {success}
                  <div className="mt-2 text-sm">
                    Redirecting to login page...
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin User...
                </>
              ) : (
                'Create Admin User'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              This will create the first admin user for your AgentCeylon platform
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}