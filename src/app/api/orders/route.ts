// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import { Order, Product, Cart } from '@/models'
import { getSession } from '@/lib/auth/helpers'
import {
  generateOrderNumber,
  generateReference,
  getPaginationMeta,
  parsePagination,
} from '@/lib/utils'
import { calculatePlatformFee, initializePayment } from '@/lib/paystack'
import { appConfig } from '@/config'
import type { LeanOrderItem, LeanProductWithVendorId, LeanVendor } from '@/types/lean'

const OrderItemSchema = z.object({
  productId: z.string(),
  size:      z.string(),
  quantity:  z.number().int().positive(),
})

const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  shippingAddress: z.object({
    name:    z.string(),
    phone:   z.string(),
    street:  z.string(),
    city:    z.string(),
    state:   z.string(),
    country: z.string().default('Nigeria'),
    zipCode: z.string().optional(),
  }),
  guestInfo: z.object({
    email: z.string().email(),
    name:  z.string(),
    phone: z.string(),
  }).optional(),
  discountCode:  z.string().optional(),
  shippingFee:   z.number().default(0),
})

type CreateOrderInput = z.infer<typeof CreateOrderSchema>

// ── GET /api/orders ────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const sp     = req.nextUrl.searchParams
    const { page, limit, skip } = parsePagination(sp)

    const isAdmin = ['admin', 'superadmin'].includes(session.user.role)
    const filter: Record<string, unknown> = { isDeleted: false }

    if (!isAdmin) {
      if (session.user.role === 'vendor') {
        const { Vendor } = await import('@/models')
        const vendor = await Vendor.findOne({ userId: session.user.id }).lean<LeanVendor | null>()
        if (!vendor) return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 })
        filter['items.vendorId'] = vendor._id
      } else {
        filter['userId'] = session.user.id
      }
    }

    if (sp.get('status')) filter['orderStatus']  = sp.get('status')
    if (sp.get('payment')) filter['paymentStatus'] = sp.get('payment')

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ])

    return NextResponse.json({
      success: true,
      data:    orders,
      meta:    getPaginationMeta(total, page, limit),
    })
  } catch (err) {
    console.error('[ORDERS_GET]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// ── POST /api/orders ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    const body    = await req.json()

    const parse = CreateOrderSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parse.error.flatten() },
        { status: 400 }
      )
    }

    const data: CreateOrderInput = parse.data

    // Guest requires guestInfo
    if (!session && !data.guestInfo) {
      return NextResponse.json(
        { success: false, error: 'Guest info required for guest checkout' },
        { status: 400 }
      )
    }

    await connectDB()

    // Resolve products and build order items
    let subtotal = 0
    const orderItems: LeanOrderItem[] = []

    for (const item of data.items) {
      const product = await Product.findOne({
        _id:       item.productId,
        status:    'active',
        isDeleted: false,
      })
        .populate('vendorId', '_id')
        .lean<LeanProductWithVendorId | null>()

      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product ${item.productId} not found or unavailable` },
          { status: 400 }
        )
      }

      const variant = product.variants.find((v) => v.size === item.size)
      if (!variant) {
        return NextResponse.json(
          { success: false, error: `Size ${item.size} not available for ${product.name}` },
          { status: 400 }
        )
      }
      if (variant.quantity < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${product.name} (${item.size})` },
          { status: 400 }
        )
      }

      const unitPrice = product.discountPrice ?? product.basePrice
      const lineTotal = unitPrice * item.quantity
      const { platformFee, vendorAmount } = calculatePlatformFee(lineTotal)

      subtotal += lineTotal
      orderItems.push({
        productId:    product._id,
        vendorId:     product.vendorId._id,
        name:         product.name,
        imageUrl:     product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url ?? '',
        size:         item.size,
        quantity:     item.quantity,
        priceAtOrder: unitPrice,
        vendorAmount,
        platformFee,
      })
    }

    const totalPlatformFee = orderItems.reduce((a: number, i: LeanOrderItem) => a + i.platformFee, 0)
    const total            = subtotal + data.shippingFee

    const orderNumber = generateOrderNumber()
    const reference   = generateReference()

    const order = await Order.create({
      orderNumber,
      userId:          session?.user.id ?? undefined,
      guestInfo:       data.guestInfo,
      items:           orderItems,
      shippingAddress: data.shippingAddress,
      subtotal,
      platformFee:     totalPlatformFee,
      shippingFee:     data.shippingFee,
      total,
      paymentStatus:   'pending',
      orderStatus:     'pending',
      tracking: [{
        status:    'pending',
        note:      'Order placed',
        timestamp: new Date(),
      }],
    })

    const email = session?.user.email ?? data.guestInfo!.email

    const payment = await initializePayment({
      email,
      amountKobo: total,
      reference,
      metadata: {
        orderId:     String(order._id),
        orderNumber,
        customFields: [
          { display_name: 'Order Number', variable_name: 'order_number', value: orderNumber },
        ],
      },
      callbackUrl: `${appConfig.url}/checkout/verify?ref=${reference}`,
    })

    // Save reference on order
    await Order.findByIdAndUpdate(order._id, { paystackRef: reference })

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId:          String(order._id),
          orderNumber,
          paymentUrl:       payment.authorization_url,
          paystackRef:      reference,
        },
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[ORDERS_POST]', err)
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 })
  }
}
