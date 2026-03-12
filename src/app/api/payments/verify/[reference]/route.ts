import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Order } from '@/models'
import { verifyPayment } from '@/lib/paystack'

type Params = { params: Promise<{ reference: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { reference } = await params

    await connectDB()

    const paymentData = await verifyPayment(reference) as any

    if (paymentData?.data?.status !== 'success') {
      return NextResponse.json(
        { success: false, error: 'Payment not successful' },
        { status: 400 }
      )
    }

    const order = await Order.findOne({ paystackReference: reference }).lean()

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: order })
  } catch (err) {
    console.error('[PAYMENT_VERIFY]', err)
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}