import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Vendor } from '@/models'

type Params = { params: { id: string } }

export async function GET(_: NextRequest, { params }: Params) {
  try {
    await connectDB()
    const vendor = await Vendor.findOne({
      _id:       params.id,
      status:    'verified',
      isDeleted: false,
    })
      .populate('userId', 'username isUsernamePublic')
      .lean()

    if (!vendor) return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: vendor })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}
