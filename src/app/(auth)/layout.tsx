import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold">
              <span className="text-blue-600">Agent</span>
              <span className="text-green-600">Ceylon</span>
            </h1>
          </Link>
          <p className="text-gray-600 mt-2">Your gateway to Sri Lankan adventures</p>
        </div>
        {children}
      </div>
    </div>
  )
}