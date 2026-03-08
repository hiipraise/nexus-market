import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/options'
import VendorDashboardClient from '@/components/dashboard/vendor/VendorDashboardClient'

export default async function VendorDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'vendor') redirect('/login')
  return <VendorDashboardClient />
}
