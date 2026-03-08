'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { RiSearchLine, RiCloseLine, RiArrowRightLine, RiFireLine } from 'react-icons/ri'
import { useUIStore, useSearchStore } from '@/store'
import { formatCurrency } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export default function LiveSearchOverlay() {
  const { searchOpen, toggleSearch } = useUIStore()
  const { query, setQuery, clearSearch } = useSearchStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const router   = useRouter()

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [searchOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { clearSearch(); toggleSearch() }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); toggleSearch() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [clearSearch, toggleSearch])

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn:  () => axios.get(`/api/search?q=${encodeURIComponent(query)}&limit=8`).then(r => r.data.data),
    enabled:  query.length >= 2,
    staleTime: 10_000,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`)
      clearSearch()
      toggleSearch()
    }
  }

  const handleClose = () => { clearSearch(); toggleSearch() }

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <form onSubmit={handleSubmit} className="glass rounded-2xl border border-[rgba(200,139,0,0.2)] shadow-gold overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4">
                <RiSearchLine className="w-5 h-5 text-gold-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search products, vendors, categories…"
                  className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 font-body text-base outline-none"
                />
                <div className="flex items-center gap-2">
                  {query && (
                    <button type="button" onClick={() => setQuery('')} className="text-gray-500 hover:text-gray-300">
                      <RiCloseLine className="w-4 h-4" />
                    </button>
                  )}
                  <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-500 text-xs font-mono">
                    ESC
                  </kbd>
                </div>
              </div>

              {/* Results */}
              {query.length >= 2 && (
                <div className="border-t border-white/10 max-h-[60vh] overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 space-y-2">
                      {[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
                    </div>
                  ) : results && results.length > 0 ? (
                    <>
                      <div className="p-2">
                        {results.map((product: any) => {
                          const img = product.images?.find((i: any) => i.isPrimary) ?? product.images?.[0]
                          return (
                            <Link
                              key={product._id}
                              href={`/products/${product.slug}`}
                              onClick={handleClose}
                              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all group"
                            >
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                                {img && <Image src={img.url} alt={product.name} width={48} height={48} className="w-full h-full object-cover" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-200 text-sm font-medium truncate group-hover:text-gold-300 transition-colors">{product.name}</p>
                                <p className="text-gray-500 text-xs">{product.vendorId?.businessName}</p>
                              </div>
                              <span className="font-display font-bold text-gold-400 text-sm flex-shrink-0">
                                {formatCurrency(product.discountPrice ?? product.basePrice)}
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                      <div className="border-t border-white/10 p-3">
                        <button
                          type="submit"
                          className="w-full flex items-center justify-center gap-2 text-gold-400 text-sm py-2 hover:text-gold-300 transition-colors"
                        >
                          See all results for "{query}"
                          <RiArrowRightLine className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center">
                      <RiSearchLine className="w-10 h-10 text-gray-700 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No results for "{query}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Quick links when empty */}
              {!query && (
                <div className="border-t border-white/10 p-4">
                  <p className="text-gray-600 text-xs uppercase tracking-wider mb-3">Popular</p>
                  <div className="flex flex-wrap gap-2">
                    {['Fashion', 'Shoes', 'Bags', 'Accessories', 'Kids', 'Sale'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-gold-400 hover:bg-gold-500/10 text-sm transition-all"
                      >
                        <RiFireLine className="w-3.5 h-3.5 text-orange-400" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
