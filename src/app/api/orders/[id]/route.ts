import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Order, Notification, Vendor } from '@/models'
import { requireAuth, getSession } from '@/lib/auth/helpers'
import { z } from 'zod'
import type { LeanOrder, LeanVendor } from '@/types/lean'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    await connectDB()

    const order = await Order.findOne({
      $or: [{ _id: id }, { orderNumber: id }],
      isDeleted: false,
    }).lean<LeanOrder | null>()

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    const session = await getSession()

    if (session) {
      if (session.user.role === 'client' && String(order.userId) !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({ success: true, data: order })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

const UpdateTrackingSchema = z.object({
  status: z.enum(['processing','shipped','out_for_delivery','delivered','cancelled']),
  note: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const { session, error } = await requireAuth(['vendor','admin','superadmin'])
    if (error) return error

    const body = await req.json()
    const parse = UpdateTrackingSchema.safeParse(body)

    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    await connectDB()

    const order = await Order.findById(id)

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    if (session!.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ userId: session!.user.id }).lean<LeanVendor | null>()

      const isVendorOrder = order.items.some(
        (i: { vendorId: string }) => String(i.vendorId) === String(vendor?._id)
      )

      if (!isVendorOrder) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    await Order.findByIdAndUpdate(id, {
      orderStatus: parse.data.status,
      $push: {
        tracking: {
          status: parse.data.status,
          note: parse.data.note,
          timestamp: new Date(),
          updatedBy: session!.user.id,
        },
      },
    })

    if (order.userId) {
      await Notification.create({
        userId: order.userId,
        type: 'order_status_update',
        title: 'Order Updated',
        message: `Order ${order.orderNumber} is now ${parse.data.status.replace(/_/g, ' ')}`,
        data: { orderId: id, orderNumber: order.orderNumber },
      })
    }

    return NextResponse.json({ success: true, message: 'Order updated' })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
