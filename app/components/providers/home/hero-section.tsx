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
    <section className="relative py-20 min-h-screen flex items-center">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        {/* <source src="https://res.cloudinary.com/dhxi75eld/video/upload/v1766235367/vecteezy_random-cars-driving-by-4k-stock-video_1614869_erhdom.mp4" type="video/mp4" /> */}
        <source src="https://res.cloudinary.com/dhxi75eld/video/upload/v1766235330/vecteezy_drone-follows-a-sports-car-from-right-close-shot-in-4k_1617207_bemoru.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/25 z-10"></div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          {/* Section Header */}
          <div className="mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
              🚗 Premium Car Rental
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Find Your Perfect Ride
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover premium vehicles at unbeatable prices. Book instantly with our seamless rental experience.
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-card rounded-2xl p-8 max-w-6xl mx-auto shadow-lg border">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Location */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    <MapPin className="inline h-4 w-4 mr-2" />
                    Pickup Location
                  </label>
                  <select
                    value={searchForm.location}
                    onChange={(e) => setSearchForm({...searchForm, location: e.target.value})}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background hover:bg-accent/5 transition-colors"
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
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Pickup Date
                  </label>
                  <CustomDatePicker
                    selected={searchForm.pickupDate}
                    onChange={(date) => setSearchForm({...searchForm, pickupDate: date})}
                    placeholderText="Select pickup date"
                    minDate={new Date()}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background hover:bg-accent/5 transition-colors"
                  />
                </div>

                {/* Return Date */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Return Date
                  </label>
                  <CustomDatePicker
                    selected={searchForm.returnDate}
                    onChange={(date) => setSearchForm({...searchForm, returnDate: date})}
                    placeholderText="Select return date"
                    minDate={minReturnDate}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background hover:bg-accent/5 transition-colors"
                  />
                </div>

                {/* Time Selection */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    <Clock className="inline h-4 w-4 mr-2" />
                    Pickup Time
                  </label>
                  <select
                    value={searchForm.pickupTime}
                    onChange={(e) => setSearchForm({...searchForm, pickupTime: e.target.value})}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background hover:bg-accent/5 transition-colors"
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
                    className="w-full h-14 bg-primary text-primary-foreground rounded-lg font-semibold shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                        Searching...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Search className="h-5 w-5 mr-2" />
                        Search Cars
                      </div>
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