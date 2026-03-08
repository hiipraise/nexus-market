import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import { Product, Vendor } from '@/models'
import { requireAuth } from '@/lib/auth/helpers'
import { createUniqueSlug, parsePagination, getPaginationMeta, calculateDiscountedPrice } from '@/lib/utils'
import { stockConfig } from '@/config'

// ── GET /api/products ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const sp      = req.nextUrl.searchParams
    const { page, limit, skip } = parsePagination(sp)

    // Filters
    const filter: Record<string, unknown> = { status: 'active', isDeleted: false }
    if (sp.get('category'))  filter['categories'] = sp.get('category')
    if (sp.get('gender'))    filter['gender']      = sp.get('gender')
    if (sp.get('vendor'))    filter['vendorId']    = sp.get('vendor')
    if (sp.get('deals') === 'true') {
      filter['discountPrice'] = { $exists: true, $ne: null }
    }
    if (sp.get('blackFriday') === 'true') filter['isBlackFriday'] = true
    if (sp.get('minPrice') || sp.get('maxPrice')) {
      const priceFilter: Record<string, number> = {}
      if (sp.get('minPrice')) priceFilter['$gte'] = parseInt(sp.get('minPrice')!) * 100
      if (sp.get('maxPrice')) priceFilter['$lte'] = parseInt(sp.get('maxPrice')!) * 100
      filter['basePrice'] = priceFilter
    }
    if (sp.get('tags')) filter['tags'] = { $in: sp.get('tags')!.split(',') }

    // Sorting
    const sortMap: Record<string, Record<string, number>> = {
      newest:      { createdAt: -1 },
      oldest:      { createdAt:  1 },
      price_asc:   { basePrice:  1 },
      price_desc:  { basePrice: -1 },
      popular:     { views:     -1 },
      trending:    { purchases: -1 },
      rating:      { 'ratings.average': -1 },
    }
    const sortKey = sp.get('sort') ?? 'newest'
    const sort    = sortMap[sortKey] ?? sortMap.newest

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('vendorId', 'businessName badge profilePic')
        .populate('categories', 'name slug')
        .lean(),
      Product.countDocuments(filter),
    ])

    return NextResponse.json({
      success: true,
      data:    products,
      meta:    getPaginationMeta(total, page, limit),
    })
  } catch (err) {
    console.error('[PRODUCTS_GET]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 })
  }
}

// ── POST /api/products ────────────────────────────────────────────
const CreateProductSchema = z.object({
  name:           z.string().min(3).max(200),
  description:    z.string().min(20),
  shortDesc:      z.string().max(300).optional(),
  categories:     z.array(z.string()).min(1),
  gender:         z.enum(['male', 'female', 'kids', 'unisex']),
  basePrice:      z.number().positive(),   // in kobo
  discountType:   z.enum(['percentage', 'fixed']).optional(),
  discountValue:  z.number().positive().optional(),
  discountExpiry: z.string().optional(),
  isBlackFriday:  z.boolean().default(false),
  tags:           z.array(z.string()).default([]),
  variants:       z.array(z.object({
    size:     z.string(),
    quantity: z.number().int().min(0),
    sku:      z.string().optional(),
  })).min(1),
  images: z.array(z.object({
    url:       z.string().url(),
    publicId:  z.string(),
    isPrimary: z.boolean(),
    alt:       z.string().optional(),
  })).min(1),
  metaTitle:       z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth(['vendor'])
    if (error) return error

    await connectDB()

    const vendor = await Vendor.findOne({ userId: session!.user.id }).lean()
    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor profile not found' }, { status: 404 })
    }
    if (vendor.status !== 'verified') {
      return NextResponse.json({ success: false, error: 'Your account must be verified to upload products' }, { status: 403 })
    }

    const body  = await req.json()
    const parse = CreateProductSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parse.error.flatten() },
        { status: 400 }
      )
    }

    const data = parse.data
    const slug = createUniqueSlug(data.name)

    let discountPrice: number | undefined
    if (data.discountType && data.discountValue) {
      discountPrice = calculateDiscountedPrice(data.basePrice, data.discountType, data.discountValue)
    }

    const product = await Product.create({
      vendorId:       vendor._id,
      name:           data.name,
      slug,
      description:    data.description,
      shortDesc:      data.shortDesc,
      categories:     data.categories,
      gender:         data.gender,
      basePrice:      data.basePrice,
      discountPrice,
      discountType:   data.discountType,
      discountValue:  data.discountValue,
      discountExpiry: data.discountExpiry ? new Date(data.discountExpiry) : undefined,
      isBlackFriday:  data.isBlackFriday,
      tags:           data.tags,
      variants:       data.variants,
      images:         data.images,
      metaTitle:      data.metaTitle,
      metaDescription: data.metaDescription,
      status:         'active',
    })

    // Check low stock
    const lowStockVariants = data.variants.filter(v => v.quantity <= stockConfig.lowStockThreshold)
    // In a real implementation, send notifications for low stock here

    return NextResponse.json(
      { success: true, data: product, message: 'Product created successfully' },
      { status: 201 }
    )
  } catch (err) {
    console.error('[PRODUCTS_POST]', err)
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 })
  }
}
