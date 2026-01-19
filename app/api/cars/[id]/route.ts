import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface CarUpdateData {
  name?: string
  make?: string
  model?: string
  year?: number
  category?: string
  price_per_day?: number
  price_per_week?: number | null
  price_per_month?: number | null
  images?: string[]
  features?: string[]
  specifications?: object
  available?: boolean
  availability?: string
  rating?: number
  review_count?: number
  description?: string
  popular?: boolean
  featured?: boolean
  updated_at?: string
}

// GET /api/cars/[id] - Get a specific car
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Car not found' }, { status: 404 })
      }
      console.error('Error fetching car:', error)
      return NextResponse.json({ error: 'Failed to fetch car' }, { status: 500 })
    }

    // Transform the data to match the Car interface
    const transformedCar = {
      id: data.id,
      name: data.name,
      brand: data.make,
      model: data.model,
      year: data.year,
      category: data.category,
      pricePerDay: data.price_per_day,
      pricePerWeek: data.price_per_week,
      pricePerMonth: data.price_per_month,
      images: data.images || [],
      features: [],
      specifications: data.specifications || {},
      availability: { available: data.available !== false, locations: [], unavailableDates: [] },
      rating: data.rating || 0,
      reviewCount: data.review_count || 0,
      description: '',
      popular: data.popular || false,
      featured: data.featured || false
    }

    return NextResponse.json(transformedCar)
  } catch (error) {
    console.error('Error in GET /api/cars/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/cars/[id] - Update a car
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params

    // Transform the data to match database schema
    const carData: CarUpdateData = {
      name: body.name,
      make: body.brand,
      model: body.model,
      year: body.year ? parseInt(body.year) : undefined,
      category: body.category,
      price_per_day: body.pricePerDay ? parseFloat(body.pricePerDay) : undefined,
      price_per_week: body.pricePerWeek ? parseFloat(body.pricePerWeek) : null,
      price_per_month: body.pricePerMonth ? parseFloat(body.pricePerMonth) : null,
      images: body.images,
      features: body.features,
      specifications: body.specifications,
      available: body.availability?.available,
      availability: body.availability?.available ? 'available' : 'unavailable',
      rating: body.rating,
      review_count: body.reviewCount,
      description: body.description,
      popular: body.popular,
      featured: body.featured,
      updated_at: new Date().toISOString()
    }

    // Remove undefined values
    Object.keys(carData).forEach(key => {
      const k = key as keyof CarUpdateData
      if (carData[k] === undefined) {
        delete carData[k]
      }
    })

    const { data, error } = await supabase
      .from('cars')
      .update(carData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Car not found' }, { status: 404 })
      }
      console.error('Error updating car:', error)
      return NextResponse.json({ error: 'Failed to update car' }, { status: 500 })
    }

    // Transform response back to interface format
    const transformedCar = {
      id: data.id,
      name: data.name,
      brand: data.make,
      model: data.model,
      year: data.year,
      category: data.category,
      pricePerDay: data.price_per_day,
      pricePerWeek: data.price_per_week,
      pricePerMonth: data.price_per_month,
      images: data.images || [],
      features: data.features || [],
      specifications: data.specifications || {},
      availability: { available: data.available !== false, locations: [], unavailableDates: [] },
      rating: data.rating || 0,
      reviewCount: data.review_count || 0,
      description: data.description,
      popular: data.popular || false,
      featured: data.featured || false
    }

    return NextResponse.json(transformedCar)
  } catch (error) {
    console.error('Error in PUT /api/cars/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/cars/[id] - Delete a car
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting car:', error)
      return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Car deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/cars/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}