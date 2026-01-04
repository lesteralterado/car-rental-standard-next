'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowLeft, Star, Users, Settings, Fuel, MapPin, CheckCircle, Shield, Award, CreditCard } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CarCard from '@/app/components/cars/car-card'
import LoginForm from '@/app/components/LoginForm'
import SignUpForm from '@/app/components/SignUpForm'
import useAuth from '@/hooks/useAuth'
import client from '@/api/client'
import { toast } from 'react-hot-toast'

// Mock data - in a real app, this would come from an API
const mockCars = [
  {
    id: '1',
    name: 'BMW X5 2023',
    brand: 'BMW',
    model: 'X5',
    year: 2023,
    category: 'suv',
    pricePerDay: 4500,
    pricePerWeek: 28000,
    pricePerMonth: 120000,
    rating: 4.8,
    reviewCount: 124,
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop'],
    features: ['GPS Navigation', 'Leather Seats', 'Bluetooth', 'Sunroof', 'Heated Seats', 'Premium Sound System'],
    specifications: {
      seats: 5,
      transmission: 'automatic',
      fuel: 'diesel',
      doors: 4,
      luggage: 4,
      airConditioning: true
    },
    availability: {
      available: true,
      locations: ['Manila', 'Cebu', 'Davao'],
      unavailableDates: []
    },
    featured: true,
    popular: true,
    description: 'Experience luxury and performance with the BMW X5. This premium SUV offers exceptional comfort, advanced technology, and powerful performance for your journeys across the Philippines.',
    reviews: [
      { id: 1, user: 'Maria Santos', rating: 5, comment: 'Excellent car, very comfortable for long drives!', date: '2024-01-15' },
      { id: 2, user: 'Juan dela Cruz', rating: 5, comment: 'Perfect for our family trip. Highly recommended!', date: '2024-01-10' },
      { id: 3, user: 'Ana Reyes', rating: 4, comment: 'Great performance and features. Will rent again.', date: '2024-01-05' }
    ]
  },
  {
    id: '2',
    name: 'Toyota Camry 2023',
    brand: 'Toyota',
    model: 'Camry',
    year: 2023,
    category: 'mid-size',
    pricePerDay: 2800,
    pricePerWeek: 17500,
    pricePerMonth: 75000,
    rating: 4.6,
    reviewCount: 89,
    images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop'],
    features: ['Air Conditioning', 'Bluetooth', 'Backup Camera', 'LED Headlights'],
    specifications: {
      seats: 5,
      transmission: 'automatic',
      fuel: 'gasoline',
      doors: 4,
      luggage: 3,
      airConditioning: true
    },
    availability: {
      available: true,
      locations: ['Manila', 'Cebu'],
      unavailableDates: []
    },
    featured: false,
    popular: true,
    description: 'The Toyota Camry offers reliability and comfort with modern features. Perfect for business travel or family outings with its spacious interior and smooth ride.',
    reviews: [
      { id: 1, user: 'Pedro Garcia', rating: 5, comment: 'Very reliable and fuel efficient!', date: '2024-01-12' },
      { id: 2, user: 'Rosa Mendoza', rating: 4, comment: 'Comfortable seats and good mileage.', date: '2024-01-08' }
    ]
  },
  {
    id: '3',
    name: 'Honda CR-V 2022',
    brand: 'Honda',
    model: 'CR-V',
    year: 2022,
    category: 'suv',
    pricePerDay: 3200,
    pricePerWeek: 20000,
    pricePerMonth: 85000,
    rating: 4.7,
    reviewCount: 156,
    images: ['https://images.unsplash.com/photo-1519641384142-9b3c08c8b7c1?w=800&h=600&fit=crop'],
    features: ['All-Wheel Drive', 'Roof Rails', 'USB Ports', 'Apple CarPlay', 'Android Auto'],
    specifications: {
      seats: 5,
      transmission: 'automatic',
      fuel: 'gasoline',
      doors: 4,
      luggage: 4,
      airConditioning: true
    },
    availability: {
      available: true,
      locations: ['Manila', 'Davao', 'Baguio'],
      unavailableDates: []
    },
    featured: true,
    popular: false,
    description: 'The Honda CR-V provides excellent versatility and safety features. Ideal for adventure seekers and families who need reliable transportation.',
    reviews: [
      { id: 1, user: 'Carlos Lopez', rating: 5, comment: 'Great for mountain trips. Very capable SUV!', date: '2024-01-14' },
      { id: 2, user: 'Elena Torres', rating: 5, comment: 'Spacious and comfortable. Perfect for our needs.', date: '2024-01-09' },
      { id: 3, user: 'Miguel Santos', rating: 4, comment: 'Good value for money. Reliable performance.', date: '2024-01-03' }
    ]
  }
]

interface CarDetailPageProps {
  params: {
    id: string
  }
}

