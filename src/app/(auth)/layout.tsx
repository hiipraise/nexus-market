import type { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import Navbar from '@/components/layout/Navbar'

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-[#070212]">
      {session && <Navbar />}
      {children}
    </div>
  )
}
