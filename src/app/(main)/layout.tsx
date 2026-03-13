import type { ReactNode } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AnnouncementBar from '@/components/shared/AnnouncementBar'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}
