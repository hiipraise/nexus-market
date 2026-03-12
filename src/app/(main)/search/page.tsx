'use client'

import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { RiSearchLine } from 'react-icons/ri'
import ProductCard from '@/components/products/ProductCard'
import { LoadingSpinner } from '@/components/shared'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''

  const { data, isLoading } = useQuery({
    queryKey: ['search', q],
    queryFn:  () => axios.get(`/api/search?q=${encodeURIComponent(q)}&limit=48`).then(r => r.data),
    enabled:  q.length >= 2,
  })

  const results = data?.data ?? []

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="page-container">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <RiSearchLine className="w-5 h-5 text-gold-400" />
            <h1 className="section-title">
              {q ? `Results for "${q}"` : 'Search Products'}
            </h1>
          </div>
          {results.length > 0 && (
            <p className="section-subtitle">{results.length} products found</p>
          )}
        </div>

        {!q ? (
          <p className="text-gray-500 text-center py-20">Enter a search term to find products.</p>
        ) : isLoading ? (
          <LoadingSpinner />
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <RiSearchLine className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="font-display font-semibold text-xl text-gray-400">No results for "{q}"</p>
            <p className="text-gray-600 text-sm mt-1">Try different keywords or browse all products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {results.map((product: any, i: number) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
