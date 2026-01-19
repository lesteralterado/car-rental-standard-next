import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Car, Star, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Car as CarType } from '@/types/car'
import Image from 'next/image'

interface CarsTableProps {
  cars: CarType[]
  loading: boolean
  onEdit: (car: CarType) => void
  onDelete: (carId: string) => void
  currentPage: number
  totalPages: number
  totalCars: number
  onPageChange: (page: number) => void
  limit: number
}

const CarsTable: React.FC<CarsTableProps> = ({
  cars,
  loading,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  totalCars,
  onPageChange,
  limit
}) => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const handleImageError = (carId: string) => {
    setImageErrors(prev => new Set(prev).add(carId))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Cars</CardTitle>
          <CardDescription>Manage your car fleet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading cars...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Cars</CardTitle>
        <CardDescription>Manage your car fleet</CardDescription>
      </CardHeader>
      <CardContent>
        {cars.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No cars found. Add your first car to get started.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Car</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price/Day</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {car.images && car.images.length > 0 && !imageErrors.has(car.id) ? (
                        //   <img
                        //     src={car.images[0]}
                        //     alt={car.name}
                        //     className="w-12 h-12 object-cover rounded"
                        //     onError={() => handleImageError(car.id)}
                        //   />
                          <Image
                            src={car.images[0]}
                            alt={car.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded"
                            loading="lazy"
                            onError={() => handleImageError(car.id)}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <Car className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{car.name}</div>
                          <div className="text-sm text-gray-500">{car.brand} {car.model} {car.year}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{car.category}</Badge>
                    </TableCell>
                    <TableCell>₱{car.pricePerDay.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant={car.availability.available ? "default" : "secondary"}>
                          {car.availability.available ? 'Available' : 'Unavailable'}
                        </Badge>
                        {car.featured && <Badge variant="default">Featured</Badge>}
                        {car.popular && <Badge variant="secondary">Popular</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        {car.rating.toFixed(1)} ({car.reviewCount})
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(car)}
                          aria-label={`Edit ${car.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(car.id)}
                          className="text-red-600 hover:text-red-700"
                          aria-label={`Delete ${car.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(currentPage * limit, totalCars)}</span> of{' '}
                      <span className="font-medium">{totalCars}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="rounded-l-md"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => onPageChange(page)}
                          className="rounded-none"
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="rounded-r-md"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default CarsTable