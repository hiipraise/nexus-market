import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import { Payout, Vendor } from '@/models'
import { requireAuth } from '@/lib/auth/helpers'
import { generateReference } from '@/lib/utils'
import { platformConfig } from '@/config'
import { createTransferRecipient, initiateTransfer } from '@/lib/paystack'
import { getPaginationMeta, parsePagination } from '@/lib/utils'
import type { LeanVendor } from '@/types/lean'

const RequestPayoutSchema = z.object({
  amount:        z.number().positive(),  // in kobo
  bankCode:      z.string(),
  accountNumber: z.string(),
  accountName:   z.string(),
})

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth(['vendor', 'admin', 'superadmin'])
    if (error) return error

    await connectDB()

    const sp     = req.nextUrl.searchParams
    const { page, limit, skip } = parsePagination(sp)
    const filter: Record<string, unknown> = { isDeleted: false }

    if (session!.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ userId: session!.user.id }).lean<LeanVendor | null>()
      if (!vendor) return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 })
      filter['vendorId'] = vendor._id
    }

    const [payouts, total] = await Promise.all([
      Payout.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Payout.countDocuments(filter),
    ])

    return NextResponse.json({ success: true, data: payouts, meta: getPaginationMeta(total, page, limit) })
  } catch (err) {
    console.error('[PAYOUTS_GET]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch payouts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth(['vendor'])
    if (error) return error

    const body  = await req.json()
    const parse = RequestPayoutSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: parse.error.flatten() }, { status: 400 })
    }

    const { amount, bankCode, accountNumber, accountName } = parse.data

    if (amount < platformConfig.payoutMinKobo) {
      return NextResponse.json({
        success: false,
        error: `Minimum payout is ${platformConfig.currencySymbol}${platformConfig.payoutMinKobo / 100}`,
      }, { status: 400 })
    }

    await connectDB()

    const vendor = await Vendor.findOne({ userId: session!.user.id })
    if (!vendor) return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 })
    if (vendor.balance < amount) {
      return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 })
    }

    const reference = generateReference()

    // Create Paystack transfer recipient
    const recipient = await createTransferRecipient({ accountName, accountNumber, bankCode })

    // Deduct from vendor balance
    await Vendor.findByIdAndUpdate(vendor._id, { $inc: { balance: -amount } })

    // Initiate transfer
    await initiateTransfer({
      amountKobo:    amount,
      recipientCode: recipient.recipient_code,
      reference,
      reason:        'Nexus Market vendor payout',
    })

    const payout = await Payout.create({
      vendorId:      vendor._id,
      amount,
      status:        'processing',
      reference,
      bankCode,
      accountNumber,
      accountName,
    })

    return NextResponse.json({ success: true, data: payout, message: 'Payout initiated' }, { status: 201 })
  } catch (err) {
    console.error('[PAYOUTS_POST]', err)
    return NextResponse.json({ success: false, error: 'Payout failed. Please try again.' }, { status: 500 })
  }
}
