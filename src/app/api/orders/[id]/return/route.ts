// src/app/api/orders/[id]/return/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Order, Notification } from '@/models'
import { requireAuth } from '@/lib/auth/helpers'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const { session, error } = await requireAuth(['client'])
    if (error) return error

    const { reason } = await req.json()
    if (!reason)
      return NextResponse.json(
        { success: false, error: 'Reason required' },
        { status: 400 }
      )

    await connectDB()

    const order = await Order.findOne({
      _id: id,
      userId: session!.user.id,
      isDeleted: false,
    })

    if (!order)
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )

    if (order.orderStatus !== 'delivered') {
      return NextResponse.json(
        { success: false, error: 'Only delivered orders can be returned' },
        { status: 400 }
      )
    }

    if (order.returnRequest?.requested) {
      return NextResponse.json(
        { success: false, error: 'Return already requested' },
        { status: 409 }
      )
    }

    await Order.findByIdAndUpdate(id, {
      returnRequest: {
        requested: true,
        reason,
        requestedAt: new Date(),
        status: 'pending',
      },
    })

    const vendorIds = [...new Set(order.items.map((i: any) => String(i.vendorId)))]

    await Notification.insertMany(
      vendorIds.map(vendorId => ({
        userId: vendorId,
        type: 'return_requested',
        title: 'Return Request',
        message: `A buyer has requested a return for order #${order.orderNumber}.`,
        data: { orderId: id },
      }))
    )

    return NextResponse.json({
      success: true,
      message: 'Return request submitted',
    })
  } catch (err) {
    console.error('[ORDER_RETURN]', err)
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}