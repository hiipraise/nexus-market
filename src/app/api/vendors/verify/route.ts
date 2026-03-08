import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import { Vendor, Notification } from '@/models'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth/helpers'

const VerificationSchema = z.object({
  profilePic:        z.string().url(),
  profilePicPublicId: z.string(),
  description:       z.string().min(50).max(2000),
})

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth(['vendor'])
    if (error) return error

    await connectDB()

    const vendor = await Vendor.findOne({ userId: session!.user.id })
    if (!vendor) return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 })
    if (vendor.status === 'verified') {
      return NextResponse.json({ success: false, error: 'Already verified' }, { status: 409 })
    }

    const body  = await req.json()
    const parse = VerificationSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: parse.error.flatten() }, { status: 400 })
    }

    await Vendor.findByIdAndUpdate(vendor._id, {
      profilePic:               parse.data.profilePic,
      profilePicPublicId:       parse.data.profilePicPublicId,
      description:              parse.data.description,
      verificationSubmittedAt:  new Date(),
      status:                   'pending',
    })

    // Notify admins
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).lean()
    await Notification.insertMany(
      admins.map(a => ({
        userId:  a._id,
        type:    'vendor_verified',
        title:   'New Vendor Verification Request',
        message: `${vendor.businessName} has submitted for verification.`,
        data:    { vendorId: String(vendor._id) },
      }))
    )

    return NextResponse.json({ success: true, message: 'Verification submitted. You will be notified once reviewed.' })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to submit verification' }, { status: 500 })
  }
}

// Admin approve/reject
export async function PATCH(req: NextRequest) {
  try {
    const { session, error } = await requireAuth(['admin', 'superadmin'])
    if (error) return error

    const { vendorId, action, reason } = await req.json()
    if (!vendorId || !action) {
      return NextResponse.json({ success: false, error: 'vendorId and action required' }, { status: 400 })
    }

    await connectDB()

    const vendor = await Vendor.findById(vendorId)
    if (!vendor) return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 })

    if (action === 'approve') {
      await Vendor.findByIdAndUpdate(vendorId, {
        status:     'verified',
        badge:      true,
        verifiedAt: new Date(),
        verifiedBy: session!.user.id,
      })
      await Notification.create({
        userId:  vendor.userId,
        type:    'vendor_verified',
        title:   'Congratulations! You are now verified',
        message: 'Your vendor account has been verified. You can now upload products and run ads.',
        data:    { vendorId },
      })
    } else if (action === 'reject') {
      await Vendor.findByIdAndUpdate(vendorId, { status: 'pending' })
      await Notification.create({
        userId:  vendor.userId,
        type:    'vendor_verified',
        title:   'Verification Update',
        message: reason ?? 'Your verification was not approved. Please review your submission.',
        data:    { vendorId },
      })
    } else if (action === 'ban') {
      await Vendor.findByIdAndUpdate(vendorId, { status: 'banned', badge: false })
    }

    return NextResponse.json({ success: true, message: `Vendor ${action}d` })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to update vendor status' }, { status: 500 })
  }
}
