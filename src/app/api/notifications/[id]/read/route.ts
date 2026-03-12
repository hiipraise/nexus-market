// src/app/api/notifications/[id]/read/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Notification } from '@/models'
import { requireAuth } from '@/lib/auth/helpers'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()

    await Notification.findOneAndUpdate(
      { _id: id, userId: session!.user.id },
      { isRead: true }
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}