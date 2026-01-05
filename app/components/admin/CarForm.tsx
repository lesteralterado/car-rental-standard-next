'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Plus, X } from 'lucide-react'
import { Car as CarType } from '@/types/car'
import SHA1 from 'crypto-js/sha1'

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
      seats: '5',
      transmission: 'automatic' as 'automatic' | 'manual',
      fuel: 'gasoline' as 'gasoline' | 'diesel' | 'electric' | 'hybrid',
      doors: '4',
      luggage: '3',
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
  const [isDragOver, setIsDragOver] = useState(false)

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
        specifications: car.specifications ? {
          seats: car.specifications.seats?.toString() || '5',
          transmission: car.specifications.transmission || 'automatic',
          fuel: car.specifications.fuel || 'gasoline',
          doors: car.specifications.doors?.toString() || '4',
          luggage: car.specifications.luggage?.toString() || '3',
          airConditioning: car.specifications.airConditioning ?? true
        } : {
          seats: '5',
          transmission: 'automatic',
          fuel: 'gasoline',
          doors: '4',
          luggage: '3',
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

  const handleInputChange = (field: string, value: string | number | boolean | string[] | object) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSpecChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: field === 'seats' || field === 'doors' || field === 'luggage' ? value.toString() : value
      }
    }))
  }

  const handleAvailabilityChange = (field: string, value: string | number | boolean | string[]) => {
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

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploadingImages(true)
    const uploadedUrls: string[] = []

    // Cloudinary configuration - moved to environment variables for security and maintainability
    const CLOUDINARY_CONFIG = {
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET, // Note: This should ideally be server-side only
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    }

    // Validate configuration
    if (!CLOUDINARY_CONFIG.apiKey || !CLOUDINARY_CONFIG.apiSecret || !CLOUDINARY_CONFIG.cloudName) {
      console.error('Cloudinary configuration is incomplete. Please check environment variables.')
      setUploadingImages(false)
      return
    }

    const { apiKey, apiSecret, cloudName } = CLOUDINARY_CONFIG

    for (const file of Array.from(files)) {
      try {
        const timestamp = Math.floor(Date.now() / 1000)
        const signature = SHA1(`timestamp=${timestamp}${apiSecret}`).toString()

        const formDataUpload = new FormData()
        formDataUpload.append('file', file)
        formDataUpload.append('api_key', apiKey)
        formDataUpload.append('timestamp', timestamp.toString())
        formDataUpload.append('signature', signature)
        formDataUpload.append('folder', 'car-rental')

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formDataUpload
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Cloudinary upload failed:', response.status, errorData)
          continue // Skip this file and continue with others
        }

        const result = await response.json()
        if (result.secure_url) {
          uploadedUrls.push(result.secure_url)
        } else {
          console.error('No secure_url in response:', result)
        }
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

  const removeImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageUrl)
    }))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleImageUpload(e.dataTransfer.files)
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
        specifications: {
          ...formData.specifications,
          seats: parseInt(formData.specifications.seats),
          doors: parseInt(formData.specifications.doors),
          luggage: parseInt(formData.specifications.luggage),
        }
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
                onChange={(e) => handleSpecChange('seats', e.target.value)}
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
                onChange={(e) => handleSpecChange('doors', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="luggage">Luggage Capacity</Label>
              <Input
                id="luggage"
                type="number"
                value={formData.specifications.luggage}
                onChange={(e) => handleSpecChange('luggage', e.target.value)}
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
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
              id="image-upload"
            />
            <Label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex flex-col items-center space-y-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {uploadingImages ? 'Uploading...' : 'Drag and drop images here, or click to select'}
                </p>
                <Button type="button" variant="outline" disabled={uploadingImages} className="w-full sm:w-auto">
                  {uploadingImages ? 'Uploading...' : 'Select Images'}
                </Button>
              </div>
            </Label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.images.filter(image => image).map((image, index) => (
              <div key={image} className="relative">
                <Image
                  src={image}
                  alt={`Car image ${index + 1}`}
                  width={200}
                  height={96}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(image)}
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