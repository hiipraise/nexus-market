'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  RiFilterLine, RiCloseLine, RiGridLine, RiListCheck2,
  RiArrowUpDownLine,
} from 'react-icons/ri'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import ProductCard from './ProductCard'
import { buildQueryString } from '@/lib/utils'

const GENDERS  = ['male', 'female', 'kids', 'unisex']
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest'       },
  { value: 'price_asc',  label: 'Price: Low–High' },
  { value: 'price_desc', label: 'Price: High–Low' },
  { value: 'popular',    label: 'Most Viewed'  },
  { value: 'trending',   label: 'Trending'     },
  { value: 'rating',     label: 'Top Rated'    },
]

export default function ProductsClientPage() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const [filterOpen, setFilterOpen] = useState(false)
  const [gridCols,   setGridCols]   = useState<2 | 3 | 4>(3)
  const [page,       setPage]       = useState(1)

  const activeGender   = searchParams.get('gender')    ?? ''
  const activeCategory = searchParams.get('category')  ?? ''
  const activeSort     = searchParams.get('sort')      ?? 'newest'
  const minPrice       = searchParams.get('minPrice')  ?? ''
  const maxPrice       = searchParams.get('maxPrice')  ?? ''
  const deals          = searchParams.get('deals')     === 'true'
  const blackFriday    = searchParams.get('blackFriday') === 'true'

  const queryParams = buildQueryString({
    gender:      activeGender,
    category:    activeCategory,
    sort:        activeSort,
    minPrice,
    maxPrice,
    deals:       deals ? 'true' : '',
    blackFriday: blackFriday ? 'true' : '',
    page,
    limit: 24,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['products', queryParams],
    queryFn:  () => axios.get(`/api/products?${queryParams}`).then(r => r.data),
    keepPreviousData: true,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => axios.get('/api/categories').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
    setPage(1)
  }, [searchParams, pathname, router])

  const clearFilters = () => {
    router.push(pathname)
    setPage(1)
  }

  const hasFilters = activeGender || activeCategory || minPrice || maxPrice || deals || blackFriday

  const products = data?.data ?? []
  const meta     = data?.meta

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">All Products</h1>
            {meta && (
              <p className="section-subtitle">{meta.total.toLocaleString()} products found</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Grid toggle */}
            <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-xl p-1">
              {([2, 3, 4] as const).map(n => (
                <button
                  key={n}
                  onClick={() => setGridCols(n)}
                  className={`p-2 rounded-lg transition-all ${gridCols === n ? 'bg-gold-500/20 text-gold-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <RiGridLine className="w-4 h-4" />
                </button>
              ))}
            </div>
            {/* Sort */}
            <select
              value={activeSort}
              onChange={e => updateFilter('sort', e.target.value)}
              className="input text-sm py-2 pl-3 pr-8 w-auto"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {/* Filter toggle */}
            <button
              onClick={() => setFilterOpen(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${filterOpen ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40' : 'bg-white/5 text-gray-300 hover:text-gold-300'}`}
            >
              <RiFilterLine className="w-4 h-4" />
              Filters
              {hasFilters && <span className="w-2 h-2 rounded-full bg-gold-400" />}
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          {filterOpen && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-64 flex-shrink-0 hidden lg:block"
            >
              <div className="card p-6 space-y-6 sticky top-28">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-gray-200">Filters</h3>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-xs text-red-400 hover:underline flex items-center gap-1">
                      <RiCloseLine className="w-3 h-3" /> Clear all
                    </button>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Gender</h4>
                  <div className="space-y-2">
                    {GENDERS.map(g => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={activeGender === g}
                          onChange={() => updateFilter('gender', activeGender === g ? '' : g)}
                          className="accent-yellow-500"
                        />
                        <span className="text-gray-400 text-sm capitalize group-hover:text-gray-200 transition-colors">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                {categoriesData && categoriesData.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Category</h4>
                    <div className="space-y-2">
                      {categoriesData.map((cat: any) => (
                        <label key={cat._id} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="category"
                            value={cat._id}
                            checked={activeCategory === cat._id}
                            onChange={() => updateFilter('category', activeCategory === cat._id ? '' : cat._id)}
                            className="accent-yellow-500"
                          />
                          <span className="text-gray-400 text-sm group-hover:text-gray-200 transition-colors">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Price Range (₦)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={e => updateFilter('minPrice', e.target.value)}
                      className="input text-sm py-2"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={e => updateFilter('maxPrice', e.target.value)}
                      className="input text-sm py-2"
                    />
                  </div>
                </div>

                {/* Special */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Special</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={deals} onChange={e => updateFilter('deals', e.target.checked ? 'true' : '')} className="accent-yellow-500" />
                      <span className="text-gray-400 text-sm">On Sale</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={blackFriday} onChange={e => updateFilter('blackFriday', e.target.checked ? 'true' : '')} className="accent-yellow-500" />
                      <span className="text-gray-400 text-sm">Black Friday</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className={`grid gap-4 ${
                gridCols === 2 ? 'grid-cols-2' :
                gridCols === 3 ? 'grid-cols-2 sm:grid-cols-3' :
                'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              }`}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="skeleton aspect-[4/5] rounded-2xl" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <RiListCheck2 className="w-16 h-16 text-gray-700 mb-4" />
                <p className="text-gray-400 text-lg font-display font-semibold">No products found</p>
                <p className="text-gray-600 text-sm mt-1">Try adjusting your filters</p>
                {hasFilters && (
                  <button onClick={clearFilters} className="btn-secondary mt-4 text-sm">Clear Filters</button>
                )}
              </div>
            ) : (
              <>
                <div className={`grid gap-4 ${
                  gridCols === 2 ? 'grid-cols-2' :
                  gridCols === 3 ? 'grid-cols-2 sm:grid-cols-3' :
                  'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                }`}>
                  {products.map((product: any, i: number) => (
                    <ProductCard key={product._id} product={product} index={i} />
                  ))}
                </div>
                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="btn-secondary text-sm px-4 py-2 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-gray-400 text-sm px-4">
                      {page} / {meta.totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                      disabled={page >= meta.totalPages}
                      className="btn-secondary text-sm px-4 py-2 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
