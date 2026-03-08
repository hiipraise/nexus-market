import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import { Ad, Vendor } from '@/models'
import { requireAuth, getSession } from '@/lib/auth/helpers'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const sp     = req.nextUrl.searchParams
    const type   = sp.get('type')
    const active = sp.get('active') === 'true'

    const filter: Record<string, unknown> = { isDeleted: false }
    if (type)   filter['type']     = type
    if (active) {
      const now    = new Date()
      filter['isActive'] = true
      filter['startsAt'] = { $lte: now }
      filter['endsAt']   = { $gte: now }
    }

    const ads = await Ad.find(filter)
      .sort({ createdAt: -1 })
      .populate('vendorId', 'businessName badge')
      .lean()

    return NextResponse.json({ success: true, data: ads })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch ads' }, { status: 500 })
  }
}

const CreateAdSchema = z.object({
  type:          z.enum(['banner', 'carousel', 'featured']),
  title:         z.string().min(3).max(100),
  imageUrl:      z.string().url(),
  imagePublicId: z.string(),
  linkUrl:       z.string().url().optional(),
  productId:     z.string().optional(),
  startsAt:      z.string(),
  endsAt:        z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth(['vendor'])
    if (error) return error

    await connectDB()

    const vendor = await Vendor.findOne({ userId: session!.user.id }).lean()
    if (!vendor || vendor.status !== 'verified') {
      return NextResponse.json({ success: false, error: 'Only verified vendors can run ads' }, { status: 403 })
    }

    const body  = await req.json()
    const parse = CreateAdSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: parse.error.flatten() }, { status: 400 })
    }

    const ad = await Ad.create({
      vendorId: vendor._id,
      ...parse.data,
      startsAt: new Date(parse.data.startsAt),
      endsAt:   new Date(parse.data.endsAt),
    })

    return NextResponse.json({ success: true, data: ad }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to create ad' }, { status: 500 })
  }
}
