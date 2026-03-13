// src/app/api/analytics/vendor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order, Product, Vendor, Review } from "@/models";
import { requireAuth } from "@/lib/auth/helpers";

type OrderItemLean = {
  productId: string;
  vendorId: string;
  name: string;
  quantity: number;
  vendorAmount: number;
};

type OrderLean = {
  createdAt: Date;
  items: OrderItemLean[];
};

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth(["vendor"]);
    if (error) return error;

    await connectDB();

    const vendor = await Vendor.findOne({ userId: session!.user.id })
      .select("_id totalRevenue balance totalSales ratings")
      .lean<{
        _id: string;
        totalRevenue: number;
        balance: number;
        totalSales: number;
        ratings: { average: number; count: number };
      }>();

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: "Vendor not found" },
        { status: 404 },
      );
    }

    const sp = req.nextUrl.searchParams;
    const range = sp.get("range") ?? "30d";

    const daysMap: Record<string, number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "1y": 365,
    };
    const days = daysMap[range] ?? 30;
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [products, recentOrders, totalOrders, reviews] = await Promise.all([
      Product.find({ vendorId: vendor._id, isDeleted: false })
        .sort({ purchases: -1 })
        .limit(10)
        .lean(),

      Order.find({
        "items.vendorId": vendor._id,
        paymentStatus: "success",
        createdAt: { $gte: fromDate },
      })
        .sort({ createdAt: -1 })
        .lean<OrderLean[]>(),

      Order.countDocuments({
        "items.vendorId": vendor._id,
        paymentStatus: "success",
      }),

      Review.find({ vendorId: vendor._id, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Revenue by day
    const revenueByDay = recentOrders.reduce(
      (acc: Record<string, number>, order: OrderLean) => {
        const day = new Date(order.createdAt).toISOString().split("T")[0];

        const revenue = order.items
          .filter(
            (i: OrderItemLean) => String(i.vendorId) === String(vendor._id),
          )
          .reduce((s: number, i: OrderItemLean) => s + i.vendorAmount, 0);

        acc[day] = (acc[day] ?? 0) + revenue;
        return acc;
      },
      {},
    );

    // Top products by revenue
    const productRevenue = recentOrders.reduce(
      (
        acc: Record<string, { name: string; revenue: number; units: number }>,
        order,
      ) => {
        for (const item of order.items) {
          if (String(item.vendorId) !== String(vendor._id)) continue;
          const key = String(item.productId);
          if (!acc[key]) acc[key] = { name: item.name, revenue: 0, units: 0 };
          acc[key].revenue += item.vendorAmount;
          acc[key].units += item.quantity;
        }
        return acc;
      },
      {},
    );

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue: vendor.totalRevenue,
          balance: vendor.balance,
          totalSales: vendor.totalSales,
          totalOrders,
          averageRating: vendor.ratings.average,
          reviewCount: vendor.ratings.count,
        },
        period: {
          range,
          revenue: recentOrders.reduce(
            (s: number, o: OrderLean) =>
              s +
              o.items
                .filter(
                  (i: OrderItemLean) =>
                    String(i.vendorId) === String(vendor._id),
                )
                .reduce((a: number, i: OrderItemLean) => a + i.vendorAmount, 0),
            0,
          ),
          orders: recentOrders.length,
          revenueByDay: Object.entries(revenueByDay).map(([date, revenue]) => ({
            date,
            revenue,
          })),
        },
        topProducts: products,
        productRevenue: Object.entries(productRevenue)
          .map(([id, data]) => ({ productId: id, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10),
        recentReviews: reviews,
      },
    });
  } catch (err) {
    console.error("[ANALYTICS_VENDOR]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
