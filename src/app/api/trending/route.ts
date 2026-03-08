import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Product, Vendor } from '@/models'
import { paginationConfig } from '@/config'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const type  = req.nextUrl.searchParams.get('type') ?? 'products'
    const limit = paginationConfig.trendingLimit

    if (type === 'vendors') {
      const vendors = await Vendor.find({ status: 'verified', isDeleted: false })
        .sort({ totalSales: -1, 'ratings.average': -1 })
        .limit(limit)
        .populate('userId', 'username isUsernamePublic')
        .lean()

      return NextResponse.json({ success: true, data: vendors, type: 'vendors' })
    }

    const category = req.nextUrl.searchParams.get('category') ?? 'trending'

    const categoryMap: Record<string, Record<string, unknown>> = {
      trending:    { status: 'active', isDeleted: false },
      most_viewed: { status: 'active', isDeleted: false },
      most_bought: { status: 'active', isDeleted: false },
      cheapest:    { status: 'active', isDeleted: false },
      priciest:    { status: 'active', isDeleted: false },
      most_searched: { status: 'active', isDeleted: false },
    }

    const sortMap: Record<string, Record<string, number>> = {
      trending:      { purchases: -1, views: -1 },
      most_viewed:   { views: -1 },
      most_bought:   { purchases: -1 },
      cheapest:      { basePrice:  1 },
      priciest:      { basePrice: -1 },
      most_searched: { searches:  -1 },
    }

    const filter = categoryMap[category] ?? categoryMap.trending
    const sort   = sortMap[category]     ?? sortMap.trending

    const products = await Product.find(filter)
      .sort(sort)
      .limit(limit)
      .populate('vendorId',   'businessName badge profilePic')
      .populate('categories', 'name slug')
      .lean()

    return NextResponse.json({ success: true, data: products, type: 'products', category })
  } catch (err) {
    console.error('[TRENDING]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch trending data' }, { status: 500 })
  }
}
