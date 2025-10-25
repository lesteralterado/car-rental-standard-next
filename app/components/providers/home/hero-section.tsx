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
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          {/* Section Header */}
          <div className="mb-16">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
              🚗 Premium Car Rental
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Find Your <span className="text-gradient">Perfect Ride</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover premium vehicles at unbeatable prices. Book instantly with our seamless rental experience.
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl p-8 max-w-6xl mx-auto shadow-lg">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Location */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <MapPin className="inline h-4 w-4 mr-2" />
                    Pickup Location
                  </label>
                  <select
                    value={searchForm.location}
                    onChange={(e) => setSearchForm({...searchForm, location: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-gray-50 hover:bg-white"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Pickup Date
                  </label>
                  <CustomDatePicker
                    selected={searchForm.pickupDate}
                    onChange={(date) => setSearchForm({...searchForm, pickupDate: date})}
                    placeholderText="Select pickup date"
                    minDate={new Date()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Return Date */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Return Date
                  </label>
                  <CustomDatePicker
                    selected={searchForm.returnDate}
                    onChange={(date) => setSearchForm({...searchForm, returnDate: date})}
                    placeholderText="Select return date"
                    minDate={minReturnDate}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Time Selection */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Clock className="inline h-4 w-4 mr-2" />
                    Pickup Time
                  </label>
                  <select
                    value={searchForm.pickupTime}
                    onChange={(e) => setSearchForm({...searchForm, pickupTime: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-gray-50 hover:bg-white"
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
                    className="w-full h-14 bg-primary text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:bg-primary-dark transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
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

        </div>
      </div>
    </section>
  )
}