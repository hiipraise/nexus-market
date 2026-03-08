import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Product } from '@/models'
import { requireAuth } from '@/lib/auth/helpers'
import { z } from 'zod'
import { calculateDiscountedPrice, createUniqueSlug } from '@/lib/utils'

type Params = { params: { id: string } }

// ── GET /api/products/[id] ────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB()

    const product = await Product.findOne({
      $or: [{ _id: params.id }, { slug: params.id }],
      status:    'active',
      isDeleted: false,
    })
      .populate('vendorId',   'businessName badge profilePic phone whatsapp ratings')
      .populate('categories', 'name slug')
      .lean()

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    // Increment views (fire and forget)
    Product.updateOne({ _id: product._id }, { $inc: { views: 1 } }).exec()

    return NextResponse.json({ success: true, data: product })
  } catch (err) {
    console.error('[PRODUCT_GET]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch product' }, { status: 500 })
  }
}

// ── PATCH /api/products/[id] ──────────────────────────────────────
const UpdateSchema = z.object({
  name:           z.string().min(3).max(200).optional(),
  description:    z.string().min(20).optional(),
  shortDesc:      z.string().max(300).optional(),
  categories:     z.array(z.string()).min(1).optional(),
  gender:         z.enum(['male','female','kids','unisex']).optional(),
  basePrice:      z.number().positive().optional(),
  discountType:   z.enum(['percentage','fixed']).optional(),
  discountValue:  z.number().positive().optional(),
  discountExpiry: z.string().optional(),
  isBlackFriday:  z.boolean().optional(),
  tags:           z.array(z.string()).optional(),
  variants:       z.array(z.object({
    size:     z.string(),
    quantity: z.number().int().min(0),
    sku:      z.string().optional(),
  })).optional(),
  images: z.array(z.object({
    url:       z.string().url(),
    publicId:  z.string(),
    isPrimary: z.boolean(),
    alt:       z.string().optional(),
  })).optional(),
  status:          z.enum(['active','inactive']).optional(),
  metaTitle:       z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
})

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { session, error } = await requireAuth(['vendor','admin','superadmin'])
    if (error) return error

    await connectDB()

    const product = await Product.findById(params.id)
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    // Vendors can only edit their own products
    if (session!.user.role === 'vendor') {
      const { Vendor } = await import('@/models')
      const vendor = await Vendor.findOne({ userId: session!.user.id }).lean()
      if (!vendor || String(vendor._id) !== String(product.vendorId)) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
      }
    }

    const body  = await req.json()
    const parse = UpdateSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parse.error.flatten() },
        { status: 400 }
      )
    }

    const data    = parse.data
    const updates = { ...data } as Record<string, unknown>

    if (data.name) updates.slug = createUniqueSlug(data.name)
    if (data.discountType && data.discountValue && data.basePrice) {
      updates.discountPrice = calculateDiscountedPrice(data.basePrice, data.discountType, data.discountValue)
    }
    if (data.discountExpiry) updates.discountExpiry = new Date(data.discountExpiry)

    const updated = await Product.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true }
    )

    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    console.error('[PRODUCT_PATCH]', err)
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 })
  }
}

// ── DELETE /api/products/[id] — soft delete ────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { session, error } = await requireAuth(['vendor','admin','superadmin'])
    if (error) return error

    await connectDB()

    const product = await Product.findById(params.id)
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    if (session!.user.role === 'vendor') {
      const { Vendor } = await import('@/models')
      const vendor = await Vendor.findOne({ userId: session!.user.id }).lean()
      if (!vendor || String(vendor._id) !== String(product.vendorId)) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
      }
    }

    await Product.findByIdAndUpdate(params.id, {
      isDeleted: true,
      deletedAt: new Date(),
      status:    'deleted',
    })

    return NextResponse.json({ success: true, message: 'Product deleted' })
  } catch (err) {
    console.error('[PRODUCT_DELETE]', err)
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 })
  }
}
