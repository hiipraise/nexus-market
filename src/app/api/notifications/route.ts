import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Notification } from '@/models'
import { requireAuth } from '@/lib/auth/helpers'

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()

    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '50')

    const notifications = await Notification.find({
      userId:    session!.user.id,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({ success: true, data: notifications })
  } catch (err) {
    console.error('[NOTIFICATIONS_GET]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 })
  }
}
