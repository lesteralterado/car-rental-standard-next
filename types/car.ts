// types/car.ts
export interface Car {
  id: string
  name: string
  brand: string
  model: string
  year: number
  category: 'economy' | 'compact' | 'mid-size' | 'full-size' | 'luxury' | 'suv' | 'van'
  pricePerDay: number
  pricePerWeek: number
  pricePerMonth: number
  images: string[]
  features: string[]
  specifications: {
    seats: number
    transmission: 'automatic' | 'manual'
    fuel: 'gasoline' | 'diesel' | 'electric' | 'hybrid'
    doors: number
    luggage: number
    airConditioning: boolean
  }
  availability: {
    available: boolean
    locations: string[]
    unavailableDates: string[]
  }
  rating: number
  reviewCount: number
  reviews?: Array<{
    id: number
    user: string
    rating: number
    comment: string
    date: string
  }>
  description: string
  popular: boolean
  featured: boolean
}

// types/booking.ts
export interface Booking {
  id: string
  carId: string
  customerInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    licenseNumber: string
  }
  bookingDetails: {
    pickupDate: string
    returnDate: string
    pickupLocation: string
    returnLocation: string
    pickupTime: string
    returnTime: string
  }
  pricing: {
    days: number
    basePrice: number
    taxes: number
    fees: number
    discount: number
    total: number
  }
  extras: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentIntentId?: string
  createdAt: string
  updatedAt: string
}

// Fetch cars from API
export async function fetchCars(): Promise<Car[]> {
  try {
    const response = await fetch('/api/cars')
    if (!response.ok) {
      throw new Error('Failed to fetch cars')
    }
    const data = await response.json()
    return data.cars || []
  } catch (error) {
    console.error('Error fetching cars:', error)
    return []
  }
}