export default function CarDetailPage({ params }: CarDetailPageProps) {
  const { user } = useAuth()
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [bookingStep, setBookingStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    pickupDate: '',
    returnDate: '',
    location: '',
    customLocation: '',
    driversLicense: null as File | null,
    licenseNumber: '',
    notes: ''
  })

  const car = mockCars.find(c => c.id === params.id)

  if (!car) {
    notFound()
  }

  const handleBookClick = () => {
    if (!user) {
      setShowBookingForm(true)
      setBookingStep(0) // Auth step
    } else {
      setShowBookingForm(true)
      setBookingStep(1) // Start booking form
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const nextStep = () => setBookingStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setBookingStep(prev => Math.max(prev - 1, user ? 1 : 0))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      // Calculate total price
      const pickupDate = new Date(formData.pickupDate)
      const returnDate = new Date(formData.returnDate)
      const days = Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24))
      const totalPrice = days * car.pricePerDay

      // Upload driver's license if provided
      let licenseUrl = null
      if (formData.driversLicense) {
        const fileExt = formData.driversLicense.name.split('.').pop()
        const fileName = `${(user as User).id}_${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await client.storage
          .from('licenses')
          .upload(fileName, formData.driversLicense)

        if (uploadError) {
          console.error('License upload error:', uploadError)
          toast.error("Failed to upload driver's license")
          return
        }

        licenseUrl = uploadData.path
      }

      // Update user profile with license info
      if (formData.licenseNumber || licenseUrl) {
        await client
          .from('profiles')
          .update({
            drivers_license_number: formData.licenseNumber,
            drivers_license_url: licenseUrl,
          })
          .eq('id', (user as User).id)
      }

      // Create booking request (pending admin approval)
      const { error: bookingError } = await client
        .from('bookings')
        .insert({
          user_id: (user as User).id,
          car_id: car.id,
          pickup_date: formData.pickupDate,
          return_date: formData.returnDate,
          pickup_location: formData.location === 'custom' ? formData.customLocation : formData.location,
          total_price: totalPrice,
          status: 'pending', // Requires admin approval
          payment_status: 'pending',
          notes: formData.notes
        })
        .select()
        .single()

      if (bookingError) {
        console.error('Booking error:', bookingError)
        toast.error("Failed to submit booking request")
        return
      }

      // Create notification for user
      await client
        .from('notifications')
        .insert({
          user_id: (user as User).id,
          type: 'booking_submitted',
          title: 'Booking Request Submitted',
          message: `Your booking request for ${car.name} has been submitted and is pending admin approval.`,
          read: false
        })

      toast.success("Booking request submitted! We'll notify you once it's reviewed by our admin.")
      setShowBookingForm(false)
      setBookingStep(1)

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        pickupDate: '',
        returnDate: '',
        location: '',
        customLocation: '',
        driversLicense: null,
        licenseNumber: '',
        notes: ''
      })

    } catch (error) {
      console.error('Submit error:', error)
      toast.error("An error occurred while submitting your booking")
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/cars" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cars
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Car Images */}
          <div>
            <div className="bg-white rounded-lg overflow-hidden shadow-lg">
              <div className="aspect-video relative">
                <Image
                  src={car.images[0]}
                  alt={car.name}
                  fill
                  className="object-cover"
                  priority
                />
                {car.featured && (
                  <Badge className="absolute top-4 left-4 bg-yellow-500">
                    Featured
                  </Badge>
                )}
                {car.popular && (
                  <Badge className="absolute top-4 right-4 bg-green-500">
                    Popular
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {car.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {car.images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-video relative rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`${car.name} ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Car Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{car.name}</h1>
              <p className="text-gray-600 mb-4">{car.description}</p>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{car.rating}</span>
                  <span className="text-gray-500">({car.reviewCount} reviews)</span>
                </div>
                <Badge variant="outline">{car.category}</Badge>
                <Badge variant="outline">{car.year}</Badge>
              </div>
            </div>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatPrice(car.pricePerDay)}</div>
                    <div className="text-sm text-gray-500">per day</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatPrice(car.pricePerWeek)}</div>
                    <div className="text-sm text-gray-500">per week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatPrice(car.pricePerMonth)}</div>
                    <div className="text-sm text-gray-500">per month</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>{car.specifications.seats} seats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-600" />
                    <span>{car.specifications.transmission}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-blue-600" />
                    <span>{car.specifications.fuel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span>{car.specifications.luggage} luggage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span>{car.specifications.airConditioning ? 'Air Conditioning' : 'No AC'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    <span>{car.specifications.doors} doors</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {car.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Status: </span>
                    <Badge variant={car.availability.available ? 'default' : 'secondary'}>
                      {car.availability.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Locations: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {car.availability.locations.map((location, index) => (
                        <Badge key={index} variant="outline">{location}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Book Now Button */}
            <div className="pt-4">
              <Button
                onClick={handleBookClick}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
              >
                Book This Car
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
              <CardDescription>What our customers say about this vehicle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {car.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.user}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Similar Cars */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Similar Cars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockCars
              .filter(c => c.id !== car.id && c.category === car.category)
              .slice(0, 3)
              .map((similarCar) => (
                <CarCard key={similarCar.id} car={similarCar as Car} />
              ))}
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2000] p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {bookingStep === 0 ? 'Sign In to Book' : 'Book Your Car'}
                </h2>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Step Indicator */}
              {bookingStep > 0 && (
                <div className="flex justify-between mb-8">
                  {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex flex-col items-center relative flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold z-10 ${
                          s === bookingStep
                            ? "bg-blue-500 text-white"
                            : s < bookingStep
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {s}
                      </div>
                      <span
                        className={`text-sm mt-2 text-center ${
                          s === bookingStep ? "text-blue-500 font-medium" : "text-gray-500"
                        }`}
                      >
                        {s === 1 && "Personal Info"}
                        {s === 2 && "Rental Details"}
                        {s === 3 && "License & Payment"}
                        {s === 4 && "Confirmation"}
                      </span>
                      {s < 4 && (
                        <div className="absolute top-4 right-[-50%] w-full h-[2px] bg-gray-200 z-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Auth Step */}
              {bookingStep === 0 && (
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">Please Sign In to Continue Booking</h3>
                  <p className="text-gray-600 mb-6">You need to be logged in to complete your car rental booking.</p>

                  {authMode === 'login' ? (
                    <div className="space-y-4">
                      <LoginForm />
                      <button
                        type="button"
                        onClick={() => setAuthMode('signup')}
                        className="text-blue-500 hover:underline"
                      >
                        Don&quot;t have an account? Sign up
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <SignUpForm />
                      <button
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className="text-blue-500 hover:underline"
                      >
                        Already have an account? Sign in
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Booking Form */}
              {bookingStep > 0 && (
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Personal Info */}
                  {bookingStep === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleFormChange}
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleFormChange}
                            placeholder="+63 123 456 7890"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleFormChange}
                            placeholder="Your address"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Rental Details */}
                  {bookingStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="pickupDate">Pickup Date & Time</Label>
                          <Input
                            id="pickupDate"
                            name="pickupDate"
                            type="datetime-local"
                            value={formData.pickupDate}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="returnDate">Return Date & Time</Label>
                          <Input
                            id="returnDate"
                            name="returnDate"
                            type="datetime-local"
                            value={formData.returnDate}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="location">Pickup/Return Location</Label>
                        <select
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleFormChange}
                          required
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="">Select location</option>
                          <option value="office">Our Office - 123 Luxury Drive</option>
                          <option value="airport">LAX Airport</option>
                          <option value="hotel">Hotel Delivery</option>
                          <option value="custom">Custom Address</option>
                        </select>
                      </div>
                      {formData.location === "custom" && (
                        <div>
                          <Label htmlFor="customLocation">Custom Location</Label>
                          <Input
                            id="customLocation"
                            name="customLocation"
                            value={formData.customLocation}
                            onChange={handleFormChange}
                            placeholder="Enter address for delivery"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: License & Payment */}
                  {bookingStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="licenseNumber">Driver&quot;s License Number</Label>
                        <Input
                          id="licenseNumber"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleFormChange}
                          placeholder="Enter your license number"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="driversLicense">Upload Driver&quot;s License</Label>
                        <Input
                          id="driversLicense"
                          name="driversLicense"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null
                            setFormData({ ...formData, driversLicense: file })
                          }}
                          required
                        />
                        <p className="text-sm text-gray-500 mt-1">Please upload a clear photo of your driver&quot;s license</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Payment Information</h4>
                        <p className="text-sm text-gray-600 mb-2">Your booking will be reviewed by our admin team before payment processing.</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <CreditCard className="h-4 w-4" />
                          <span>Payment required after admin approval</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Confirmation */}
                  {bookingStep === 4 && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-3">Booking Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Vehicle:</span>
                            <span className="font-medium">{car.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pickup:</span>
                            <span>{formData.pickupDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Return:</span>
                            <span>{formData.returnDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span>{formData.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>License:</span>
                            <span>{formData.licenseNumber}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="notes">Special Requests (Optional)</Label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleFormChange}
                          placeholder="Any special requests or notes..."
                          rows={3}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> Your booking request will be reviewed by our admin team.
                          You&quot;ll receive a notification once it&quot;s approved and payment details will be provided.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between mt-8">
                    {bookingStep > 1 && (
                      <Button type="button" onClick={prevStep} variant="outline">
                        Previous
                      </Button>
                    )}
                    <div className="flex-1" />
                    {bookingStep < 4 ? (
                      <Button type="button" onClick={nextStep}>
                        Next Step
                      </Button>
                    ) : (
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Booking Request'}
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}