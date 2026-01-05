'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Star, Users, Settings, Fuel, Heart, MapPin } from 'lucide-react'
import type { Car } from '@/types/car'
// import useAuth from '@/hooks/useAuth'
import BookingModal from '@/app/components/providers/home/booking-modal'
// import { toast } from 'react-hot-toast'

interface CarCardProps {
  car: Car
  view?: 'grid' | 'list'
}

export default function CarCard({ car, view = 'grid' }: CarCardProps) {
  // const { user } = useAuth()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
  }

  const handleBook = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsBookingModalOpen(true)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (view === 'list') {
    return (
      <Link href={`/cars/${car.id}`} className="block">
        <div className="car-card bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Image */}
            <div className="lg:w-1/3">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                {!imageError ? (
                  <Image
                    src={car.images[0]}
                    alt={car.name}
                    fill
                    className="car-card-image object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Settings className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col space-y-2">
                  {car.featured && (
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </span>
                  )}
                  {car.popular && (
                    <span className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Popular
                    </span>
                  )}
                </div>

                {/* Wishlist */}
                <button
                  onClick={handleWishlist}
                  className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="lg:w-2/3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{car.name}</h3>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">{car.category} • {car.year}</p>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold text-gray-700">{car.rating}</span>
                    <span className="text-sm text-gray-500">({car.reviewCount})</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{car.description}</p>

                {/* Specifications */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{car.specifications.seats} seats</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Settings className="h-4 w-4 text-primary" />
                    <span className="capitalize">{car.specifications.transmission}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Fuel className="h-4 w-4 text-primary" />
                    <span className="capitalize">{car.specifications.fuel}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{car.availability?.locations?.length || 0} locations</span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {car.features.slice(0, 3).map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                  {car.features.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{car.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Price and Action */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-primary">{formatPrice(car.pricePerDay)}</div>
                  <div className="text-sm text-gray-500">per day</div>
                  <div className="text-xs text-gray-400">
                    {formatPrice(car.pricePerWeek)}/week • {formatPrice(car.pricePerMonth)}/month
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <button onClick={handleBook} className="btn btn-primary btn-default">
                    Book Now
                  </button>
                  <button className="btn btn-outline btn-sm text-xs">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Booking Modal */}
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          carModel={car.name}
        />
      </Link>
    )
  }

  // Grid view
  return (
    <Link href={`/cars/${car.id}`} className="block">
      <div className="car-card bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
        {/* Image */}
        <div className="relative aspect-video">
          {!imageError ? (
            <Image
              src={car.images[0]}
              alt={car.name}
              fill
              className="car-card-image object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Settings className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            {car.featured && (
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                Featured
              </span>
            )}
            {car.popular && (
              <span className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Popular
              </span>
            )}
          </div>

          {/* Availability Status */}
          <div className="absolute top-4 right-4">
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Available
            </span>
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{car.name}</h3>
              <p className="text-sm text-gray-500 uppercase tracking-wide">{car.category} • {car.year}</p>
            </div>
            
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-semibold text-gray-700">{car.rating}</span>
            </div>
          </div>

          <p className="text-gray-600 mb-4 text-sm line-clamp-2">{car.description}</p>

          {/* Specifications */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary" />
              <span>{car.specifications.seats} seats</span>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-primary" />
              <span className="capitalize">{car.specifications.transmission}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Fuel className="h-4 w-4 text-primary" />
              <span className="capitalize">{car.specifications.fuel}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-primary" />
              {/* <span>{car.availability?.locations.length}</span> */}
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1 mb-4">
            {car.features.slice(0, 2).map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {feature}
              </span>
            ))}
            {car.features.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{car.features.length - 2}
              </span>
            )}
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-primary">{formatPrice(car.pricePerDay)}</div>
              <div className="text-sm text-gray-500">per day</div>
            </div>
            <button onClick={handleBook} className="btn btn-primary btn-default">
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        carModel={car.name}
      />
    </Link>
  )
}