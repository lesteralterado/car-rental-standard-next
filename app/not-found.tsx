import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Search, ArrowLeft, Car, Phone, Mail } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-9xl font-bold text-blue-100 select-none">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Car className="h-24 w-24 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Oops! Page Not Found
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              The page you&quot;re looking for seems to have taken a detour. Don&quot;t worry,
              let&quot;s get you back on track!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/">
                <Button className="w-full h-12 text-base font-medium" size="lg">
                  <Home className="mr-2 h-5 w-5" />
                  Go Home
                </Button>
              </Link>

              <Link href="/cars">
                <Button variant="outline" className="w-full h-12 text-base font-medium" size="lg">
                  <Car className="mr-2 h-5 w-5" />
                  Browse Cars
                </Button>
              </Link>
            </div>

            {/* Alternative Actions */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">
                Or try one of these helpful options:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <Link
                  href="/"
                  className="flex items-center justify-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>

                <Link
                  href="/cars"
                  className="flex items-center justify-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search Cars
                </Link>

                <Link
                  href="/contact"
                  className="flex items-center justify-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Contact Info */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">
                Need help? Get in touch with our support team:
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-blue-500" />
                  <span>+63 123 456 7890</span>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-blue-500" />
                  <span>support@carrentalpro.com</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fun Message */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 italic">
            &quot;Even the best drivers take wrong turns sometimes!&quot; 🏎️
          </p>
        </div>
      </div>
    </div>
  )
}