// data/cars.ts - Sample Car Listings (fallback)
export const cars: Car[] = [
  {
    id: '1',
    name: 'Toyota Camry 2024',
    brand: 'Toyota',
    model: 'Camry',
    year: 2024,
    category: 'mid-size',
    pricePerDay: 2500,
    pricePerWeek: 16500,
    pricePerMonth: 65000,
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop'
    ],
    features: ['Bluetooth', 'Backup Camera', 'Cruise Control', 'USB Ports', 'Lane Assist'],
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
      locations: ['Manila', 'Cebu', 'Davao'],
      unavailableDates: []
    },
    rating: 4.8,
    reviewCount: 124,
    description: 'Reliable and comfortable mid-size sedan perfect for business trips and family outings.',
    popular: true,
    featured: true
  },
  {
    id: '2',
    name: 'Honda CR-V 2024',
    brand: 'Honda',
    model: 'CR-V',
    year: 2024,
    category: 'suv',
    pricePerDay: 3200,
    pricePerWeek: 21000,
    pricePerMonth: 85000,
    images: [
      'https://images.unsplash.com/photo-1519641384142-9b3c08c8b7c1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop'
    ],
    features: ['All-Wheel Drive', 'Sunroof', 'Leather Seats', 'Navigation', 'Apple CarPlay'],
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
      locations: ['Manila', 'Cebu'],
      unavailableDates: []
    },
    rating: 4.9,
    reviewCount: 89,
    description: 'Spacious SUV with excellent fuel economy and advanced safety features.',
    popular: true,
    featured: true
  },
  {
    id: '3',
    name: 'BMW 3 Series 2024',
    brand: 'BMW',
    model: '3 Series',
    year: 2024,
    category: 'luxury',
    pricePerDay: 5500,
    pricePerWeek: 35000,
    pricePerMonth: 140000,
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1617886322464-7b3ba542b2fd?w=800&h=600&fit=crop'
    ],
    features: ['Premium Sound', 'Heated Seats', 'Wireless Charging', 'Heads-up Display', 'Premium Interior'],
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
      locations: ['Manila'],
      unavailableDates: []
    },
    rating: 4.7,
    reviewCount: 156,
    description: 'Ultimate driving machine with luxurious features and exceptional performance.',
    popular: false,
    featured: true
  },
  {
    id: '4',
    name: 'Mitsubishi Mirage 2024',
    brand: 'Mitsubishi',
    model: 'Mirage',
    year: 2024,
    category: 'economy',
    pricePerDay: 1800,
    pricePerWeek: 11500,
    pricePerMonth: 45000,
    images: [
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop'
    ],
    features: ['Fuel Efficient', 'Compact Size', 'Easy Parking', 'Basic Audio System'],
    specifications: {
      seats: 4,
      transmission: 'manual',
      fuel: 'gasoline',
      doors: 4,
      luggage: 2,
      airConditioning: true
    },
    availability: {
      available: true,
      locations: ['Manila', 'Cebu', 'Davao', 'Iloilo'],
      unavailableDates: []
    },
    rating: 4.2,
    reviewCount: 67,
    description: 'Perfect budget-friendly option for city driving with excellent fuel economy.',
    popular: true,
    featured: false
  },
  {
    id: '5',
    name: 'Ford Everest 2024',
    brand: 'Ford',
    model: 'Everest',
    year: 2024,
    category: 'suv',
    pricePerDay: 4200,
    pricePerWeek: 28000,
    pricePerMonth: 110000,
    images: [
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop'
    ],
    features: ['4x4 Capability', 'Third Row Seating', 'Towing Package', 'Off-road Mode', 'Large Cargo Space'],
    specifications: {
      seats: 7,
      transmission: 'automatic',
      fuel: 'diesel',
      doors: 4,
      luggage: 5,
      airConditioning: true
    },
    availability: {
      available: true,
      locations: ['Manila', 'Davao'],
      unavailableDates: []
    },
    rating: 4.6,
    reviewCount: 92,
    description: 'Rugged SUV perfect for family adventures and off-road excursions.',
    popular: false,
    featured: false
  },
  {
    id: '6',
    name: 'Hyundai Tucson 2024',
    brand: 'Hyundai',
    model: 'Tucson',
    year: 2024,
    category: 'suv',
    pricePerDay: 3500,
    pricePerWeek: 23000,
    pricePerMonth: 92000,
    images: [
      'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop'
    ],
    features: ['Panoramic Sunroof', 'Wireless Apple CarPlay', 'LED Headlights', 'Smart Cruise Control'],
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
      locations: ['Manila', 'Cebu', 'Iloilo'],
      unavailableDates: []
    },
    rating: 4.5,
    reviewCount: 78,
    description: 'Modern SUV with cutting-edge technology and stylish design.',
    popular: true,
    featured: false
  },
  {
    id: '7',
    name: 'Mercedes-Benz C-Class 2024',
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2024,
    category: 'luxury',
    pricePerDay: 6800,
    pricePerWeek: 45000,
    pricePerMonth: 180000,
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop'
    ],
    features: ['MBUX Infotainment', 'Premium Leather', 'Ambient Lighting', 'Advanced Safety', 'Burmester Sound'],
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
      locations: ['Manila'],
      unavailableDates: []
    },
    rating: 4.9,
    reviewCount: 134,
    description: 'Luxury sedan that combines elegance, comfort, and performance.',
    popular: false,
    featured: true
  },
  {
    id: '8',
    name: 'Nissan Almera 2024',
    brand: 'Nissan',
    model: 'Almera',
    year: 2024,
    category: 'compact',
    pricePerDay: 2200,
    pricePerWeek: 14500,
    pricePerMonth: 58000,
    images: [
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop'
    ],
    features: ['Touchscreen Display', 'Reverse Camera', 'Keyless Entry', 'USB Connectivity'],
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
      locations: ['Manila', 'Cebu', 'Davao', 'Iloilo'],
      unavailableDates: []
    },
    rating: 4.3,
    reviewCount: 89,
    description: 'Reliable compact sedan perfect for daily commuting and city driving.',
    popular: true,
    featured: false
  },
  {
    id: '9',
    name: 'Audi A4 2024',
    brand: 'Audi',
    model: 'A4',
    year: 2024,
    category: 'luxury',
    pricePerDay: 7200,
    pricePerWeek: 48000,
    pricePerMonth: 190000,
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1617886322464-7b3ba542b2fd?w=800&h=600&fit=crop'
    ],
    features: ['Virtual Cockpit', 'Quattro AWD', 'Bang & Olufsen Audio', 'Matrix LED Headlights'],
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
      locations: ['Manila'],
      unavailableDates: []
    },
    rating: 4.8,
    reviewCount: 112,
    description: 'Premium luxury sedan with advanced technology and refined performance.',
    popular: false,
    featured: false
  },
  {
    id: '10',
    name: 'Toyota Hiace 2024',
    brand: 'Toyota',
    model: 'Hiace',
    year: 2024,
    category: 'van',
    pricePerDay: 4500,
    pricePerWeek: 30000,
    pricePerMonth: 120000,
    images: [
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop'
    ],
    features: ['15-Seater', 'Large Cargo Space', 'Sliding Doors', 'Powerful Engine', 'Commercial Use'],
    specifications: {
      seats: 15,
      transmission: 'manual',
      fuel: 'diesel',
      doors: 4,
      luggage: 8,
      airConditioning: true
    },
    availability: {
      available: true,
      locations: ['Manila', 'Cebu', 'Davao'],
      unavailableDates: []
    },
    rating: 4.4,
    reviewCount: 67,
    description: 'Perfect for group travel, events, and transportation services.',
    popular: true,
    featured: false
  },
  {
    id: '11',
    name: 'Mazda CX-5 2024',
    brand: 'Mazda',
    model: 'CX-5',
    year: 2024,
    category: 'suv',
    pricePerDay: 3800,
    pricePerWeek: 25000,
    pricePerMonth: 98000,
    images: [
      'https://images.unsplash.com/photo-1519641384142-9b3c08c8b7c1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop'
    ],
    features: ['Skyactiv Technology', 'Bose Audio', 'i-ACTIVSENSE Safety', 'Leather Trim'],
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
      locations: ['Manila', 'Cebu'],
      unavailableDates: []
    },
    rating: 4.7,
    reviewCount: 95,
    description: 'Sporty SUV with exceptional handling and premium interior.',
    popular: false,
    featured: true
  },
  {
    id: '12',
    name: 'Chevrolet Spark 2024',
    brand: 'Chevrolet',
    model: 'Spark',
    year: 2024,
    category: 'economy',
    pricePerDay: 1600,
    pricePerWeek: 10500,
    pricePerMonth: 42000,
    images: [
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop'
    ],
    features: ['Compact Design', 'MyLink Infotainment', 'Rearview Camera', 'OnStar'],
    specifications: {
      seats: 4,
      transmission: 'automatic',
      fuel: 'gasoline',
      doors: 4,
      luggage: 2,
      airConditioning: true
    },
    availability: {
      available: true,
      locations: ['Manila', 'Cebu', 'Davao', 'Iloilo'],
      unavailableDates: []
    },
    rating: 4.1,
    reviewCount: 54,
    description: 'Ultra-compact car perfect for navigating busy city streets.',
    popular: true,
    featured: false
  },
  {
    id: '13',
    name: 'Subaru Forester 2024',
    brand: 'Subaru',
    model: 'Forester',
    year: 2024,
    category: 'suv',
    pricePerDay: 4000,
    pricePerWeek: 26500,
    pricePerMonth: 105000,
    images: [
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1519641384142-9b3c08c8b7c1?w=800&h=600&fit=crop'
    ],
    features: ['Symmetrical AWD', 'EyeSight Safety', 'X-Mode', 'Roof Rails', 'Large Windows'],
    specifications: {
      seats: 5,
      transmission: 'automatic',
      fuel: 'gasoline',
      doors: 4,
      luggage: 5,
      airConditioning: true
    },
    availability: {
      available: true,
      locations: ['Manila', 'Davao'],
      unavailableDates: []
    },
    rating: 4.6,
    reviewCount: 87,
    description: 'Adventure-ready SUV with excellent visibility and safety features.',
    popular: false,
    featured: false
  },
  {
    id: '14',
    name: 'Lexus ES 2024',
    brand: 'Lexus',
    model: 'ES',
    year: 2024,
    category: 'luxury',
    pricePerDay: 8500,
    pricePerWeek: 56000,
    pricePerMonth: 225000,
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop'
    ],
    features: ['Lexus Safety System', 'Mark Levinson Audio', 'Heated/Cooled Seats', 'Wireless Charging'],
    specifications: {
      seats: 5,
      transmission: 'automatic',
      fuel: 'hybrid',
      doors: 4,
      luggage: 3,
      airConditioning: true
    },
    availability: {
      available: true,
      locations: ['Manila'],
      unavailableDates: []
    },
    rating: 4.9,
    reviewCount: 143,
    description: 'Ultimate luxury sedan with hybrid efficiency and exceptional comfort.',
    popular: false,
    featured: true
  },
  {
    id: '15',
    name: 'Kia Sportage 2024',
    brand: 'Kia',
    model: 'Sportage',
    year: 2024,
    category: 'suv',
    pricePerDay: 3300,
    pricePerWeek: 22000,
    pricePerMonth: 88000,
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1519641384142-9b3c08c8b7c1?w=800&h=600&fit=crop'
    ],
    features: ['UVO Connect', 'Smart Key', 'Rear Parking Sensors', 'Drive Mode Select'],
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
      locations: ['Manila', 'Cebu', 'Iloilo'],
      unavailableDates: []
    },
    rating: 4.4,
    reviewCount: 76,
    description: 'Stylish SUV with modern features and reliable performance.',
    popular: true,
    featured: false
  },
  {
    id: '16',
    name: 'Volkswagen Santana 2024',
    brand: 'Volkswagen',
    model: 'Santana',
    year: 2024,
    category: 'compact',
    pricePerDay: 2400,
    pricePerWeek: 15500,
    pricePerMonth: 62000,
    images: [
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop'
    ],
    features: ['German Engineering', 'Touchscreen Interface', 'Cruise Control', 'ESP'],
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
    rating: 4.5,
    reviewCount: 69,
    description: 'Efficient compact sedan with European build quality.',
    popular: false,
    featured: false
  },
  {
    id: '17',
    name: 'Isuzu D-Max 2024',
    brand: 'Isuzu',
    model: 'D-Max',
    year: 2024,
    category: 'suv',
    pricePerDay: 3600,
    pricePerWeek: 24000,
    pricePerMonth: 96000,
    images: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop'
    ],
    features: ['4WD Capability', 'Towing Capacity', 'Hill Descent Control', 'Tough Construction'],
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
      locations: ['Manila', 'Davao'],
      unavailableDates: []
    },
    rating: 4.3,
    reviewCount: 82,
    description: 'Rugged pickup truck perfect for work and adventure.',
    popular: false,
    featured: false
  },
  {
    id: '18',
    name: 'Honda Civic 2024',
    brand: 'Honda',
    model: 'Civic',
    year: 2024,
    category: 'compact',
    pricePerDay: 2800,
    pricePerWeek: 18500,
    pricePerMonth: 74000,
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop'
    ],
    features: ['Honda Sensing', 'Turbo Engine', 'LED Lighting', 'Premium Audio'],
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
      locations: ['Manila', 'Cebu', 'Iloilo'],
      unavailableDates: []
    },
    rating: 4.7,
    reviewCount: 118,
    description: 'Sporty compact sedan with turbocharged performance.',
    popular: true,
    featured: true
  },
  {
    id: '19',
    name: 'Toyota Wigo 2024',
    brand: 'Toyota',
    model: 'Wigo',
    year: 2024,
    category: 'economy',
    pricePerDay: 1500,
    pricePerWeek: 9500,
    pricePerMonth: 38000,
    images: [
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop'
    ],
    features: ['Compact Size', 'Easy Maneuverability', 'Fuel Efficient', 'Basic Comfort'],
    specifications: {
      seats: 4,
      transmission: 'automatic',
      fuel: 'gasoline',
      doors: 4,
      luggage: 2,
      airConditioning: true
    },
    availability: {
      available: true,
      locations: ['Manila', 'Cebu', 'Davao', 'Iloilo'],
      unavailableDates: []
    },
    rating: 4.0,
    reviewCount: 45,
    description: 'Ultra-compact city car perfect for tight spaces and budget-conscious drivers.',
    popular: true,
    featured: false
  },
  {
    id: '20',
    name: 'Infiniti QX50 2024',
    brand: 'Infiniti',
    model: 'QX50',
    year: 2024,
    category: 'luxury',
    pricePerDay: 9200,
    pricePerWeek: 61000,
    pricePerMonth: 245000,
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop'
    ],
    features: ['VC-Turbo Engine', 'ProPILOT Assist', 'Bose Audio', 'Quilted Leather', 'Biometric Cooling'],
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
      locations: ['Manila'],
      unavailableDates: []
    },
    rating: 4.8,
    reviewCount: 67,
    description: 'Premium luxury SUV with innovative engine technology and sophisticated design.',
    popular: false,
    featured: true
  }
]

// data/locations.ts
export const locations = [
  {
    id: 'manila',
    name: 'Manila',
    address: '1234 Makati Ave, Makati City, Metro Manila',
    phone: '+63 2 8123 4567',
    hours: '24/7',
    coordinates: { lat: 14.5995, lng: 120.9842 }
  },
  {
    id: 'cebu',
    name: 'Cebu City',
    address: '567 Colon St, Cebu City, Cebu',
    phone: '+63 32 234 5678',
    hours: '6:00 AM - 10:00 PM',
    coordinates: { lat: 10.3157, lng: 123.8854 }
  },
  {
    id: 'davao',
    name: 'Davao City',
    address: '890 Roxas Ave, Davao City, Davao del Sur',
    phone: '+63 82 345 6789',
    hours: '6:00 AM - 10:00 PM',
    coordinates: { lat: 7.0731, lng: 125.6128 }
  },
  {
    id: 'iloilo',
    name: 'Iloilo City',
    address: '123 Gen. Luna St, Iloilo City, Iloilo',
    phone: '+63 33 456 7890',
    hours: '7:00 AM - 9:00 PM',
    coordinates: { lat: 10.7202, lng: 122.5621 }
  }
]