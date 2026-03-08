'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  RiFireLine, RiEyeLine, RiShoppingBagLine, RiPriceTag3Line,
  RiSearchLine, RiStore2Line, RiArrowUpLine, RiShieldCheckLine,
  RiStarFill,
} from 'react-icons/ri'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { formatCurrency } from '@/lib/utils'

type TrendingCategory = {
  key:   string
  label: string
  icon:  React.ElementType
  color: string
}

const PRODUCT_CATEGORIES: TrendingCategory[] = [
  { key: 'trending',      label: 'Trending',        icon: RiFireLine,       color: 'text-orange-400' },
  { key: 'most_viewed',   label: 'Most Viewed',      icon: RiEyeLine,        color: 'text-blue-400'   },
  { key: 'most_bought',   label: 'Most Purchased',   icon: RiShoppingBagLine, color: 'text-green-400' },
  { key: 'cheapest',      label: 'Best Value',        icon: RiPriceTag3Line,  color: 'text-yellow-400' },
  { key: 'priciest',      label: 'Premium Picks',    icon: RiArrowUpLine,    color: 'text-gold-400'   },
  { key: 'most_searched', label: 'Most Searched',    icon: RiSearchLine,     color: 'text-purple-400' },
]

export default function TrendingPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'vendors'>('products')
  const [activeCategory, setActiveCategory] = useState('trending')

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['trending', 'products', activeCategory],
    queryFn:  () => axios.get(`/api/trending?type=products&category=${activeCategory}`).then(r => r.data.data),
    enabled:  activeTab === 'products',
  })

  const { data: vendorsData, isLoading: vendorsLoading } = useQuery({
    queryKey: ['trending', 'vendors'],
    queryFn:  () => axios.get('/api/trending?type=vendors').then(r => r.data.data),
    enabled:  activeTab === 'vendors',
  })

  const items     = activeTab === 'products' ? productsData : vendorsData
  const isLoading = activeTab === 'products' ? productsLoading : vendorsLoading

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="page-container">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
            <RiFireLine className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300 text-sm font-medium">Live Rankings</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-gradient-gold mb-3">
            Top {items?.length ?? 20} Charts
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto font-body">
            Real-time rankings based on actual platform activity — no paid placements.
          </p>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
              ${activeTab === 'products' ? 'bg-gold-500 text-gray-950' : 'bg-white/5 text-gray-400 hover:text-gray-200'}`}
          >
            <RiShoppingBagLine className="w-4 h-4" />
            Products
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
              ${activeTab === 'vendors' ? 'bg-gold-500 text-gray-950' : 'bg-white/5 text-gray-400 hover:text-gray-200'}`}
          >
            <RiStore2Line className="w-4 h-4" />
            Vendors
          </button>
        </div>

        {/* Product category pills */}
        {activeTab === 'products' && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {PRODUCT_CATEGORIES.map(cat => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all
                    ${activeCategory === cat.key
                      ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                      : 'bg-white/5 text-gray-400 hover:text-gray-200 border border-transparent'}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${activeCategory === cat.key ? 'text-purple-400' : cat.color}`} />
                  {cat.label}
                </button>
              )
            })}
          </div>
        )}

        {/* Rankings list */}
        {isLoading ? (
          <div className="space-y-3 max-w-2xl mx-auto">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-3">
            {items?.map((item: any, index: number) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                {activeTab === 'products' ? (
                  <Link href={`/products/${item.slug}`} className="flex items-center gap-4 p-4 card rounded-2xl hover:border-gold-500/30 transition-all group">
                    {/* Rank */}
                    <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center font-display font-black text-lg
                      ${index === 0 ? 'bg-gold-500 text-gray-950' :
                        index === 1 ? 'bg-gray-400 text-gray-900' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'bg-white/10 text-gray-400'}`}>
                      {index + 1}
                    </div>
                    {/* Image */}
                    <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-white/5">
                      {item.images?.[0] && (
                        <Image src={item.images[0].url} alt={item.name} width={56} height={56} className="w-full h-full object-cover" />
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-medium text-gray-200 truncate group-hover:text-gold-300 transition-colors">{item.name}</p>
                      <p className="text-gray-500 text-sm">{item.vendorId?.businessName}</p>
                    </div>
                    {/* Price + stat */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-display font-bold text-gold-400">{formatCurrency(item.discountPrice ?? item.basePrice)}</p>
                      <p className="text-gray-600 text-xs mt-0.5">
                        {activeCategory === 'most_viewed' && `${item.views?.toLocaleString()} views`}
                        {activeCategory === 'most_bought' && `${item.purchases?.toLocaleString()} sold`}
                        {activeCategory === 'most_searched' && `${item.searches?.toLocaleString()} searches`}
                        {['trending','cheapest','priciest'].includes(activeCategory) && item.ratings?.count > 0 && (
                          <span className="flex items-center gap-0.5 justify-end">
                            <RiStarFill className="w-3 h-3 text-gold-400" />
                            {item.ratings.average.toFixed(1)}
                          </span>
                        )}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <Link href={`/vendors/${item.userId?.username}`} className="flex items-center gap-4 p-4 card rounded-2xl hover:border-gold-500/30 transition-all group">
                    <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center font-display font-black text-lg
                      ${index === 0 ? 'bg-gold-500 text-gray-950' : index === 1 ? 'bg-gray-400 text-gray-900' : index === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-gray-400'}`}>
                      {index + 1}
                    </div>
                    <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-white/5">
                      {item.profilePic ? (
                        <Image src={item.profilePic} alt={item.businessName} width={56} height={56} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-purple flex items-center justify-center">
                          <RiStore2Line className="w-6 h-6 text-white/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-body font-medium text-gray-200 truncate group-hover:text-gold-300 transition-colors">{item.businessName}</p>
                        {item.badge && <RiShieldCheckLine className="w-4 h-4 text-gold-400 flex-shrink-0" />}
                      </div>
                      <p className="text-gray-500 text-sm">{item.totalSales?.toLocaleString()} sales</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-0.5 justify-end">
                        <RiStarFill className="w-3.5 h-3.5 text-gold-400" />
                        <span className="font-display font-bold text-gold-400">{item.ratings?.average?.toFixed(1) ?? '—'}</span>
                      </div>
                      <p className="text-gray-600 text-xs">{item.ratings?.count} reviews</p>
                    </div>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
