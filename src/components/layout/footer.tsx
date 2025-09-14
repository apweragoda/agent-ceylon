import Link from 'next/link'
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">
                <span className="text-blue-400">Agent</span>
                <span className="text-green-400">Ceylon</span>
              </span>
            </div>
            <p className="text-gray-400">
              Your gateway to authentic Sri Lankan experiences. Discover the pearl of the Indian Ocean with personalized tours and verified local partners.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-pink-400 cursor-pointer transition-colors" />
              <Youtube className="h-5 w-5 text-gray-400 hover:text-red-400 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/tours" className="hover:text-white transition-colors">
                  Browse Tours
                </Link>
              </li>
              <li>
                <Link href="/preferences" className="hover:text-white transition-colors">
                  Get Recommendations
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="hover:text-white transition-colors">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* For Partners */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">For Partners</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/register?type=provider" className="hover:text-white transition-colors">
                  Become a Partner
                </Link>
              </li>
              <li>
                <Link href="/partner-dashboard" className="hover:text-white transition-colors">
                  Partner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-white transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors">
                  Partner Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>hello@agentceylon.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+94 11 234 5678</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-1" />
                <span>123 Galle Road<br />Colombo 03, Sri Lanka</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 AgentCeylon. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}