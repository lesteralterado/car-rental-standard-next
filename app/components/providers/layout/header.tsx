'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Car, Phone, Mail, User, LogOut } from 'lucide-react'
import useAuth from '@/hooks/useAuth'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Cars', href: '/cars' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const handleLogout = () => {
    // Clear demo user
    localStorage.removeItem('demo_user')
    // Sign out from Supabase
    // Note: You might need to import and use the client here
    window.location.reload()
  }

  return (
    <>
      {/* Promo Banner */}
      <div className="promo-banner bg-gray-900 text-white py-2 px-4 text-center text-sm">
        <p>🚗 <strong>Special Offer:</strong> Book now and get 20% off your first rental! Use code: FIRST20</p>
      </div>

      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-primary rounded-lg group-hover:bg-primary/90 transition-colors">
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                CarRental <span className="text-primary">Pro</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </Link>
              ))}
            </nav>

            {/* Contact Info & CTA */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>+63 123 456 7890</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>info@carrentalpro.com</span>
                </div>
              </div>

              {isMounted && user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-gray-700">
                      {(user as any)?.email === 'demo@example.com' ? 'Demo User' : ((user as any)?.email || 'User')}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/booking"
                  className="btn btn-primary btn-default"
                >
                  Book Now
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:text-primary hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-white rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>+63 123 456 7890</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>info@carrentalpro.com</span>
                  </div>
                </div>

                {isMounted && user ? (
                  <div className="px-3 space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-700 py-2">
                      <User className="h-4 w-4 text-primary" />
                      <span>
                        {(user as any)?.email === 'demo@example.com' ? 'Demo User' : ((user as any)?.email || 'User')}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="px-3">
                    <Link
                      href="/booking"
                      className="btn btn-primary btn-default w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Book Now
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}