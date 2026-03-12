'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { RiAddLine, RiEditLine, RiDeleteBin2Line, RiEyeLine } from 'react-icons/ri'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { StatusBadge, LoadingSpinner, Pagination, ConfirmDialog } from '@/components/shared'
import { useVendorProfile } from '@/hooks'

export default function VendorProductsPage() {
  const qc          = useQueryClient()
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: vendorData } = useVendorProfile()

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-products-dash', page],
    queryFn:  () => axios.get(`/api/products?vendor=${vendorData?.data?._id ?? ''}&page=${page}&limit=20&sort=newest`).then(r => r.data),
    enabled:  !!vendorData,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/products/${id}`),
    onSuccess:  () => {
      toast.success('Product deleted')
      qc.invalidateQueries({ queryKey: ['vendor-products-dash'] })
      setDeleteId(null)
    },
    onError: () => toast.error('Failed to delete'),
  })

  const products = data?.data ?? []
  const meta     = data?.meta

  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-100">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{meta?.total ?? 0} products</p>
        </div>
        <Link href="/dashboard/vendor/products/new" className="btn-primary text-sm">
          <RiAddLine className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-gray-500 mb-4">No products yet.</p>
          <Link href="/dashboard/vendor/products/new" className="btn-primary text-sm">Add your first product</Link>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500">
                  <th className="text-left p-4 font-medium">Product</th>
                  <th className="text-right p-4 font-medium hidden sm:table-cell">Price</th>
                  <th className="text-center p-4 font-medium hidden md:table-cell">Stock</th>
                  <th className="text-center p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p: any, i: number) => (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                          {p.images?.[0] && <Image src={p.images[0].url} alt="" width={40} height={40} className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-200 font-medium truncate max-w-[180px]">{p.name}</p>
                          <p className="text-gray-600 text-xs truncate max-w-[180px]">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right hidden sm:table-cell">
                      <span className="text-gold-400 font-mono font-bold">{formatCurrency(p.discountPrice ?? p.basePrice)}</span>
                      {p.discountPrice && (
                        <span className="text-gray-600 line-through text-xs block">{formatCurrency(p.basePrice)}</span>
                      )}
                    </td>
                    <td className="p-4 text-center hidden md:table-cell">
                      <span className={`text-sm font-medium ${p.totalStock === 0 ? 'text-red-400' : p.totalStock <= 5 ? 'text-orange-400' : 'text-gray-300'}`}>
                        {p.totalStock}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/products/${p.slug}`} className="btn-ghost p-1.5 text-gray-500 hover:text-blue-400" title="View">
                          <RiEyeLine className="w-4 h-4" />
                        </Link>
                        <Link href={`/dashboard/vendor/products/${p._id}/edit`} className="btn-ghost p-1.5 text-gray-500 hover:text-gold-400" title="Edit">
                          <RiEditLine className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setDeleteId(p._id)} className="btn-ghost p-1.5 text-gray-500 hover:text-red-400" title="Delete">
                          <RiDeleteBin2Line className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Product"
        message="This product will be soft-deleted and hidden from the store. This cannot be undone easily."
        danger
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
