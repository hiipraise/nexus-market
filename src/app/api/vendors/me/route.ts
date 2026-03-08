import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Vendor } from '@/models'
import { requireAuth } from '@/lib/auth/helpers'

export async function GET() {
  try {
    const { session, error } = await requireAuth(['vendor'])
    if (error) return error

    await connectDB()

    const vendor = await Vendor.findOne({ userId: session!.user.id })
      .populate('userId', 'username email profile isUsernamePublic')
      .lean()

    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor profile not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: vendor })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch vendor' }, { status: 500 })
  }
}
