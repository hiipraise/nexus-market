import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Notification } from '@/models'
import { requireAuth } from '@/lib/auth/helpers'

export async function PATCH() {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()

    await Notification.updateMany(
      { userId: session!.user.id, isRead: false, isDeleted: false },
      { isRead: true }
    )

    return NextResponse.json({ success: true, message: 'All notifications marked as read' })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}
