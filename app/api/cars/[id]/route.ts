import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/cars/[id] - Get a specific car
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', params.id)
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

    return NextResponse.json(transformedCar)
  } catch (error) {
    console.error('Error in GET /api/cars/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/cars/[id] - Update a car
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Transform the data to match database schema
    const carData: any = {
      name: body.name,
      brand: body.brand,
      model: body.model,
      year: body.year ? parseInt(body.year) : undefined,
      category: body.category,
      price_per_day: body.pricePerDay ? parseFloat(body.pricePerDay) : undefined,
      price_per_week: body.pricePerWeek ? parseFloat(body.pricePerWeek) : null,
      price_per_month: body.pricePerMonth ? parseFloat(body.pricePerMonth) : null,
      images: body.images,
      features: body.features,
      specifications: body.specifications,
      availability: body.availability,
      rating: body.rating,
      review_count: body.reviewCount,
      description: body.description,
      popular: body.popular,
      featured: body.featured,
      updated_at: new Date().toISOString()
    }

    // Remove undefined values
    Object.keys(carData).forEach(key => {
      if (carData[key] === undefined) {
        delete carData[key]
      }
    })

    const { data, error } = await supabase
      .from('cars')
      .update(carData)
      .eq('id', params.id)
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

    return NextResponse.json(transformedCar)
  } catch (error) {
    console.error('Error in PUT /api/cars/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/cars/[id] - Delete a car
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', params.id)

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