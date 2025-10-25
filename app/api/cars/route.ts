import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/cars - List all cars with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const { data: cars, error, count } = await supabase
      .from('cars')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching cars:', error)
      return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 })
    }

    // Transform the data to match the Car interface
    const transformedCars = cars.map(car => ({
      id: car.id,
      name: car.name,
      brand: car.brand,
      model: car.model,
      year: car.year,
      category: car.category,
      pricePerDay: car.price_per_day,
      pricePerWeek: car.price_per_week,
      pricePerMonth: car.price_per_month,
      images: car.images || [],
      features: car.features || [],
      specifications: car.specifications || {},
      availability: car.availability || { available: true, locations: [], unavailableDates: [] },
      rating: car.rating || 0,
      reviewCount: car.review_count || 0,
      description: car.description,
      popular: car.popular || false,
      featured: car.featured || false
    }))

    return NextResponse.json({
      cars: transformedCars,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error('Error in GET /api/cars:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/cars - Create a new car
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'brand', 'model', 'year', 'category', 'pricePerDay']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Transform the data to match database schema
    const carData = {
      name: body.name,
      brand: body.brand,
      model: body.model,
      year: parseInt(body.year),
      category: body.category,
      price_per_day: parseFloat(body.pricePerDay),
      price_per_week: body.pricePerWeek ? parseFloat(body.pricePerWeek) : null,
      price_per_month: body.pricePerMonth ? parseFloat(body.pricePerMonth) : null,
      images: body.images || [],
      features: body.features || [],
      specifications: body.specifications || {},
      availability: body.availability || { available: true, locations: [], unavailableDates: [] },
      rating: body.rating || 0,
      review_count: body.reviewCount || 0,
      description: body.description || '',
      popular: body.popular || false,
      featured: body.featured || false
    }

    const { data, error } = await supabase
      .from('cars')
      .insert([carData])
      .select()
      .single()

    if (error) {
      console.error('Error creating car:', error)
      return NextResponse.json({ error: 'Failed to create car' }, { status: 500 })
    }

    // Transform response back to interface format
    const transformedCar = {
      id: data.id,
      name: data.name,
      brand: data.brand,
      model: data.model,
      year: data.year,
      category: data.category,
      pricePerDay: data.price_per_day,
      pricePerWeek: data.price_per_week,
      pricePerMonth: data.price_per_month,
      images: data.images || [],
      features: data.features || [],
      specifications: data.specifications || {},
      availability: data.availability || { available: true, locations: [], unavailableDates: [] },
      rating: data.rating || 0,
      reviewCount: data.review_count || 0,
      description: data.description,
      popular: data.popular || false,
      featured: data.featured || false
    }

    return NextResponse.json(transformedCar, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/cars:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}