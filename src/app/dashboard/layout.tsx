// src/app/dashboard/layout.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/options'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import AnnouncementBar from '@/components/shared/AnnouncementBar'
import type { ReactNode } from 'react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <>
      <AnnouncementBar />
      <div
        className="min-h-screen flex"
        style={{ paddingTop: 'var(--announcement-bar-height, 0px)' }}
      >
        <DashboardSidebar role={session.user.role} username={session.user.username} />
        <main className="flex-1 min-w-0 lg:ml-64">
          {children}
        </main>
      </div>
    </>
  )
}
