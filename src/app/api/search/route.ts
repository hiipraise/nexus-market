import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Product } from '@/models'
import { parsePagination, getPaginationMeta } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const sp    = req.nextUrl.searchParams
    const query = sp.get('q')?.trim()

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: [], meta: { total: 0 } })
    }

    await connectDB()

    const { page, limit, skip } = parsePagination(sp, 20)

    const filter: Record<string, unknown> = {
      status:    'active',
      isDeleted: false,
      $or: [
        { $text: { $search: query } },
        { name:  { $regex: query, $options: 'i' } },
        { tags:  { $regex: query, $options: 'i' } },
      ],
    }

    if (sp.get('category')) filter['categories'] = sp.get('category')
    if (sp.get('gender'))   filter['gender']     = sp.get('gender')
    if (sp.get('minPrice') || sp.get('maxPrice')) {
      const priceFilter: Record<string, number> = {}
      if (sp.get('minPrice')) priceFilter['$gte'] = parseInt(sp.get('minPrice')!) * 100
      if (sp.get('maxPrice')) priceFilter['$lte'] = parseInt(sp.get('maxPrice')!) * 100
      filter['basePrice'] = priceFilter
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .skip(skip)
        .limit(limit)
        .populate('vendorId',   'businessName badge profilePic')
        .populate('categories', 'name slug')
        .lean(),
      Product.countDocuments(filter),
    ])

    // Increment search counter (fire and forget)
    if (products.length > 0) {
      Product.updateMany(
        { _id: { $in: products.map(p => p._id) } },
        { $inc: { searches: 1 } }
      ).exec()
    }

    return NextResponse.json({
      success: true,
      data:    products,
      meta:    getPaginationMeta(total, page, limit),
      query,
    })
  } catch (err) {
    console.error('[SEARCH]', err)
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 })
  }
}
