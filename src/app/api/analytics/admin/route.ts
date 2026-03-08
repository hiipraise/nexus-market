import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { requireAuth } from '@/lib/auth/helpers'
import User from '@/models/User'
import { Vendor, Product, Order, Report } from '@/models'

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth(['admin', 'superadmin', 'support'])
    if (error) return error

    await connectDB()

    const [
      totalUsers, activeVendors, pendingVendors,
      totalOrders, totalProducts, openReports, recentReports,
    ] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      Vendor.countDocuments({ status: 'verified', isDeleted: false }),
      Vendor.countDocuments({ status: 'pending',  isDeleted: false }),
      Order.countDocuments({ isDeleted: false }),
      Product.countDocuments({ status: 'active', isDeleted: false }),
      Report.countDocuments({ status: 'open', isDeleted: false }),
      Report.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(5)
        .populate('reportedBy', 'username').lean(),
    ])

    const platformRevenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'success' } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } },
    ])
    const platformRevenue = platformRevenueAgg[0]?.total ?? 0

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeVendors,
        pendingVendors,
        totalOrders,
        totalProducts,
        openReports,
        platformRevenue,
        recentReports,
      },
    })
  } catch (err) {
    console.error('[ADMIN_ANALYTICS]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
