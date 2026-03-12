import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Report } from '@/models'
import { requireAuth } from '@/lib/auth/helpers'

type Params = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const { error } = await requireAuth(['admin', 'superadmin', 'support'])
    if (error) return error

    await connectDB()

    const report = await Report.findById(id)
      .populate('reportedBy', 'username')
      .populate('resolvedBy', 'username')
      .lean()

    if (!report) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: report })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const { session, error } = await requireAuth(['admin', 'superadmin', 'support'])
    if (error) return error

    const { status, notes } = await req.json()

    await connectDB()

    const report = await Report.findByIdAndUpdate(
      id,
      {
        status,
        ...(notes ? { adminNotes: notes } : {}),
        ...(status === 'resolved' || status === 'dismissed'
          ? { resolvedBy: session!.user.id, resolvedAt: new Date() }
          : {}),
      },
      { new: true }
    ).lean()

    return NextResponse.json({ success: true, data: report })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}