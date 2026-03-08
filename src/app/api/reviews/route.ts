import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import { Review, Product, Vendor, Order } from '@/models'
import { requireAuth } from '@/lib/auth/helpers'
import { getPaginationMeta, parsePagination } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const sp        = req.nextUrl.searchParams
    const productId = sp.get('product')
    const vendorId  = sp.get('vendor')
    const { page, limit, skip } = parsePagination(sp)

    const filter: Record<string, unknown> = { isDeleted: false }
    if (productId) filter['productId'] = productId
    if (vendorId)  filter['vendorId']  = vendorId

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username profile.avatarUrl isUsernamePublic')
        .lean(),
      Review.countDocuments(filter),
    ])

    // Mask private usernames
    const masked = reviews.map(r => {
      const u = r.userId as any
      if (u && !u.isUsernamePublic) {
        u.username = u.username.slice(0, 2) + '***'
      }
      return r
    })

    return NextResponse.json({ success: true, data: masked, meta: getPaginationMeta(total, page, limit) })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

const CreateReviewSchema = z.object({
  productId: z.string(),
  orderId:   z.string(),
  rating:    z.number().int().min(1).max(5),
  title:     z.string().max(100).optional(),
  body:      z.string().min(10).max(1000),
  images:    z.array(z.string().url()).max(5).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth(['client'])
    if (error) return error

    const body  = await req.json()
    const parse = CreateReviewSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: parse.error.flatten() }, { status: 400 })
    }

    await connectDB()

    const order = await Order.findOne({
      _id:           parse.data.orderId,
      userId:        session!.user.id,
      orderStatus:   'delivered',
      paymentStatus: 'success',
    }).lean()

    if (!order) {
      return NextResponse.json({ success: false, error: 'You can only review products from delivered orders' }, { status: 403 })
    }

    const product = await Product.findById(parse.data.productId).lean()
    if (!product) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })

    const existing = await Review.findOne({ userId: session!.user.id, productId: parse.data.productId, orderId: parse.data.orderId })
    if (existing) return NextResponse.json({ success: false, error: 'You have already reviewed this product' }, { status: 409 })

    const review = await Review.create({
      ...parse.data,
      userId:   session!.user.id,
      vendorId: product.vendorId,
    })

    // Update product and vendor ratings
    const productReviews = await Review.find({ productId: parse.data.productId, isDeleted: false }).lean()
    const avg = productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length
    await Product.findByIdAndUpdate(parse.data.productId, {
      'ratings.average': Math.round(avg * 10) / 10,
      'ratings.count':   productReviews.length,
    })

    const vendorReviews = await Review.find({ vendorId: product.vendorId, isDeleted: false }).lean()
    const vAvg = vendorReviews.reduce((s, r) => s + r.rating, 0) / vendorReviews.length
    await Vendor.findByIdAndUpdate(product.vendorId, {
      'ratings.average': Math.round(vAvg * 10) / 10,
      'ratings.count':   vendorReviews.length,
    })

    return NextResponse.json({ success: true, data: review }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to create review' }, { status: 500 })
  }
}
