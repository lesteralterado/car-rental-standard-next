'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Calendar, Clock, ArrowRight, Shield, Clock3, Headphones } from 'lucide-react'
import CustomDatePicker from '@/app/components/ui/date-picker'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function HeroSection() {
  const router = useRouter()
  const sectionRef = useRef<HTMLElement>(null)
  const [searchForm, setSearchForm] = useState({
    location: '',
    pickupDate: null as Date | null,
    returnDate: null as Date | null,
    pickupTime: '10:00',
    returnTime: '10:00'
  })

  const [isLoading, setIsLoading] = useState(false)

  // Parallax effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchForm.location || !searchForm.pickupDate || !searchForm.returnDate) {
      return
    }

    setIsLoading(true)
    
    const params = new URLSearchParams({
      location: searchForm.location,
      pickupDate: searchForm.pickupDate.toISOString().split('T')[0],
      returnDate: searchForm.returnDate.toISOString().split('T')[0],
      pickupTime: searchForm.pickupTime,
      returnTime: searchForm.returnTime
    })

    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    router.push(`/cars?${params.toString()}`)
  }

  const minReturnDate = searchForm.pickupDate ? new Date(searchForm.pickupDate.getTime() + 24 * 60 * 60 * 1000) : new Date()

  // Stats data
  const stats = [
    { value: '10+', label: 'Years Experience' },
    { value: '500+', label: 'Premium Cars' },
    { value: '10k+', label: 'Happy Clients' },
    { value: '24/7', label: 'Support' },
  ]

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background with Parallax */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://res.cloudinary.com/dhxi75eld/video/upload/v1766235330/vecteezy_drone-follows-a-sports-car-from-right-close-shot-in-4k_1617207_bemoru.mp4" type="video/mp4" />
        </video>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#f4b400]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      </motion.div>

      {/* Content */}
      <motion.div 
        style={{ opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white mb-6"
            >
              <span className="w-2 h-2 bg-[#f4b400] rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">Premium Car Rental Service</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              Find Your Perfect <br />
              <span className="text-[#f4b400]">Dream Ride</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg md:text-xl text-gray-200 mb-8 max-w-lg"
            >
              Discover premium vehicles at unbeatable prices. Experience luxury on the road with our seamless rental experience.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-[#f4b400]">{stat.value}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center gap-2 text-gray-300">
                <Shield className="w-5 h-5 text-[#f4b400]" />
                <span className="text-sm">Fully Insured</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Clock3 className="w-5 h-5 text-[#f4b400]" />
                <span className="text-sm">Quick Pickup</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Headphones className="w-5 h-5 text-[#f4b400]" />
                <span className="text-sm">24/7 Support</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Search Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="bg-white rounded-3xl p-8 shadow-2xl"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Find Your Car</h3>
              <p className="text-gray-500">Enter your details to search available vehicles</p>
            </div>

            <form onSubmit={handleSearch} className="space-y-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <MapPin className="inline h-4 w-4 mr-2 text-[#f4b400]" />
                  Pickup Location
                </label>
                <select
                  value={searchForm.location}
                  onChange={(e) => setSearchForm({...searchForm, location: e.target.value})}
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f4b400] focus:border-transparent text-gray-700 bg-gray-50 hover:bg-white transition-all"
                  required
                >
                  <option value="">Select location</option>
                  <option value="manila">Manila</option>
                  <option value="cebu">Cebu City</option>
                  <option value="davao">Davao City</option>
                  <option value="iloilo">Iloilo City</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="inline h-4 w-4 mr-2 text-[#f4b400]" />
                    Pickup Date
                  </label>
                  <CustomDatePicker
                    selected={searchForm.pickupDate}
                    onChange={(date) => setSearchForm({...searchForm, pickupDate: date})}
                    placeholderText="Select date"
                    minDate={new Date()}
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f4b400] focus:border-transparent text-gray-700 bg-gray-50 hover:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="inline h-4 w-4 mr-2 text-[#f4b400]" />
                    Return Date
                  </label>
                  <CustomDatePicker
                    selected={searchForm.returnDate}
                    onChange={(date) => setSearchForm({...searchForm, returnDate: date})}
                    placeholderText="Select date"
                    minDate={minReturnDate}
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f4b400] focus:border-transparent text-gray-700 bg-gray-50 hover:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Clock className="inline h-4 w-4 mr-2 text-[#f4b400]" />
                  Pickup Time
                </label>
                <select
                  value={searchForm.pickupTime}
                  onChange={(e) => setSearchForm({...searchForm, pickupTime: e.target.value})}
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f4b400] focus:border-transparent text-gray-700 bg-gray-50 hover:bg-white transition-all"
                >
                  {Array.from({length: 24}, (_, i) => {
                    const hour = i.toString().padStart(2, '0')
                    return (
                      <option key={hour} value={`${hour}:00`}>
                        {`${hour}:00`}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Search Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 bg-[#f4b400] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-[#d49b00] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Search Available Cars
                  </>
                )}
              </motion.button>

              {/* Quick links */}
              <div className="text-center">
                <button type="button" className="text-sm text-gray-500 hover:text-[#f4b400] transition-colors">
                  View all locations <ArrowRight className="inline h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-white/80 rounded-full"></div>
        </motion.div>
      </motion.div>
    </section>
  )
}
