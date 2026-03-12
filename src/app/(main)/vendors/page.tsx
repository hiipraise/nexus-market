'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useDebounce } from '@/hooks'
import { LoadingSpinner, Pagination } from '@/components/shared'
import VendorCard from '@/components/vendors/VendorCard'
import { RiSearchLine, RiStore2Line } from 'react-icons/ri'

export default function VendorsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)
  const debouncedSearch     = useDebounce(search, 400)

  const { data, isLoading } = useQuery({
    queryKey: ['vendors', debouncedSearch, page],
    queryFn:  () =>
      axios.get(`/api/vendors?q=${debouncedSearch}&page=${page}&limit=24`).then(r => r.data),
  })

  const vendors = data?.data ?? []
  const meta    = data?.meta

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="page-container">
        <div className="text-center mb-10">
          <h1 className="section-title text-4xl mb-2">Our Vendors</h1>
          <p className="section-subtitle">Browse verified sellers on Nexus Market</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-10">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search vendors…"
            className="input pl-11"
          />
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : vendors.length === 0 ? (
          <div className="text-center py-20">
            <RiStore2Line className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 font-display font-semibold text-xl">No vendors found</p>
            {search && <p className="text-gray-600 text-sm mt-1">Try a different search</p>}
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-6">
              {meta?.total?.toLocaleString()} verified vendors
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {vendors.map((vendor: any, i: number) => (
                <VendorCard key={vendor._id} vendor={vendor} index={i} />
              ))}
            </div>
            {meta && meta.totalPages > 1 && (
              <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
