'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Calendar, Clock, Star } from 'lucide-react'
import CustomDatePicker from '@/app/components/ui/date-picker'
// import { Canvas } from "@react-three/fiber";
// import { Suspense } from "react";
// import { Experience } from "../../cars/Experience";

export default function HeroSection() {
  const router = useRouter()
  const [searchForm, setSearchForm] = useState({
    location: '',
    pickupDate: null as Date | null,
    returnDate: null as Date | null,
    pickupTime: '10:00',
    returnTime: '10:00'
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchForm.location || !searchForm.pickupDate || !searchForm.returnDate) {
      return
    }

    setIsLoading(true)
    
    // Create search parameters
    const params = new URLSearchParams({
      location: searchForm.location,
      pickupDate: searchForm.pickupDate.toISOString().split('T')[0],
      returnDate: searchForm.returnDate.toISOString().split('T')[0],
      pickupTime: searchForm.pickupTime,
      returnTime: searchForm.returnTime
    })

    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    router.push(`/cars?${params.toString()}`)
  }

  const minReturnDate = searchForm.pickupDate ? new Date(searchForm.pickupDate.getTime() + 24 * 60 * 60 * 1000) : new Date()
  
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
    </div>
    );

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMzc0MTUxO3N0b3Atb3BhY2l0eToxIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNmI3M2E4O3N0b3Atb3BhY2l0eToxIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzdkNGVkZjtzdG9wLW9wYWNpdHk6MSIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFkaWVudCkiLz4KICA8Y2lyY2xlIGN4PSIyMCUiIGN5PSIyMCUiIHI9IjMwJSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+CiAgPGNpcmNsZSBjeD0iODAlIiBjeT0iODAlIiByPSIyNSUiIGZpbGw9InJnYmEoMTM3LCAxODMsLCAyMzcsIDAuMSkiLz4KICA8Y2lyY2xlIGN4PSI2MCUiIGN5PSI0MCUiIHI9IjIwJSIgZmlsbD0icmdiYSgxMzcsIDE4MyAyMzcsIDAuMDUpIi8+Cjwvc3ZnPg==')`
          }}
        />
      </div>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 z-5"></div>

      {/* Floating Elements (kept from original) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce-gentle"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-500/20 rounded-full animate-bounce-gentle" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-purple-500/20 rounded-full animate-bounce-gentle" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          {/* Hero Text */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              Find Your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                Perfect Ride
              </span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-200 mb-8 max-w-4xl mx-auto font-light drop-shadow-lg">
              Discover premium vehicles at unbeatable prices. Book instantly with our seamless rental experience.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-8 mb-8">
              <div className="flex items-center space-x-2 text-yellow-400">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <span className="text-white ml-2">4.9/5 Rating</span>
              </div>
              <div className="text-white">
                <span className="font-bold">50K+</span> Happy Customers
              </div>
            </div>
          </div>

          {/* Search Form */}
          <div className="glass rounded-2xl p-8 max-w-6xl mx-auto shadow-2xl">
            <form onSubmit={handleSearch} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Location */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-white mb-3">
                    <MapPin className="inline h-4 w-4 mr-2" />
                    Pickup Location
                  </label>
                  <select
                    value={searchForm.location}
                    onChange={(e) => setSearchForm({...searchForm, location: e.target.value})}
                    className="input input-lg w-full bg-white/90 hover:bg-white focus:bg-white text-gray-900"
                    required
                  >
                    <option value="">Select location</option>
                    <option value="manila">Manila</option>
                    <option value="cebu">Cebu City</option>
                    <option value="davao">Davao City</option>
                    <option value="iloilo">Iloilo City</option>
                  </select>
                </div>

                {/* Pickup Date */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-white mb-3">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Pickup Date
                  </label>
                  <CustomDatePicker
                    selected={searchForm.pickupDate}
                    onChange={(date) => setSearchForm({...searchForm, pickupDate: date})}
                    placeholderText="Select pickup date"
                    minDate={new Date()}
                    className="input-lg bg-white/90 hover:bg-white focus:bg-white text-gray-900"
                  />
                </div>

                {/* Return Date */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-white mb-3">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Return Date
                  </label>
                  <CustomDatePicker
                    selected={searchForm.returnDate}
                    onChange={(date) => setSearchForm({...searchForm, returnDate: date})}
                    placeholderText="Select return date"
                    minDate={minReturnDate}
                    className="input-lg bg-white/90 hover:bg-white focus:bg-white text-gray-900"
                  />
                </div>

                {/* Time Selection */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-white mb-3">
                    <Clock className="inline h-4 w-4 mr-2" />
                    Pickup Time
                  </label>
                  <select
                    value={searchForm.pickupTime}
                    onChange={(e) => setSearchForm({...searchForm, pickupTime: e.target.value})}
                    className="input input-lg w-full bg-white/90 hover:bg-white focus:bg-white text-gray-900"
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
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-transparent mb-3">Search</label>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary btn-lg w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="spinner mr-2"></div>
                        Searching...
                      </div>
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-2" />
                        Search Cars
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
            <div className="animate-slide-up">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-gradient">500+</div>
              <div className="text-gray-300 text-sm md:text-base">Premium Cars</div>
            </div>
            <div className="animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-gradient">50K+</div>
              <div className="text-gray-300 text-sm md:text-base">Happy Customers</div>
            </div>
            <div className="animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-gradient">24/7</div>
              <div className="text-gray-300 text-sm md:text-base">Customer Support</div>
            </div>
            <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-gradient">15+</div>
              <div className="text-gray-300 text-sm md:text-base">Locations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-white">
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1">
            <div className="w-1 h-3 bg-white rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </section>
  )
}