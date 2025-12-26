'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'
import client from '@/api/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Shield, Trash2, UserCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AdminUser {
  id: string
  email: string
  full_name: string
  created_at: string
  last_sign_in_at: string | null
}

export default function AdminManagement() {
  const { user, profile, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loadingAdmins, setLoadingAdmins] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  })

  useEffect(() => {
    if (!loading) {
    //   if (!user || !isAdmin) {
    //     router.push('/')
    //     return
    //   }
      fetchAdmins()
    }
  }, [user, isAdmin, loading, router])

  const fetchAdmins = async () => {
    try {
      const { data, error } = await client
        .from('profiles')
        .select(`
          id,
          full_name,
          created_at
        `)
        .eq('role', 'admin')

      if (error) throw error

      // Get auth data separately for each admin
      const adminsWithAuth = await Promise.all(
        data.map(async (admin: any) => {
          try {
            const { data: authData, error: authError } = await client.auth.admin.getUserById(admin.id)
            return {
              id: admin.id,
              email: authData?.user?.email || '',
              full_name: admin.full_name || '',
              created_at: admin.created_at,
              last_sign_in_at: authData?.user?.last_sign_in_at || null
            }
          } catch (authErr) {
            console.warn(`Could not fetch auth data for admin ${admin.id}:`, authErr)
            return {
              id: admin.id,
              email: '',
              full_name: admin.full_name || '',
              created_at: admin.created_at,
              last_sign_in_at: null
            }
          }
        })
      )

      setAdmins(adminsWithAuth)

      // The data transformation is now handled above
    } catch (error) {
      console.error('Error fetching admins:', error)
      toast.error('Failed to load admin users')
    } finally {
      setLoadingAdmins(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      // Create the user account
      const { data: authData, error: authError } = await client.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      if (authData.user) {
        // Create the profile with admin role
        const { error: profileError } = await client
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: formData.fullName,
            role: 'admin'
          })

        if (profileError) throw profileError

        toast.success('Admin user created successfully!')
        setShowCreateDialog(false)
        setFormData({ email: '', password: '', fullName: '' })
        fetchAdmins() // Refresh the list
      }
    } catch (error: any) {
      console.error('Error creating admin:', error)
      toast.error(error.message || 'Failed to create admin user')
    } finally {
      setCreating(false)
    }
  }

  const handleRemoveAdmin = async (adminId: string, adminEmail: string) => {
    if (!confirm(`Are you sure you want to remove admin privileges from ${adminEmail}?`)) {
      return
    }

    try {
      // Update the profile role to 'client' or remove admin role
      const { error } = await client
        .from('profiles')
        .update({ role: 'client' })
        .eq('id', adminId)

      if (error) throw error

      toast.success('Admin privileges removed successfully!')
      fetchAdmins() // Refresh the list
    } catch (error) {
      console.error('Error removing admin:', error)
      toast.error('Failed to remove admin privileges')
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
              <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
              <p className="text-gray-600 mt-2">Manage admin users and their privileges</p>
            </div>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Admin</DialogTitle>
                  <DialogDescription>
                    Add a new administrator to manage the system.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={creating}>
                      {creating ? 'Creating...' : 'Create Admin'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{admins.length}</div>
                <p className="text-xs text-muted-foreground">
                  System administrators
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Today</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {admins.filter(admin =>
                    admin.last_sign_in_at &&
                    new Date(admin.last_sign_in_at).toDateString() === new Date().toDateString()
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Signed in today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {admins.filter(admin => {
                    const createdDate = new Date(admin.created_at)
                    const now = new Date()
                    return createdDate.getMonth() === now.getMonth() &&
                           createdDate.getFullYear() === now.getFullYear()
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Added this month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Admins Table */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>Manage administrator accounts and privileges</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAdmins ? (
                <div className="text-center py-8">Loading admin users...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Sign In</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">
                          {admin.full_name || 'N/A'}
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-blue-500">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(admin.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {admin.last_sign_in_at
                            ? new Date(admin.last_sign_in_at).toLocaleDateString()
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {admins.length === 0 && !loadingAdmins && (
                <div className="text-center py-8 text-gray-500">
                  No admin users found
                </div>
              )}
            </CardContent>
          </Card>
    </div>
  )
}