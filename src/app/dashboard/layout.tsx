import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/options'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import type { ReactNode } from 'react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen pt-16 flex">
      <DashboardSidebar role={session.user.role} username={session.user.username} />
      <main className="flex-1 min-w-0 lg:ml-64">
        {children}
      </main>
    </div>
  )
}
