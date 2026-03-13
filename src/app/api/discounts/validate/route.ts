// src/app/api/discounts/validate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Discount } from '@/models'

type DiscountLean = {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minOrder?: number
  maxUses?: number
  usedCount: number
}

export async function POST(req: NextRequest) {
  try {
    const { code, amount } = await req.json()
    if (!code) return NextResponse.json({ success: false, error: 'Code required' }, { status: 400 })

    await connectDB()

    const now      = new Date()
    const discount = await Discount.findOne({
      code:      code.toUpperCase().trim(),
      isActive:  true,
      isDeleted: false,
      startsAt:  { $lte: now },
      endsAt:    { $gte: now },
    }).lean<DiscountLean>()

    if (!discount) {
      return NextResponse.json({ success: false, error: 'Invalid or expired code' }, { status: 404 })
    }

    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return NextResponse.json({ success: false, error: 'This code has reached its usage limit' }, { status: 400 })
    }

    if (discount.minOrder && amount < discount.minOrder * 100) {
      return NextResponse.json({
        success: false,
        error:   `Minimum order of ₦${discount.minOrder.toLocaleString()} required`,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data:    { type: discount.type, value: discount.value, code: discount.code },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Validation failed' }, { status: 500 })
  }
}
