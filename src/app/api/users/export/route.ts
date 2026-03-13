import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Order, Review, Notification } from '@/models'
import { requireAuth } from '@/lib/auth/helpers'
import User from '@/models/User'
import type { LeanOrder } from '@/types/lean'
import type { IUser } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()

    const [user, orders, reviews, notifications] = await Promise.all([
      User.findById(session!.user.id).lean<IUser | null>(),
      Order.find({ userId: session!.user.id, isDeleted: false }).lean<LeanOrder[]>(),
      Review.find({ userId: session!.user.id, isDeleted: false }).lean(),
      Notification.find({ userId: session!.user.id, isDeleted: false }).lean(),
    ])

    const exportData = {
      exportedAt:    new Date().toISOString(),
      user: {
        username:          user?.username,
        email:             user?.email,
        role:              user?.role,
        profile:           user?.profile,
        isUsernamePublic:  user?.isUsernamePublic,
        preferences:       user?.preferences,
        createdAt:         user?.createdAt,
      },
      orders: orders.map(o => ({
        orderNumber:     o.orderNumber,
        status:          o.orderStatus,
        paymentStatus:   o.paymentStatus,
        total:           o.total,
        items:           o.items,
        shippingAddress: o.shippingAddress,
        createdAt:       o.createdAt,
      })),
      reviews: reviews.map(r => ({
        rating:    r.rating,
        title:     r.title,
        body:      r.body,
        createdAt: r.createdAt,
      })),
      notifications: notifications.map(n => ({
        type:      n.type,
        title:     n.title,
        message:   n.message,
        isRead:    n.isRead,
        createdAt: n.createdAt,
      })),
    }

    const format = req.nextUrl.searchParams.get('format') ?? 'json'

    if (format === 'json') {
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type':        'application/json',
          'Content-Disposition': `attachment; filename="nexus-market-data-${session!.user.username}.json"`,
        },
      })
    }

    // CSV export (basic flattened orders)
    const { stringify } = await import('csv-stringify/sync')
    const rows = orders.map(o => ({
      order_number:  o.orderNumber,
      status:        o.orderStatus,
      payment:       o.paymentStatus,
      total_kobo:    o.total,
      created_at:    o.createdAt?.toISOString(),
    }))
    const csv = stringify(rows, { header: true })

    return new NextResponse(csv, {
      headers: {
        'Content-Type':        'text/csv',
        'Content-Disposition': `attachment; filename="nexus-market-orders-${session!.user.username}.csv"`,
      },
    })
  } catch (err) {
    console.error('[USER_EXPORT]', err)
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 })
  }
}
