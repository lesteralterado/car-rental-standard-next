'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Building2, 
  Bell, 
  CreditCard, 
  Shield, 
  Save,
  Globe,
  Mail,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
}

interface BookingSettings {
  minRentalDays: number;
  maxRentalDays: number;
  advanceBookingDays: number;
  cancellationDeadlineHours: number;
  requireDriverLicense: boolean;
  allowInternational: boolean;
}

interface NotificationSettings {
  emailBookingConfirmation: boolean;
  emailPaymentReceipt: boolean;
  emailReminders: boolean;
  emailMarketing: boolean;
  pushBookingUpdates: boolean;
  pushPaymentAlerts: boolean;
}

export default function AdminSettings() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Company Settings State
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: 'CarRental Pro',
    email: 'contact@carrental.com',
    phone: '+63 123 456 7890',
    address: '123 Main Street, Manila, Philippines',
    website: 'https://carrental.com',
  });

  // Booking Settings State
  const [bookingSettings, setBookingSettings] = useState<BookingSettings>({
    minRentalDays: 1,
    maxRentalDays: 30,
    advanceBookingDays: 90,
    cancellationDeadlineHours: 24,
    requireDriverLicense: true,
    allowInternational: true,
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailBookingConfirmation: true,
    emailPaymentReceipt: true,
    emailReminders: true,
    emailMarketing: false,
    pushBookingUpdates: true,
    pushPaymentAlerts: true,
  });

  const handleSaveCompanySettings = async () => {
    setSaving(true);
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Company settings saved successfully!');
    } catch (error) {
      console.error('Error saving company settings:', error);
      toast.error('Failed to save company settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBookingSettings = async () => {
    setSaving(true);
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Booking settings saved successfully!');
    } catch (error) {
      console.error('Error saving booking settings:', error);
      toast.error('Failed to save booking settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setSaving(true);
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification settings saved successfully!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Uncomment for production
  // if (!isAdmin) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-lg text-red-500">Access denied. Admin privileges required.</div>
  //     </div>
  //   );
  // }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your application settings and preferences</p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="booking" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Booking
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Update your company details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input
                    id="companyPhone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Website</Label>
                  <Input
                    id="companyWebsite"
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Address</Label>
                <Textarea
                  id="companyAddress"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveCompanySettings} disabled={saving} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Settings */}
        <TabsContent value="booking" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Booking Rules
              </CardTitle>
              <CardDescription>
                Configure rental duration and booking policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minRentalDays">Minimum Rental Days</Label>
                  <Input
                    id="minRentalDays"
                    type="number"
                    min="1"
                    value={bookingSettings.minRentalDays}
                    onChange={(e) => setBookingSettings({ ...bookingSettings, minRentalDays: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRentalDays">Maximum Rental Days</Label>
                  <Input
                    id="maxRentalDays"
                    type="number"
                    min="1"
                    value={bookingSettings.maxRentalDays}
                    onChange={(e) => setBookingSettings({ ...bookingSettings, maxRentalDays: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advanceBookingDays">Advance Booking (Days)</Label>
                  <Input
                    id="advanceBookingDays"
                    type="number"
                    min="1"
                    value={bookingSettings.advanceBookingDays}
                    onChange={(e) => setBookingSettings({ ...bookingSettings, advanceBookingDays: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cancellationDeadline">Cancellation Deadline (Hours)</Label>
                  <Input
                    id="cancellationDeadline"
                    type="number"
                    min="1"
                    value={bookingSettings.cancellationDeadlineHours}
                    onChange={(e) => setBookingSettings({ ...bookingSettings, cancellationDeadlineHours: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Requirements</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="requireLicense">Require Driver's License</Label>
                  </div>
                  <Switch
                    id="requireLicense"
                    checked={bookingSettings.requireDriverLicense}
                    onCheckedChange={(checked: boolean) => setBookingSettings({ ...bookingSettings, requireDriverLicense: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="allowInternational">Allow International Rentals</Label>
                  </div>
                  <Switch
                    id="allowInternational"
                    checked={bookingSettings.allowInternational}
                    onCheckedChange={(checked: boolean) => setBookingSettings({ ...bookingSettings, allowInternational: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveBookingSettings} disabled={saving} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Configure which email notifications are sent to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="emailConfirmation">Booking Confirmation Emails</Label>
                  </div>
                  <Switch
                    id="emailConfirmation"
                    checked={notificationSettings.emailBookingConfirmation}
                    onCheckedChange={(checked: boolean) => setNotificationSettings({ ...notificationSettings, emailBookingConfirmation: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="emailReceipt">Payment Receipt Emails</Label>
                  </div>
                  <Switch
                    id="emailReceipt"
                    checked={notificationSettings.emailPaymentReceipt}
                    onCheckedChange={(checked: boolean) => setNotificationSettings({ ...notificationSettings, emailPaymentReceipt: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="emailReminders">Rental Reminder Emails</Label>
                  </div>
                  <Switch
                    id="emailReminders"
                    checked={notificationSettings.emailReminders}
                    onCheckedChange={(checked: boolean) => setNotificationSettings({ ...notificationSettings, emailReminders: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="emailMarketing">Marketing Emails</Label>
                  </div>
                  <Switch
                    id="emailMarketing"
                    checked={notificationSettings.emailMarketing}
                    onCheckedChange={(checked: boolean) => setNotificationSettings({ ...notificationSettings, emailMarketing: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveNotificationSettings} disabled={saving} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage security and access control settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="120"
                    defaultValue="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    min="3"
                    max="10"
                    defaultValue="5"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="2fa">Require 2FA for Admin Users</Label>
                    <p className="text-sm text-gray-500">All admin accounts must use two-factor authentication</p>
                  </div>
                  <Switch id="2fa" defaultChecked={false} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Password Policy</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minPasswordLength">Min Password Length</Label>
                    <Input
                      id="minPasswordLength"
                      type="number"
                      min="6"
                      max="20"
                      defaultValue="8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                    <Input
                      id="passwordExpiry"
                      type="number"
                      min="30"
                      max="365"
                      defaultValue="90"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="historyCount">Password History Count</Label>
                    <Input
                      id="historyCount"
                      type="number"
                      min="1"
                      max="12"
                      defaultValue="5"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
