import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import { Report, Product, Vendor } from '@/models'
import { requireAuth, canModerate } from '@/lib/auth/helpers'
import { moderationConfig } from '@/config'
import { getPaginationMeta, parsePagination } from '@/lib/utils'
import User from '@/models/User'

const CreateReportSchema = z.object({
  entityType: z.enum(['product', 'vendor', 'review']),
  entityId:   z.string(),
  reason:     z.string().min(5).max(200),
  details:    z.string().max(1000).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth(['admin', 'superadmin', 'support'])
    if (error) return error

    await connectDB()

    const sp     = req.nextUrl.searchParams
    const { page, limit, skip } = parsePagination(sp)

    const filter: Record<string, unknown> = { isDeleted: false }
    if (sp.get('status'))     filter['status']     = sp.get('status')
    if (sp.get('entityType')) filter['entityType'] = sp.get('entityType')

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('reportedBy', 'username email')
        .lean(),
      Report.countDocuments(filter),
    ])

    return NextResponse.json({
      success: true,
      data:    reports,
      meta:    getPaginationMeta(total, page, limit),
    })
  } catch (err) {
    console.error('[REPORTS_GET]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch reports' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const body  = await req.json()
    const parse = CreateReportSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parse.error.flatten() },
        { status: 400 }
      )
    }

    const data = parse.data
    await connectDB()

    // Prevent duplicate reports by same user
    const existing = await Report.findOne({
      reportedBy: session!.user.id,
      entityType: data.entityType,
      entityId:   data.entityId,
      isDeleted:  false,
    })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You have already reported this item' },
        { status: 409 }
      )
    }

    const report = await Report.create({
      reportedBy:  session!.user.id,
      entityType:  data.entityType,
      entityId:    data.entityId,
      reason:      data.reason,
      details:     data.details,
    })

    // Count total reports for this entity
    const totalReports = await Report.countDocuments({
      entityType: data.entityType,
      entityId:   data.entityId,
      isDeleted:  false,
    })

    // Auto-moderation
    if (totalReports >= moderationConfig.suspendThreshold) {
      if (data.entityType === 'product') {
        await Product.findByIdAndUpdate(data.entityId, { status: 'suspended' })
      } else if (data.entityType === 'vendor') {
        await Vendor.findByIdAndUpdate(data.entityId, { status: 'suspended' })
      }
    } else if (totalReports >= moderationConfig.reviewThreshold) {
      // Flag for review (create notification for admins)
      const { Notification } = await import('@/models')
      const admins = await User.find({ role: { $in: ['admin', 'superadmin', 'support'] } }).lean()
      await Notification.insertMany(
        admins.map((a) => ({
          userId:  a._id,
          type:    'report_update',
          title:   'High Report Count',
          message: `A ${data.entityType} has received ${totalReports} reports and requires review.`,
          data:    { entityType: data.entityType, entityId: data.entityId },
        }))
      )
    }

    return NextResponse.json(
      { success: true, data: report, message: 'Report submitted successfully' },
      { status: 201 }
    )
  } catch (err) {
    console.error('[REPORTS_POST]', err)
    return NextResponse.json({ success: false, error: 'Failed to submit report' }, { status: 500 })
  }
}
