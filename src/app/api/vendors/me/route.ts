import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Vendor } from '@/models'
import { requireAuth } from '@/lib/auth/helpers'
import { z } from 'zod'

export async function GET() {
  try {
    const { session, error } = await requireAuth(['vendor'])
    if (error) return error
    await connectDB()
    const vendor = await Vendor.findOne({ userId: session!.user.id })
      .populate('userId', 'username email profile isUsernamePublic')
      .lean()
    if (!vendor) return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: vendor })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}

const UpdateVendorSchema = z.object({
  businessName:      z.string().min(2).max(100).optional(),
  description:       z.string().max(2000).optional(),
  phone:             z.string().optional(),
  whatsapp:          z.string().optional(),
  profilePic:        z.string().url().optional(),
  profilePicPublicId: z.string().optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const { session, error } = await requireAuth(['vendor'])
    if (error) return error
    const body  = await req.json()
    const parse = UpdateVendorSchema.safeParse(body)
    if (!parse.success) return NextResponse.json({ success: false, error: 'Validation failed' }, { status: 400 })
    await connectDB()
    const vendor = await Vendor.findOneAndUpdate(
      { userId: session!.user.id },
      { $set: parse.data },
      { new: true }
    ).lean()
    return NextResponse.json({ success: true, data: vendor })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}
