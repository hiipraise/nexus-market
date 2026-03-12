import type { MetadataRoute } from 'next'
import { connectDB } from '@/lib/db/connect'
import { Product } from '@/models'
import User from '@/models/User'
import { Vendor } from '@/models'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL ?? 'https://nexus-market.com'

  const static_routes = [
    '', '/products', '/vendors', '/trending', '/login', '/register',
    '/vendor/register', '/forgot-username',
  ].map(path => ({
    url:              `${base}${path}`,
    lastModified:     new Date(),
    changeFrequency:  'weekly' as const,
    priority:         path === '' ? 1 : 0.8,
  }))

  try {
    await connectDB()
    const [products, vendors] = await Promise.all([
      Product.find({ status: 'active', isDeleted: false }).select('slug updatedAt').limit(500).lean(),
      Vendor.find({ status: 'verified', isDeleted: false }).populate('userId', 'username').select('userId updatedAt').limit(200).lean(),
    ])

    const productRoutes = products.map((p: any) => ({
      url:             `${base}/products/${p.slug}`,
      lastModified:    p.updatedAt,
      changeFrequency: 'daily' as const,
      priority:        0.7,
    }))

    const vendorRoutes = vendors.map((v: any) => ({
      url:             `${base}/vendors/${v.userId?.username}`,
      lastModified:    v.updatedAt,
      changeFrequency: 'weekly' as const,
      priority:        0.6,
    }))

    return [...static_routes, ...productRoutes, ...vendorRoutes]
  } catch {
    return static_routes
  }
}
