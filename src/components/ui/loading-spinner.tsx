import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-blue-600', sizeClasses[size], className)} />
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
          <p className="text-gray-600">Please wait while we prepare your experience</p>
        </div>
      </div>
    </div>
  )
}

export function ComponentLoader({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center space-y-3">
        <LoadingSpinner />
        {message && (
          <p className="text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  )
}