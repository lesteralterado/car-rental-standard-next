import { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Contact Us - CarRental Pro',
  description: 'Get in touch with CarRental Pro. Contact us for bookings, support, or inquiries. Multiple locations across the Philippines with 24/7 customer service.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              We're here to help with your car rental needs
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info & Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Get In Touch</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <Phone className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <CardTitle className="text-lg">Phone</CardTitle>
                    <CardDescription>Call us anytime</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">+63 123 456 7890</p>
                  <p className="text-sm text-gray-500">24/7 Customer Support</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <Mail className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <CardTitle className="text-lg">Email</CardTitle>
                    <CardDescription>Send us a message</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">info@carrentalpro.com</p>
                  <p className="text-gray-600">support@carrentalpro.com</p>
                  <p className="text-sm text-gray-500">We respond within 2 hours</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <CardTitle className="text-lg">Locations</CardTitle>
                    <CardDescription>Visit our offices</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900">Manila Main Office</p>
                      <p className="text-gray-600">123 Luxury Drive, Makati City</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Cebu Branch</p>
                      <p className="text-gray-600">456 Beach Road, Cebu City</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Davao Office</p>
                      <p className="text-gray-600">789 Mountain View, Davao City</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <Clock className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <CardTitle className="text-lg">Business Hours</CardTitle>
                    <CardDescription>When we're open</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-gray-600">
                    <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
                    <p>Saturday: 9:00 AM - 6:00 PM</p>
                    <p>Sunday: 10:00 AM - 4:00 PM</p>
                    <p className="text-sm text-gray-500">Emergency support available 24/7</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <Input id="firstName" placeholder="John" required />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <Input id="lastName" placeholder="Doe" required />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input id="email" type="email" placeholder="john@example.com" required />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <Input id="phone" type="tel" placeholder="+63 123 456 7890" />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <Input id="subject" placeholder="How can we help you?" required />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <Button type="submit" className="w-full flex items-center justify-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Locations</h2>
            <p className="text-xl text-gray-600">
              Find us across major cities in the Philippines
            </p>
          </div>

          <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg">Interactive Map Coming Soon</p>
              <p>Visit our locations in Manila, Cebu, and Davao</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Quick answers to common questions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What documents do I need to rent a car?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Valid driver's license, government-issued ID, and proof of address. International visitors need a passport and international driving permit.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's your minimum rental period?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Minimum rental is 24 hours (1 day). We offer daily, weekly, and monthly rates with discounts for longer rentals.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer one-way rentals?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! One-way rentals are available between our major locations with a small drop-off fee.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What if I have an accident?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Contact our 24/7 roadside assistance immediately. We provide comprehensive insurance coverage and support.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}