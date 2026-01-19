'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Trash2 } from 'lucide-react'
import CarForm from '@/app/components/admin/CarForm'
import CarsTable from '@/app/components/admin/CarsTable'
import StatsCards from '@/app/components/admin/StatsCards'
import { Car as CarType } from '@/types/car'

// Constants
const CARS_PER_PAGE = 10

export default function AdminCarsPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [cars, setCars] = useState<CarType[]>([])
  const [loadingCars, setLoadingCars] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [carToDelete, setCarToDelete] = useState<CarType | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCars, setTotalCars] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchCars = useCallback(async (page = currentPage) => {
    setLoadingCars(true)
    setError(null)
    try {
      const response = await fetch(`/api/cars?page=${page}&limit=${CARS_PER_PAGE}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch cars: ${response.statusText}`)
      }
      const data = await response.json()
      setCars(data.cars || [])
      setTotalCars(data.total || 0)
      setTotalPages(data.totalPages || 1)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching cars:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setLoadingCars(false)
    }
  }, [currentPage])

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        router.push('/')
        return
      }
      fetchCars()
    }
  }, [user, isAdmin, loading, router, fetchCars])

  const handleCreateCar = useCallback(() => {
    setSelectedCar(null)
    setIsCreateMode(true)
    setIsFormOpen(true)
  }, [])

  const handleEditCar = useCallback((car: CarType) => {
    setSelectedCar(car)
    setIsCreateMode(false)
    setIsFormOpen(true)
  }, [])

  const handleDeleteCar = useCallback((carId: string) => {
    const car = cars.find(c => c.id === carId)
    if (car) {
      setCarToDelete(car)
      setDeleteError(null) // Clear previous errors
      setIsDeleteDialogOpen(true)
    }
  }, [cars])

  const confirmDeleteCar = useCallback(async () => {
    if (!carToDelete || deleting) return

    setDeleting(true)
    setDeleteError(null)

    try {
      const response = await fetch(`/api/cars/${carToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete car: ${response.statusText}`)
      }

      setCars(prevCars => prevCars.filter(car => car.id !== carToDelete.id))
      // If current page becomes empty and not the first page, go to previous page
      if (cars.length === 1 && currentPage > 1) {
        fetchCars(currentPage - 1)
      }
      setIsDeleteDialogOpen(false)
      setCarToDelete(null)
    } catch (error) {
      console.error('Error deleting car:', error)
      setDeleteError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setDeleting(false)
    }
  }, [carToDelete, deleting, cars.length, currentPage, fetchCars])

  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false)
    fetchCars(1) // Refresh the list and go to first page
  }, [fetchCars])

  const handlePageChange = useCallback((page: number) => {
    fetchCars(page)
  }, [fetchCars])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Access denied. Admin privileges required.</div>
      </div>
    )
  }

  return (
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

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
          <Button onClick={() => fetchCars()} variant="outline" size="sm" className="mt-2">
            Retry
          </Button>
        </div>
      )}

      <StatsCards cars={cars} />

      <CarsTable
        cars={cars}
        loading={loadingCars}
        onEdit={handleEditCar}
        onDelete={handleDeleteCar}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCars={totalCars}
        onPageChange={handlePageChange}
        limit={CARS_PER_PAGE}
      />

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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Car</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{carToDelete?.name}&quot;? This action cannot be undone.
              {deleteError && <p className="text-red-600 mt-2">{deleteError}</p>}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCar} disabled={deleting} aria-label="Delete car">
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}