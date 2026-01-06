 'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'
import client from '@/api/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageSquare, Eye, Reply, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Inquiry {
  id: string
  user_id: string
  car_id: string | null
  pickup_date: string
  return_date: string
  pickup_location: string
  dropoff_location: string | null
  message: string
  status: string
  admin_response: string | null
  created_at: string
  updated_at: string
  profiles: {
    full_name: string
    phone: string
  }
  cars: {
    name: string
    brand: string
    model: string
  } | null
}

export default function AdminInquiriesPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loadingInquiries, setLoadingInquiries] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isResponseOpen, setIsResponseOpen] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [responding, setResponding] = useState(false)

  useEffect(() => {
    if (!loading) {
      // if (!user || !isAdmin) {
      //   router.push('/')
      //   return
      // }
      fetchInquiries()
    }
  }, [user, isAdmin, loading, router])

  const fetchInquiries = async () => {
    setLoadingInquiries(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/inquiries', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch inquiries')
      }
      const data = await response.json()
      setInquiries(data.inquiries || [])
    } catch (error) {
      console.error('Error fetching inquiries:', error instanceof Error ? error.message : error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      toast.error('Failed to load inquiries')
    } finally {
      setLoadingInquiries(false)
    }
  }

  const handleRespond = async (inquiryId: string) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response')
      return
    }

    setResponding(true)
    try {
      const { error } = await client
        .from('inquiries')
        .update({
          status: 'responded',
          admin_response: responseText,
          updated_at: new Date().toISOString()
        })
        .eq('id', inquiryId)

      if (error) throw error

      // Create notification for user
      const inquiry = inquiries.find(i => i.id === inquiryId)
      if (inquiry) {
        await client
          .from('notifications')
          .insert({
            user_id: inquiry.user_id,
            type: 'inquiry_response',
            title: 'Inquiry Response',
            message: 'An admin has responded to your inquiry. Please check your inquiry details.',
            read: false
          })
      }

      toast.success('Response sent successfully!')
      setIsResponseOpen(false)
      setResponseText('')
      fetchInquiries()
    } catch (error) {
      console.error('Error responding to inquiry:', error)
      toast.error('Failed to send response')
    } finally {
      setResponding(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'responded':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Responded</Badge>
      case 'closed':
        return <Badge variant="outline"><CheckCircle className="w-3 h-3 mr-1" />Closed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Customer Inquiries</h1>
              <p className="text-gray-600 mt-2">Respond to customer inquiries and questions</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inquiries.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {inquiries.filter(i => i.status === 'pending').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Responded</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {inquiries.filter(i => i.status === 'responded').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {inquiries.filter(i => {
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return new Date(i.created_at) > weekAgo
                  }).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
              <Button onClick={() => fetchInquiries()} variant="outline" size="sm" className="mt-2">
                Retry
              </Button>
            </div>
          )}

          {/* Inquiries Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Inquiries</CardTitle>
              <CardDescription>Manage customer inquiries and responses</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInquiries ? (
                <div className="text-center py-8">Loading inquiries...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Pickup Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inquiries.map((inquiry) => (
                      <TableRow key={inquiry.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{inquiry.profiles?.full_name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{inquiry.profiles?.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{inquiry.cars?.name}</div>
                            <div className="text-sm text-gray-500">{inquiry.cars?.brand} {inquiry.cars?.model}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(inquiry.pickup_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(inquiry.status)}
                        </TableCell>
                        <TableCell>
                          {new Date(inquiry.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInquiry(inquiry)
                                setIsDetailOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {inquiry.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedInquiry(inquiry)
                                  setIsResponseOpen(true)
                                }}
                              >
                                <Reply className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {inquiries.length === 0 && !loadingInquiries && (
                <div className="text-center py-8 text-gray-500">
                  No inquiries found.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inquiry Detail Dialog */}

          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Inquiry Details</DialogTitle>
                <DialogDescription>
                  Customer inquiry information
                </DialogDescription>
              </DialogHeader>
              {selectedInquiry && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Customer</label>
                      <div className="mt-1 text-sm text-gray-600">
                        {selectedInquiry.profiles?.full_name || 'Unknown'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <div className="mt-1 text-sm text-gray-600">
                        {selectedInquiry.profiles?.phone}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Vehicle</label>
                    <div className="mt-1 text-sm text-gray-600">
                      {selectedInquiry.cars?.name} - {selectedInquiry.cars?.brand} {selectedInquiry.cars?.model}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Pickup Date</label>
                      <div className="mt-1 text-sm text-gray-600">
                        {new Date(selectedInquiry.pickup_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Return Date</label>
                      <div className="mt-1 text-sm text-gray-600">
                        {new Date(selectedInquiry.return_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Pickup Location</label>
                    <div className="mt-1 text-sm text-gray-600">
                      {selectedInquiry.pickup_location}
                    </div>
                  </div>

                  {selectedInquiry.dropoff_location && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Drop-off Location</label>
                      <div className="mt-1 text-sm text-gray-600">
                        {selectedInquiry.dropoff_location}
                      </div>
                    </div>
                  )}
 
                  {selectedInquiry.message && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Customer Message</label>
                      <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {selectedInquiry.message}
                      </div>
                    </div>
                  )}

                  {selectedInquiry.admin_response && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Admin Response</label>
                      <div className="mt-1 text-sm text-gray-600 bg-blue-50 p-3 rounded">
                        {selectedInquiry.admin_response}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedInquiry.status)}
                    </div>
                  </div>
                </div>
                </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Response Dialog */}
          <Dialog open={isResponseOpen} onOpenChange={setIsResponseOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Respond to Inquiry</DialogTitle>
                <DialogDescription>
                  Send a response to the customer inquiry
                </DialogDescription>
              </DialogHeader>
              {selectedInquiry && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Customer Inquiry</label>
                    <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {selectedInquiry.message || 'No message provided'}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="response">Your Response</Label>
                    <Textarea
                      id="response"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Enter your response to the customer..."
                      rows={6}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsResponseOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleRespond(selectedInquiry.id)}
                      disabled={responding || !responseText.trim()}
                    >
                      {responding ? 'Sending...' : 'Send Response'}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
  )
}