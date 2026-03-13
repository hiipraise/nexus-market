// src/api/discounts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import { Discount, Vendor } from '@/models'
import { requireAuth } from '@/lib/auth/helpers'

type VendorLean = {
  _id: string
  status: string
}

const CreateDiscountSchema = z.object({
  code:      z.string().min(3).max(20).toUpperCase(),
  type:      z.enum(['percentage', 'fixed']),
  value:     z.number().positive(),
  minOrder:  z.number().optional(),
  maxUses:   z.number().int().positive().optional(),
  startsAt:  z.string(),
  endsAt:    z.string(),
})

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth(['vendor'])
    if (error) return error

    await connectDB()

   const vendor = await Vendor.findOne({ userId: session!.user.id }).lean<VendorLean>()
    if (!vendor) return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 })

    const discounts = await Discount.find({ vendorId: vendor._id, isDeleted: false })
      .sort({ createdAt: -1 }).lean()

    return NextResponse.json({ success: true, data: discounts })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth(['vendor'])
    if (error) return error

    await connectDB()

    const vendor = await Vendor.findOne({ userId: session!.user.id }).lean<VendorLean>()
    if (!vendor || vendor.status !== 'verified') {
      return NextResponse.json({ success: false, error: 'Only verified vendors can create discounts' }, { status: 403 })
    }

    const body  = await req.json()
    const parse = CreateDiscountSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: parse.error.flatten() }, { status: 400 })
    }

    // Check duplicate code per vendor
    const existing = await Discount.findOne({ vendorId: vendor._id, code: parse.data.code, isDeleted: false })
    if (existing) return NextResponse.json({ success: false, error: 'Discount code already exists' }, { status: 409 })

    const discount = await Discount.create({
      vendorId: vendor._id,
      ...parse.data,
      startsAt: new Date(parse.data.startsAt),
      endsAt:   new Date(parse.data.endsAt),
    })

    return NextResponse.json({ success: true, data: discount }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to create discount' }, { status: 500 })
  }
}
