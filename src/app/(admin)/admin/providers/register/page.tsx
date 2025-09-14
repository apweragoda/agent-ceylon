'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ProviderRegistrationForm } from '@/components/forms/provider-registration-form'

export default function ProviderRegistrationPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/providers">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Providers
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Register Service Provider</h1>
          <p className="text-gray-600 mt-2">
            Add a new service provider to the platform
          </p>
        </div>
      </div>

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Registration</CardTitle>
          <CardDescription>
            Complete all steps to register a new service provider on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderRegistrationForm />
        </CardContent>
      </Card>
    </div>
  )
}