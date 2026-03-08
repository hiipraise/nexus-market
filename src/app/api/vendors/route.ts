import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Vendor } from '@/models'
import { getPaginationMeta, parsePagination } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const sp = req.nextUrl.searchParams
    const { page, limit, skip } = parsePagination(sp)
    const filter: Record<string, unknown> = { status: 'verified', isDeleted: false }
    if (sp.get('q')) filter['businessName'] = { $regex: sp.get('q'), $options: 'i' }
    const [vendors, total] = await Promise.all([
      Vendor.find(filter).sort({ 'ratings.average': -1 }).skip(skip).limit(limit)
        .populate('userId', 'username isUsernamePublic').lean(),
      Vendor.countDocuments(filter),
    ])
    return NextResponse.json({ success: true, data: vendors, meta: getPaginationMeta(total, page, limit) })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch vendors' }, { status: 500 })
  }
}
