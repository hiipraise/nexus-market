'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { RiArrowRightLine, RiShieldCheckLine, RiFireLine, RiStarFill } from 'react-icons/ri'
import ProductCard from '../products/ProductCard'
import { formatCurrency } from '@/lib/utils'

// ── Category Grid ─────────────────────────────────────────────────
export function CategoryGrid() {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => axios.get('/api/categories').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const defaultCategories = [
    { name: 'Men',        slug: 'male',   emoji: null, gradient: 'from-blue-900/50 to-purple-900/50'   },
    { name: 'Women',      slug: 'female', emoji: null, gradient: 'from-pink-900/40 to-gold-900/30'     },
    { name: 'Kids',       slug: 'kids',   emoji: null, gradient: 'from-green-900/40 to-teal-900/30'    },
    { name: 'Unisex',     slug: 'unisex', emoji: null, gradient: 'from-purple-900/40 to-gold-800/30'   },
  ]

  return (
    <section className="py-16">
      <div className="page-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Find exactly what you're looking for</p>
          </div>
          <Link href="/products" className="btn-ghost text-sm flex items-center gap-1">
            All products <RiArrowRightLine className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {defaultCategories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/products?gender=${cat.slug}`}
                className="relative h-40 rounded-2xl overflow-hidden block group cursor-pointer border border-white/5 hover:border-gold-500/30 transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient}`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <h3 className="font-display font-bold text-white text-xl group-hover:text-gold-300 transition-colors">{cat.name}</h3>
                  <span className="text-gray-400 text-xs mt-1 group-hover:text-gold-400 transition-colors flex items-center gap-1">
                    Shop now <RiArrowRightLine className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Trending Products ─────────────────────────────────────────────
export function TrendingProducts() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['trending-home'],
    queryFn:  () => axios.get('/api/trending?type=products&category=trending').then(r => r.data.data),
  })

  return (
    <section className="py-16 bg-[#0d0520]">
      <div className="page-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <RiFireLine className="w-5 h-5 text-orange-400" />
              <h2 className="section-title">Trending Now</h2>
            </div>
            <p className="section-subtitle">Products everyone's talking about</p>
          </div>
          <Link href="/trending" className="btn-ghost text-sm flex items-center gap-1">
            Full charts <RiArrowRightLine className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className="skeleton aspect-[4/5] rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {products?.slice(0, 10).map((product: any, i: number) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ── Featured Vendors ──────────────────────────────────────────────
export function FeaturedVendors() {
  const { data: vendors, isLoading } = useQuery({
    queryKey: ['trending-vendors'],
    queryFn:  () => axios.get('/api/trending?type=vendors').then(r => r.data.data),
  })

  if (isLoading || !vendors?.length) return null

  return (
    <section className="py-16">
      <div className="page-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Top Vendors</h2>
            <p className="section-subtitle">Trusted sellers with verified products</p>
          </div>
          <Link href="/vendors" className="btn-ghost text-sm flex items-center gap-1">
            All vendors <RiArrowRightLine className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {vendors.slice(0, 10).map((vendor: any, i: number) => (
            <motion.div
              key={vendor._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link href={`/vendors/${vendor.userId?.username ?? vendor._id}`} className="card p-5 text-center block hover:border-gold-500/30 transition-all group">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-purple mx-auto mb-3 flex items-center justify-center">
                  {vendor.profilePic ? (
                    <Image src={vendor.profilePic} alt={vendor.businessName} width={64} height={64} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display font-black text-2xl text-white/60">
                      {vendor.businessName?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <p className="font-body font-medium text-gray-200 text-sm truncate group-hover:text-gold-300 transition-colors">
                    {vendor.businessName}
                  </p>
                  {vendor.badge && <RiShieldCheckLine className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />}
                </div>
                {vendor.ratings?.count > 0 && (
                  <div className="flex items-center justify-center gap-1">
                    <RiStarFill className="w-3 h-3 text-gold-400" />
                    <span className="text-gray-400 text-xs">{vendor.ratings.average.toFixed(1)}</span>
                  </div>
                )}
                <p className="text-gray-600 text-xs mt-1">{vendor.totalSales?.toLocaleString()} sales</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Black Friday Banner ────────────────────────────────────────────
export function BlackFridayBanner() {
  return (
    <section className="py-4">
      <div className="page-container">
        <Link href="/products?blackFriday=true" className="block">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative rounded-3xl overflow-hidden bg-black border border-yellow-400/30 p-8 sm:p-12"
          >
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-400/5 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-yellow-600/5 rounded-full blur-[60px]" />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="text-yellow-400 text-sm font-bold uppercase tracking-[0.2em] mb-2">Limited Time</p>
                <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-2">
                  BLACK FRIDAY
                </h2>
                <p className="text-gray-400 text-lg">Up to 70% off on selected products</p>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 text-black font-display font-black text-lg rounded-2xl hover:bg-yellow-300 transition-colors shadow-[0_0_40px_rgba(250,204,21,0.3)]">
                  Shop Now <RiArrowRightLine className="w-5 h-5" />
                </span>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
    </section>
  )
}

export default CategoryGrid
