'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, Phone, Mail, User, LogOut, X } from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import NotificationBell from '@/app/components/NotificationBell'
import { User as SupabaseUser } from '@supabase/supabase-js'

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

  const userNavigation = [
    { name: 'Inquiry', href: '/inquiry' },
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
      <div className="promo-banner bg-primary text-primary-foreground py-2 px-4 text-center text-sm">
        <p><strong>Special Offer:</strong> Book now and get 20% off your first rental! Use code: FIRST20</p>
      </div>

      <header className="bg-card shadow-lg sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-primary rounded-lg group-hover:bg-primary/90 transition-colors">
                {/* <Car className="h-6 w-6 text-white" /> */}
                <Image src="/assets/Untitled design (6).png" alt="CarRental Pro Logo" width={24} height={24} className="h-6 w-6 object-contain bg-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                CarRental 
                {/* <span className="text-primary">Pro</span> */}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </Link>
              ))}
              {isMounted && user && userNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </Link>
              ))}
            </nav>

            {/* Contact Info & CTA */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                {/* <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>+63 123 456 7890</span>
                </div> */}
                {/* <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>info@carrentalpro.com</span>
                </div> */}
              </div>

              {isMounted && user ? (
                <div className="flex items-center space-x-4">
                  <NotificationBell />
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-foreground">
                      {(user as SupabaseUser)?.email === 'demo@example.com' ? 'Demo User' : ((user as SupabaseUser)?.email || 'User')}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="btn btn-outline"
                  >
                    Login
                  </Link>
                  <Link
                    href="/cars"
                    className="btn btn-primary btn-default"
                  >
                    Browse Cars
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-muted/30">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-card rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {isMounted && user && userNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-card rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="pt-4 border-t border-border space-y-3">
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>+63 123 456 7890</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>info@carrentalpro.com</span>
                  </div>
                </div>

                {isMounted && user ? (
                  <div className="px-3 space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2 text-sm text-foreground">
                        <User className="h-4 w-4 text-primary" />
                        <span>
                          {(user as SupabaseUser)?.email === 'demo@example.com' ? 'Demo User' : ((user as SupabaseUser)?.email || 'User')}
                        </span>
                      </div>
                      <NotificationBell />
                    </div>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="px-3 space-y-3">
                    <Link
                      href="/login"
                      className="btn btn-outline w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/cars"
                      className="btn btn-primary btn-default w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Browse Cars
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