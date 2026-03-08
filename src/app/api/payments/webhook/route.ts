import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Order, Vendor, Notification } from '@/models'
import { verifyWebhookSignature } from '@/lib/paystack'

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-paystack-signature') ?? ''
    const payload   = await req.text()

    if (!verifyWebhookSignature(payload, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(payload)
    await connectDB()

    switch (event.event) {
      case 'charge.success': {
        const ref   = event.data.reference as string
        const order = await Order.findOne({ paystackRef: ref })
        if (!order) break

        await Order.findByIdAndUpdate(order._id, {
          paymentStatus: 'success',
          orderStatus:   'payment_confirmed',
          paystackData:  event.data,
          $push: {
            tracking: {
              status:    'payment_confirmed',
              note:      'Payment confirmed via Paystack',
              timestamp: new Date(),
            },
          },
        })

        // Update vendor balances and sales
        for (const item of order.items) {
          await Vendor.findByIdAndUpdate(item.vendorId, {
            $inc: {
              totalSales:   item.quantity,
              totalRevenue: item.vendorAmount,
              balance:      item.vendorAmount,
            },
          })

          // Decrement stock
          await import('@/models').then(({ Product }) =>
            Product.updateOne(
              { _id: item.productId, 'variants.size': item.size },
              { $inc: { 'variants.$.quantity': -item.quantity, purchases: item.quantity } }
            )
          )
        }

        // Notify user / vendor
        if (order.userId) {
          await Notification.create({
            userId:  order.userId,
            type:    'payment_received',
            title:   'Payment Confirmed',
            message: `Your order ${order.orderNumber} has been confirmed.`,
            data:    { orderId: order._id, orderNumber: order.orderNumber },
          })
        }

        break
      }

      case 'charge.failed': {
        const ref   = event.data.reference as string
        const order = await Order.findOne({ paystackRef: ref })
        if (!order) break

        await Order.findByIdAndUpdate(order._id, {
          paymentStatus: 'failed',
          orderStatus:   'cancelled',
        })
        break
      }

      case 'transfer.success': {
        const { Payout } = await import('@/models')
        await Payout.findOneAndUpdate(
          { reference: event.data.reference },
          { status: 'paid', processedAt: new Date() }
        )
        break
      }

      case 'transfer.failed':
      case 'transfer.reversed': {
        const { Payout } = await import('@/models')
        const payout = await Payout.findOneAndUpdate(
          { reference: event.data.reference },
          { status: 'failed' },
          { new: true }
        )
        if (payout) {
          // Refund balance to vendor
          await Vendor.findByIdAndUpdate(payout.vendorId, {
            $inc: { balance: payout.amount },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[WEBHOOK]', err)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
