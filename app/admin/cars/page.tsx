'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Car, Star, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import AdminSidebar from '@/app/components/AdminSidebar'
import CarForm from '@/app/components/admin/CarForm'
import { Car as CarType } from '@/types/car'

export default function AdminCarsPage() {
  const { user, profile, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [cars, setCars] = useState<CarType[]>([])
  const [loadingCars, setLoadingCars] = useState(true)
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCars, setTotalCars] = useState(0)
  const limit = 10

  useEffect(() => {
    if (!loading) {
    //   if (!user || !isAdmin) {
    //     router.push('/')
    //     return
    //   }
      fetchCars()
    }
  }, [user, isAdmin, loading, router])

  const fetchCars = async (page = currentPage) => {
    try {
      const response = await fetch(`/api/cars?page=${page}&limit=${limit}`)
      if (response.ok) {
        const data = await response.json()
        setCars(data.cars)
        setTotalCars(data.total)
        setTotalPages(data.totalPages)
        setCurrentPage(page)
      } else {
        console.error('Failed to fetch cars')
      }
    } catch (error) {
      console.error('Error fetching cars:', error)
    } finally {
      setLoadingCars(false)
    }
  }

  const handleCreateCar = () => {
    setSelectedCar(null)
    setIsCreateMode(true)
    setIsFormOpen(true)
  }

  const handleEditCar = (car: CarType) => {
    setSelectedCar(car)
    setIsCreateMode(false)
    setIsFormOpen(true)
  }

  const handleDeleteCar = async (carId: string) => {
    if (!confirm('Are you sure you want to delete this car?')) return

    try {
      const response = await fetch(`/api/cars/${carId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCars(cars.filter(car => car.id !== carId))
      } else {
        console.error('Failed to delete car')
      }
    } catch (error) {
      console.error('Error deleting car:', error)
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    fetchCars(1) // Refresh the list and go to first page
  }

  const handlePageChange = (page: number) => {
    fetchCars(page)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

//   if (!isAdmin) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-lg text-red-500">Access denied. Admin privileges required.</div>
//       </div>
//     )
//   }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1">
        <div className="p-6">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fleet Management</h1>
              <p className="text-gray-600 mt-2">Manage your car inventory</p>
            </div>
            <Button onClick={handleCreateCar} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add New Car
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cars.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {cars.filter(car => car.availability.available).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Featured</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {cars.filter(car => car.featured).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Popular</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {cars.filter(car => car.popular).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cars Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Cars</CardTitle>
              <CardDescription>Manage your car fleet</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCars ? (
                <div className="text-center py-8">Loading cars...</div>
              ) : (
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
                            {car.images && car.images.length > 0 ? (
                              <img
                                src={car.images[0]}
                                alt={car.name}
                                className="w-12 h-12 object-cover rounded"
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
                              onClick={() => handleEditCar(car)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCar(car.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {cars.length === 0 && !loadingCars && (
                <div className="text-center py-8 text-gray-500">
                  No cars found. Add your first car to get started.
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
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
                          onClick={() => handlePageChange(currentPage - 1)}
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
                            onClick={() => handlePageChange(page)}
                            className="rounded-none"
                          >
                            {page}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
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
            </CardContent>
          </Card>

          {/* Car Form Dialog */}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {isCreateMode ? 'Add New Car' : 'Edit Car'}
                </DialogTitle>
                <DialogDescription>
                  {isCreateMode
                    ? 'Fill in the details to add a new car to your fleet.'
                    : 'Update the car details below.'
                  }
                </DialogDescription>
              </DialogHeader>
              <CarForm
                car={selectedCar}
                onSuccess={handleFormSuccess}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}