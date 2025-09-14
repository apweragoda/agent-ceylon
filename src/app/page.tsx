import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Users, Star, Camera } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">Agent</span><span className="text-green-600">Ceylon</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover the breathtaking beauty of Sri Lanka with personalized tour recommendations. 
            From ancient temples to pristine beaches, from mountain peaks to wildlife safaris - 
            let us create your perfect Sri Lankan adventure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/preferences">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                Plan My Trip
              </Button>
            </Link>
            <Link href="/tours">
              <Button size="lg" variant="outline" className="px-8 py-3">
                Browse Tours
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose AgentCeylon?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Island-wide Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Explore every corner of Sri Lanka with our comprehensive network of local partners
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Personalized Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get tailored recommendations based on your preferences, budget, and travel style
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <CardTitle>Verified Partners</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All our hotels, restaurants, and service providers are carefully vetted and rated
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Camera className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Unforgettable Moments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create lasting memories with expertly curated experiences and hidden gems
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Popular Destinations in Sri Lanka
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative rounded-lg overflow-hidden h-64 bg-gradient-to-br from-blue-400 to-blue-600">
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Sigiriya</h3>
                  <p className="text-sm">Ancient rock fortress and UNESCO World Heritage site</p>
                </div>
              </div>
            </div>
            
            <div className="relative rounded-lg overflow-hidden h-64 bg-gradient-to-br from-green-400 to-green-600">
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Kandy</h3>
                  <p className="text-sm">Cultural capital with the Temple of the Sacred Tooth</p>
                </div>
              </div>
            </div>
            
            <div className="relative rounded-lg overflow-hidden h-64 bg-gradient-to-br from-orange-400 to-orange-600">
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Galle</h3>
                  <p className="text-sm">Historic Dutch fort city on the southern coast</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Explore Sri Lanka?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start your journey with our personalized preference questionnaire. 
            It takes just 2 minutes to get customized tour recommendations.
          </p>
          <Link href="/preferences">
            <Button size="lg" variant="secondary" className="px-8 py-3">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Our Travelers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "AgentCeylon made our honeymoon unforgettable! The personalized recommendations were spot-on, and every detail was perfectly planned."
                </p>
                <div className="font-semibold">Sarah & Mark</div>
                <div className="text-sm text-gray-500">United Kingdom</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "The cultural tour exceeded all expectations. Our guide was knowledgeable, and the hidden gems we discovered were incredible!"
                </p>
                <div className="font-semibold">Hiroshi Tanaka</div>
                <div className="text-sm text-gray-500">Japan</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "Perfect for adventure seekers! The diving experiences and wildlife safaris were absolutely breathtaking. Highly recommended!"
                </p>
                <div className="font-semibold">Emma Johnson</div>
                <div className="text-sm text-gray-500">Australia</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
