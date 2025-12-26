'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Bell, Eye, EyeOff, Trash2, Users, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import client from '@/api/client'

interface Notification {
  id: string
  user_id: string
  type: 'booking_submitted' | 'booking_approved' | 'booking_rejected' | 'payment_required' | 'license_verification'
  title: string
  message: string
  read: boolean
  booking_id?: string
  created_at: string
  profiles?: {
    full_name: string
  }[]
}

export default function AdminNotificationsPage() {
  const { user, profile, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(true)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    if (!loading) {
    //   if (!user || !isAdmin) {
    //     router.push('/')
    //     return
    //   }
      fetchNotifications()
    }
  }, [user, isAdmin, loading, router])

  const fetchNotifications = async () => {
    try {
      const { data, error } = await client
        .from('notifications')
        .select(`
          *,
          profiles!inner (
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await client
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAsUnread = async (notificationId: string) => {
    try {
      const { error } = await client
        .from('notifications')
        .update({ read: false })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: false } : n)
      )
    } catch (error) {
      console.error('Error marking notification as unread:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return

    try {
      const { error } = await client
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking_submitted':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'booking_approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'booking_rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'payment_required':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'license_verification':
        return <Users className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'booking_submitted':
        return 'bg-blue-100 text-blue-800'
      case 'booking_approved':
        return 'bg-green-100 text-green-800'
      case 'booking_rejected':
        return 'bg-red-100 text-red-800'
      case 'payment_required':
        return 'bg-orange-100 text-orange-800'
      case 'license_verification':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
    <div className="p-6">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-2">Manage system notifications</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{notifications.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unread</CardTitle>
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {notifications.filter(n => !n.read).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Booking Related</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {notifications.filter(n => n.type.includes('booking')).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => {
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return new Date(n.created_at) > weekAgo
                  }).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notifications Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>View and manage all system notifications</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingNotifications ? (
                <div className="text-center py-8">Loading notifications...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(notification.type)}
                            <Badge className={getTypeBadgeColor(notification.type)}>
                              {notification.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {notification.profiles?.[0]?.full_name || 'Unknown User'}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={notification.title}>
                            {notification.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={notification.read ? "secondary" : "default"}>
                            {notification.read ? 'Read' : 'Unread'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(notification.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedNotification(notification)
                                setIsDetailOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {notification.read ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAsUnread(notification.id)}
                              >
                                <EyeOff className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
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
              {notifications.length === 0 && !loadingNotifications && (
                <div className="text-center py-8 text-gray-500">
                  No notifications found.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Detail Dialog */}
          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {selectedNotification && getTypeIcon(selectedNotification.type)}
                  <span>{selectedNotification?.title}</span>
                </DialogTitle>
                <DialogDescription>
                  Notification details
                </DialogDescription>
              </DialogHeader>
              {selectedNotification && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <div className="mt-1">
                      <Badge className={getTypeBadgeColor(selectedNotification.type)}>
                        {selectedNotification.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">User</label>
                    <div className="mt-1 text-sm text-gray-600">
                      {selectedNotification.profiles?.[0]?.full_name || 'Unknown User'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Message</label>
                    <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {selectedNotification.message}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <Badge variant={selectedNotification.read ? "secondary" : "default"}>
                        {selectedNotification.read ? 'Read' : 'Unread'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Created</label>
                    <div className="mt-1 text-sm text-gray-600">
                      {new Date(selectedNotification.created_at).toLocaleString()}
                    </div>
                  </div>
                  {selectedNotification.booking_id && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Related Booking</label>
                      <div className="mt-1 text-sm text-blue-600">
                        Booking ID: {selectedNotification.booking_id}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
    </div>
  )
}