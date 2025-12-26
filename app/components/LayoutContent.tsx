'use client'

import { usePathname } from 'next/navigation'
import useAuth from '@/hooks/useAuth'
import Header from './providers/layout/header'
import Footer from './providers/layout/footer'
import AdminSidebar from './AdminSidebar'

interface LayoutContentProps {
  children: React.ReactNode
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname()
  const { isAdmin } = useAuth()
  const isAdminPage = pathname?.startsWith('/admin')

  if (isAdmin && isAdminPage) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}