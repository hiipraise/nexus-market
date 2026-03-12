'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  RiShieldCheckLine, RiStarFill, RiPhoneLine, RiWhatsappLine,
  RiAlertLine, RiStore2Line,
} from 'react-icons/ri'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import ProductCard from '@/components/products/ProductCard'
import ReportModal from '@/components/products/ReportModal'
import { LoadingSpinner, Pagination, StarRating } from '@/components/shared'
import { normalizePhone } from '@/lib/utils'

interface Props { vendor: any }

export default function VendorProfileClient({ vendor }: Props) {
  const { data: session }  = useSession()
  const [page, setPage]    = useState(1)
  const [reportOpen, setReportOpen] = useState(false)

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['vendor-products', vendor._id, page],
    queryFn:  () =>
      axios.get(`/api/products?vendor=${vendor._id}&page=${page}&limit=20&sort=newest`)
        .then(r => r.data),
  })

  const products = productsData?.data ?? []
  const meta     = productsData?.meta

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        {/* Hero banner */}
        <div className="relative rounded-3xl overflow-hidden mb-8 h-40 sm:h-56 bg-gradient-to-br from-purple-900/40 to-gold-800/20 border border-white/5">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #7a5498 0%, transparent 60%), radial-gradient(circle at 80% 20%, #c88b00 0%, transparent 50%)' }} />
        </div>

        {/* Profile card */}
        <div className="relative -mt-20 mb-10 px-4 sm:px-8 flex flex-col sm:flex-row items-start sm:items-end gap-5">
          <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-[#070212] bg-gradient-purple flex items-center justify-center flex-shrink-0 shadow-purple-lg">
            {vendor.profilePic ? (
              <Image src={vendor.profilePic} alt={vendor.businessName} width={112} height={112} className="w-full h-full object-cover" />
            ) : (
              <RiStore2Line className="w-12 h-12 text-white/40" />
            )}
          </div>

          <div className="flex-1 min-w-0 pt-4 sm:pt-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-display font-black text-2xl text-gray-100">{vendor.businessName}</h1>
              {vendor.badge && (
                <span className="badge-verified text-sm px-3 py-1">
                  <RiShieldCheckLine className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm">@{vendor.userId?.username}</p>
            {vendor.ratings?.count > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating value={vendor.ratings.average} readOnly size="sm" />
                <span className="text-gray-400 text-sm">{vendor.ratings.average.toFixed(1)} ({vendor.ratings.count} reviews)</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            {vendor.phone && (
              <a href={`tel:${vendor.phone}`} className="btn-secondary text-sm flex items-center gap-1.5">
                <RiPhoneLine className="w-4 h-4 text-green-400" /> Call
              </a>
            )}
            {vendor.whatsapp && (
              <a
                href={`https://wa.me/${normalizePhone(vendor.whatsapp).replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm flex items-center gap-1.5"
              >
                <RiWhatsappLine className="w-4 h-4 text-green-400" /> WhatsApp
              </a>
            )}
            {session && (
              <button onClick={() => setReportOpen(true)} className="btn-ghost text-sm p-2.5" title="Report vendor">
                <RiAlertLine className="w-4 h-4 text-gray-500 hover:text-red-400" />
              </button>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Sales', value: vendor.totalSales?.toLocaleString() ?? '0' },
            { label: 'Products',    value: meta?.total?.toLocaleString()       ?? '—'  },
            { label: 'Rating',      value: vendor.ratings?.count > 0 ? `${vendor.ratings.average.toFixed(1)} ★` : 'N/A' },
          ].map(stat => (
            <div key={stat.label} className="card p-4 text-center">
              <p className="font-display font-black text-2xl text-gold-400">{stat.value}</p>
              <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        {vendor.description && (
          <div className="card p-6 mb-10">
            <h2 className="font-display font-semibold text-gray-200 mb-3">About</h2>
            <p className="text-gray-400 font-body leading-relaxed">{vendor.description}</p>
          </div>
        )}

        {/* Products */}
        <h2 className="section-title mb-6">Products by {vendor.businessName}</h2>

        {isLoading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <p className="text-gray-600 text-center py-16">No products listed yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((p: any, i: number) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
            {meta && meta.totalPages > 1 && (
              <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
            )}
          </>
        )}

        <ReportModal
          isOpen={reportOpen}
          onClose={() => setReportOpen(false)}
          entityType="vendor"
          entityId={String(vendor._id)}
        />
      </div>
    </div>
  )
}
