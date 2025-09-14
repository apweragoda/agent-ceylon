'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Database, Download, Trash2, CheckCircle, AlertCircle, Info } from 'lucide-react'

export default function SeedDataPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const seedTours = async () => {
    setIsSeeding(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/seed/tours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed tours')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSeeding(false)
    }
  }

  const deleteAllTours = async () => {
    if (!confirm('Are you sure you want to delete ALL tours? This action cannot be undone!')) {
      return
    }

    setIsDeleting(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/seed/tours', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete tours')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Seed Sample Data</h1>
        <p className="text-gray-600 mt-2">
          Manage sample data for testing and demonstration purposes
        </p>
      </div>

      {/* Warning Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Warning:</strong> This page is for development and testing purposes only. 
          Use with caution in production environments.
        </AlertDescription>
      </Alert>

      {/* Tours Seeding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Sample Tours
          </CardTitle>
          <CardDescription>
            Add sample tour data to showcase the platform features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Tour Collection</h3>
              <p className="text-sm text-gray-600">
                12 diverse tours across different categories including cultural, adventure, 
                wildlife, beach, diving, food, photography, and spiritual experiences
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">Cultural</Badge>
                <Badge variant="outline">Adventure</Badge>
                <Badge variant="outline">Wildlife</Badge>
                <Badge variant="outline">Beach</Badge>
                <Badge variant="outline">Diving</Badge>
                <Badge variant="outline">Food</Badge>
                <Badge variant="outline">Photography</Badge>
                <Badge variant="outline">Spiritual</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={seedTours}
                disabled={isSeeding}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isSeeding ? 'Seeding...' : 'Seed Tours'}
              </Button>
              <Button
                onClick={deleteAllTours}
                disabled={isDeleting}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete All'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Success:</strong> {result.message}
            {result.tours && (
              <div className="mt-2">
                <p className="text-sm">Added tours:</p>
                <ul className="text-sm list-disc list-inside">
                  {result.tours.slice(0, 5).map((tour: any) => (
                    <li key={tour.id}>{tour.title}</li>
                  ))}
                  {result.tours.length > 5 && (
                    <li>... and {result.tours.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium">Sample Tour Features:</h4>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                <li>Realistic pricing in LKR (Sri Lankan Rupees)</li>
                <li>Detailed itineraries and descriptions</li>
                <li>High-quality placeholder images from Unsplash</li>
                <li>Various duration options (1-3 days)</li>
                <li>Different group sizes and categories</li>
                <li>Authentic Sri Lankan destinations</li>
                <li>Ratings and review counts for testing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Usage Notes:</h4>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                <li>Tours will be assigned to the first active service provider</li>
                <li>If no providers exist, tours will have null provider_id</li>
                <li>Seeding is skipped if tours already exist in the database</li>
                <li>Images are hosted externally and may load slowly initially</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}