'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X, Car, Plus } from 'lucide-react'
import { Car as CarType } from '@/types/car'

interface CarFormProps {
  car?: CarType | null
  onSuccess: () => void
  onCancel: () => void
}

const CAR_CATEGORIES = [
  'economy', 'compact', 'mid-size', 'full-size', 'luxury', 'suv', 'van'
]

const LOCATIONS = [
  'Manila', 'Cebu City', 'Davao City', 'Iloilo City'
]

export default function CarForm({ car, onSuccess, onCancel }: CarFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: '',
    category: '',
    pricePerDay: '',
    pricePerWeek: '',
    pricePerMonth: '',
    description: '',
    features: [] as string[],
    images: [] as string[],
    specifications: {
      seats: 5,
      transmission: 'automatic' as 'automatic' | 'manual',
      fuel: 'gasoline' as 'gasoline' | 'diesel' | 'electric' | 'hybrid',
      doors: 4,
      luggage: 3,
      airConditioning: true
    },
    availability: {
      available: true,
      locations: [] as string[],
      unavailableDates: [] as string[]
    },
    popular: false,
    featured: false
  })

  const [newFeature, setNewFeature] = useState('')
  const [uploadingImages, setUploadingImages] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (car) {
      setFormData({
        name: car.name,
        brand: car.brand,
        model: car.model,
        year: car.year.toString(),
        category: car.category,
        pricePerDay: car.pricePerDay.toString(),
        pricePerWeek: car.pricePerWeek?.toString() || '',
        pricePerMonth: car.pricePerMonth?.toString() || '',
        description: car.description || '',
        features: car.features || [],
        images: car.images || [],
        specifications: car.specifications || {
          seats: 5,
          transmission: 'automatic',
          fuel: 'gasoline',
          doors: 4,
          luggage: 3,
          airConditioning: true
        },
        availability: car.availability || {
          available: true,
          locations: [],
          unavailableDates: []
        },
        popular: car.popular || false,
        featured: car.featured || false
      })
    }
  }, [car])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSpecChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value
      }
    }))
  }

  const handleAvailabilityChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [field]: value
      }
    }))
  }

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature('')
    }
  }

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setUploadingImages(true)
    const uploadedUrls: string[] = []

    for (const file of Array.from(files)) {
      try {
        // For now, we'll use a placeholder. In a real implementation,
        // you'd upload to Supabase Storage or another service
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)

        // Placeholder - replace with actual upload logic
        const placeholderUrl = `https://via.placeholder.com/800x600?text=${encodeURIComponent(file.name)}`
        uploadedUrls.push(placeholderUrl)
      } catch (error) {
        console.error('Error uploading image:', error)
      }
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls]
    }))
    setUploadingImages(false)
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const submitData = {
        ...formData,
        year: parseInt(formData.year),
        pricePerDay: parseFloat(formData.pricePerDay),
        pricePerWeek: formData.pricePerWeek ? parseFloat(formData.pricePerWeek) : null,
        pricePerMonth: formData.pricePerMonth ? parseFloat(formData.pricePerMonth) : null,
      }

      const url = car ? `/api/cars/${car.id}` : '/api/cars'
      const method = car ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        onSuccess()
      } else {
        console.error('Failed to save car')
      }
    } catch (error) {
      console.error('Error saving car:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Car Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CAR_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="pricePerDay">Price per Day (₱) *</Label>
              <Input
                id="pricePerDay"
                type="number"
                value={formData.pricePerDay}
                onChange={(e) => handleInputChange('pricePerDay', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="pricePerWeek">Price per Week (₱)</Label>
              <Input
                id="pricePerWeek"
                type="number"
                value={formData.pricePerWeek}
                onChange={(e) => handleInputChange('pricePerWeek', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pricePerMonth">Price per Month (₱)</Label>
              <Input
                id="pricePerMonth"
                type="number"
                value={formData.pricePerMonth}
                onChange={(e) => handleInputChange('pricePerMonth', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="seats">Seats</Label>
              <Input
                id="seats"
                type="number"
                value={formData.specifications.seats}
                onChange={(e) => handleSpecChange('seats', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="transmission">Transmission</Label>
              <Select
                value={formData.specifications.transmission}
                onValueChange={(value: 'automatic' | 'manual') => handleSpecChange('transmission', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fuel">Fuel Type</Label>
              <Select
                value={formData.specifications.fuel}
                onValueChange={(value: 'gasoline' | 'diesel' | 'electric' | 'hybrid') => handleSpecChange('fuel', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasoline">Gasoline</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="doors">Doors</Label>
              <Input
                id="doors"
                type="number"
                value={formData.specifications.doors}
                onChange={(e) => handleSpecChange('doors', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="luggage">Luggage Capacity</Label>
              <Input
                id="luggage"
                type="number"
                value={formData.specifications.luggage}
                onChange={(e) => handleSpecChange('luggage', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="airConditioning"
                checked={formData.specifications.airConditioning}
                onCheckedChange={(checked) => handleSpecChange('airConditioning', checked)}
              />
              <Label htmlFor="airConditioning">Air Conditioning</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add a feature..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            />
            <Button type="button" onClick={addFeature} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                <span className="text-sm">{feature}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(feature)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <Label htmlFor="image-upload" className="cursor-pointer">
              <Button type="button" variant="outline" disabled={uploadingImages}>
                <Upload className="h-4 w-4 mr-2" />
                {uploadingImages ? 'Uploading...' : 'Upload Images'}
              </Button>
            </Label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Car image ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Availability & Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Availability & Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="available"
              checked={formData.availability.available}
              onCheckedChange={(checked) => handleAvailabilityChange('available', checked)}
            />
            <Label htmlFor="available">Available for booking</Label>
          </div>

          <div>
            <Label>Available Locations</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {LOCATIONS.map(location => (
                <div key={location} className="flex items-center space-x-2">
                  <Checkbox
                    id={`location-${location}`}
                    checked={formData.availability?.locations?.includes(location) || false}
                    onCheckedChange={(checked) => {
                      const locations = checked
                        ? [...formData.availability.locations, location]
                        : formData.availability.locations.filter(l => l !== location)
                      handleAvailabilityChange('locations', locations)
                    }}
                  />
                  <Label htmlFor={`location-${location}`}>{location}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="popular"
                checked={formData.popular}
                onCheckedChange={(checked) => handleInputChange('popular', checked)}
              />
              <Label htmlFor="popular">Mark as Popular</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => handleInputChange('featured', checked)}
              />
              <Label htmlFor="featured">Mark as Featured</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : (car ? 'Update Car' : 'Create Car')}
        </Button>
      </div>
    </form>
  )
}