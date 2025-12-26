'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'
import client from '@/api/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, TrendingUp, DollarSign, Calendar, Download, FileText } from 'lucide-react'

interface BookingReport {
  id: string
  created_at: string
  status: string
  total_price: number
  payment_status: string
  profiles: {
    full_name: string
  }[]
  cars: {
    name: string
    brand: string
    model: string
  }[]
}

interface RevenueData {
  month: string
  revenue: number
  bookings: number
}

export default function AdminReportsPage() {
  const { user, profile, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingReport[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalBookings, setTotalBookings] = useState(0)
  const [completedBookings, setCompletedBookings] = useState(0)

  useEffect(() => {
    if (!loading) {
      // if (!user || !isAdmin) {
      //   router.push('/')
      //   return
      // }
      fetchReports()
    }
  }, [user, isAdmin, loading, router])

  const fetchReports = async () => {
    try {
      // Fetch all bookings for reports
      const { data: bookingsData, error: bookingsError } = await client
        .from('bookings')
        .select(`
          id,
          created_at,
          status,
          total_price,
          payment_status,
          profiles:user_id (
            full_name
          ),
          cars:car_id (
            name,
            brand,
            model
          )
        `)
        .order('created_at', { ascending: false })

      if (bookingsError) throw bookingsError

      setBookings(bookingsData || [])
      setTotalBookings(bookingsData?.length || 0)
      setCompletedBookings(bookingsData?.filter(b => b.status === 'completed').length || 0)

      // Calculate total revenue from paid bookings
      const paidBookings = bookingsData?.filter(b => b.payment_status === 'paid') || []
      const revenue = paidBookings.reduce((sum, booking) => sum + booking.total_price, 0)
      setTotalRevenue(revenue)

      // Generate monthly revenue data
      const monthlyData = generateMonthlyRevenueData(bookingsData || [])
      setRevenueData(monthlyData)

    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoadingReports(false)
    }
  }

  const generateMonthlyRevenueData = (bookings: BookingReport[]): RevenueData[] => {
    const monthlyMap = new Map<string, { revenue: number; bookings: number }>()

    bookings
      .filter(b => b.payment_status === 'paid')
      .forEach(booking => {
        const date = new Date(booking.created_at)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { revenue: 0, bookings: 0 })
        }

        const current = monthlyMap.get(monthKey)!
        monthlyMap.set(monthKey, {
          revenue: current.revenue + booking.total_price,
          bookings: current.bookings + 1
        })
      })

    return Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => ({
        month: key.split('-')[1] + '/' + key.split('-')[0].slice(-2),
        revenue: data.revenue,
        bookings: data.bookings
      }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>
      case 'confirmed':
        return <Badge variant="default" className="bg-blue-500">Confirmed</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const exportToCSV = () => {
    const csvData = bookings.map(booking => ({
      'Booking ID': booking.id,
      'Customer': booking.profiles?.[0]?.full_name || 'Unknown',
      'Vehicle': `${booking.cars?.[0]?.brand} ${booking.cars?.[0]?.model}`,
      'Status': booking.status,
      'Total Price': booking.total_price,
      'Payment Status': booking.payment_status,
      'Created Date': new Date(booking.created_at).toLocaleDateString()
    }))

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `booking-reports-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // if (!isAdmin) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-lg text-red-500">Access denied. Admin privileges required.</div>
  //     </div>
  //   )
  // }

  return (
    <div className="p-6">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600 mt-2">View rental history and business insights</p>
            </div>
            <Button onClick={exportToCSV} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  From paid bookings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalBookings}</div>
                <p className="text-xs text-muted-foreground">
                  All time bookings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Rentals</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{completedBookings}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Booking Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(2) : '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per booking
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Reports Tabs */}
          <Tabs defaultValue="bookings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bookings">Booking History</TabsTrigger>
              <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Bookings</CardTitle>
                  <CardDescription>Complete history of all customer bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingReports ? (
                    <div className="text-center py-8">Loading booking history...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Total Price</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-mono text-sm">
                              {booking.id.slice(0, 8)}...
                            </TableCell>
                            <TableCell>
                              {booking.profiles?.[0]?.full_name || 'Unknown'}
                            </TableCell>
                            <TableCell>
                              {booking.cars?.[0]?.name}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(booking.status)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={booking.payment_status === 'paid' ? 'default' : 'secondary'}>
                                {booking.payment_status}
                              </Badge>
                            </TableCell>
                            <TableCell>${booking.total_price.toFixed(2)}</TableCell>
                            <TableCell>
                              {new Date(booking.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  {bookings.length === 0 && !loadingReports && (
                    <div className="text-center py-8 text-gray-500">
                      No bookings found.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                  <CardDescription>Revenue breakdown by month</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingReports ? (
                    <div className="text-center py-8">Loading revenue data...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead>Bookings</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Avg. per Booking</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {revenueData.map((data) => (
                          <TableRow key={data.month}>
                            <TableCell className="font-medium">{data.month}</TableCell>
                            <TableCell>{data.bookings}</TableCell>
                            <TableCell>${data.revenue.toFixed(2)}</TableCell>
                            <TableCell>
                              ${data.bookings > 0 ? (data.revenue / data.bookings).toFixed(2) : '0.00'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  {revenueData.length === 0 && !loadingReports && (
                    <div className="text-center py-8 text-gray-500">
                      No revenue data available.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
    </div>
  )
}