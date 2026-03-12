import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connectDB } from '@/lib/db/connect'
import User from '@/models/User'
import { Vendor } from '@/models'
import VendorProfileClient from '@/components/vendors/VendorProfileClient'

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connectDB()
  const user   = await User.findOne({ username: params.username }).lean()
  if (!user) return { title: 'Vendor Not Found' }
  const vendor = await Vendor.findOne({ userId: user._id }).lean()
  return {
    title:       `${(vendor as any)?.businessName ?? params.username} — Nexus Market`,
    description: (vendor as any)?.description?.slice(0, 155),
  }
}

export default async function VendorProfilePage({ params }: Props) {
  await connectDB()
  const user = await User.findOne({ username: params.username }).lean()
  if (!user) notFound()

  const vendor = await Vendor.findOne({ userId: (user as any)._id, status: 'verified', isDeleted: false })
    .populate('userId', 'username isUsernamePublic')
    .lean()
  if (!vendor) notFound()

  return <VendorProfileClient vendor={JSON.parse(JSON.stringify(vendor))} />
}
