import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Order } from '@/models'
import { verifyPayment } from '@/lib/paystack'

type Params = { params: { reference: string } }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectDB()

    const paymentData = await verifyPayment(params.reference) as any

    if (paymentData?.data?.status !== 'success') {
      return NextResponse.json({ success: false, error: 'Payment not successful' }, { status: 400 })
    }

    const order = await Order.findOne({ paystackReference: params.reference }).lean()
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (err) {
    console.error('[PAYMENT_VERIFY]', err)
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 })
  }
}
