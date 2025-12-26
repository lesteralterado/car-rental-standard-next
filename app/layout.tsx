import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import './globals.css'
// import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AuthProvider } from './components/context/AuthProvider'
import Chatbot from './components/Chatbot'
import Header from './components/providers/layout/header'
import Footer from './components/providers/layout/footer'
import AdminSidebar from './components/AdminSidebar'
import LayoutContent from './components/LayoutContent'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const montserrat = Montserrat({ 
  subsets: ['latin'], 
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700', '800']
})

export const metadata: Metadata = {
  title: {
    default: 'CarRental Pro - Premium Car Rental Service in Philippines',
    template: '%s | CarRental Pro'
  },
  description: 'Rent premium cars at affordable prices across Philippines. Wide selection of vehicles, instant booking, 24/7 support, and flexible rental options.',
  keywords: [
    'car rental Philippines', 
    'rent a car Manila', 
    'vehicle rental Cebu', 
    'car hire Davao', 
    'premium car rental',
    'affordable car rental',
    'instant booking'
  ],
  authors: [{ name: 'CarRental Pro Team' }],
  creator: 'CarRental Pro',
  publisher: 'CarRental Pro',
  openGraph: {
    type: 'website',
    locale: 'en_PH',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://carrental-pro.vercel.app',
    title: 'CarRental Pro - Premium Car Rental Service',
    description: 'Rent premium cars at affordable prices across Philippines. Wide selection, instant booking, 24/7 support.',
    siteName: 'CarRental Pro',
    images: [
      {
        url: '/public/assets/logo.png',
        width: 1200,
        height: 630,
        alt: 'CarRental Pro - Premium Car Rental Service'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CarRental Pro - Premium Car Rental Service',
    description: 'Rent premium cars at affordable prices across Philippines.',
    creator: '@carrentalpro',
    images: ['/images/og-image.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href='/assets/Untitled design (6).png' type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${inter.variable} ${montserrat.variable} font-sans antialiased`}>
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        > */}
          <div className="min-h-screen bg-background text-foreground">
            <AuthProvider>
              <LayoutContent>
                {children}
              </LayoutContent>
            </AuthProvider>
            <Chatbot />
          </div>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        {/* </ThemeProvider> */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}