'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, Phone, Mail, User, LogOut, X, Car } from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import NotificationBell from '@/app/components/NotificationBell'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    setIsMounted(true)
    
    // Handle scroll detection
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
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
    localStorage.removeItem('demo_user')
    window.location.reload()
  }

  return (
    <>
      {/* Promo Banner */}
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#f4b400] text-white py-2 px-4 text-center text-sm font-medium"
      >
        <p>
          <span className="hidden sm:inline">🎉 </span>
          <strong>Special Offer:</strong> Book now and get 20% off your first rental! 
          <span className="ml-2 px-2 py-1 bg-white/20 rounded ml-2 text-xs">Use code: FIRST20</span>
        </p>
      </motion.div>

      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-100' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-[#f4b400] rounded-xl group-hover:bg-[#d49b00] transition-colors shadow-lg"
              >
                <Car className="h-6 w-6 text-white" />
              </motion.div>
              <span className="text-2xl font-bold text-gray-900">
                CarRental 
                <span className="text-[#f4b400]">Pro</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="text-gray-700 hover:text-[#f4b400] px-4 py-2 text-sm font-medium transition-colors relative group"
                  >
                    {item.name}
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#f4b400] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                  </Link>
                </motion.div>
              ))}
              {isMounted && user && userNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-[#f4b400] px-4 py-2 text-sm font-medium transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#f4b400] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                </Link>
              ))}
            </nav>

            {/* Contact Info & CTA */}
            <div className="hidden lg:flex items-center space-x-4">
              {isMounted && user ? (
                <div className="flex items-center space-x-4">
                  <NotificationBell />
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-2 text-sm bg-gray-50 px-3 py-2 rounded-full"
                  >
                    <User className="h-4 w-4 text-[#f4b400]" />
                    <span className="text-gray-700 font-medium">
                      {(user as SupabaseUser)?.email === 'demo@example.com' ? 'Demo User' : ((user as SupabaseUser)?.email || 'User').split('@')[0]}
                    </span>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/login"
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-[#f4b400] transition-colors rounded-full hover:bg-gray-50"
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/cars"
                      className="px-6 py-2.5 bg-[#f4b400] text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-xl hover:bg-[#d49b00] transition-all duration-300 btn-shine"
                    >
                      Browse Cars
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-700 hover:text-[#f4b400] hover:bg-gray-50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-lg"
            >
              <div className="px-4 py-4 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-[#f4b400] hover:bg-gray-50 rounded-xl transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {isMounted && user && userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-[#f4b400] hover:bg-gray-50 rounded-xl transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  {isMounted && user ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                          <User className="h-4 w-4 text-[#f4b400]" />
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
                        className="flex items-center space-x-2 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/login"
                        className="block px-4 py-3 text-center text-base font-medium text-gray-700 hover:text-[#f4b400] hover:bg-gray-50 rounded-xl transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        href="/cars"
                        className="block px-4 py-3 text-center text-base font-medium bg-[#f4b400] text-white rounded-xl shadow-lg hover:bg-[#d49b00] transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Browse Cars
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}
