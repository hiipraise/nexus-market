'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { StatusBadge, LoadingSpinner, Pagination, ConfirmDialog } from '@/components/shared'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useDebounce } from '@/hooks'
import { RiSearchLine } from 'react-icons/ri'
import Link from 'next/link'

export default function AdminProductsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const deb = useDebounce(search, 400)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', deb, page],
    queryFn:  () => axios.get(`/api/search?q=${deb}&page=${page}&limit=20`).then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/products/${id}`),
    onSuccess: () => { toast.success('Product removed'); qc.invalidateQueries({ queryKey: ['admin-products'] }); setDeleteId(null) },
    onError: () => toast.error('Failed'),
  })

  const products = data?.data ?? []
  const meta     = data?.meta

  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <h1 className="font-display font-bold text-2xl text-gray-100 mb-8">Products</h1>
      <div className="relative mb-6 max-w-xs">
        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className="input pl-9 text-sm py-2" />
      </div>
      {isLoading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-500">
                <th className="text-left p-4 font-medium">Product</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Vendor</th>
                <th className="text-right p-4 font-medium hidden sm:table-cell">Price</th>
                <th className="text-center p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p._id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="p-4">
                    <Link href={`/products/${p.slug}`} className="text-gray-200 hover:text-gold-400 font-medium truncate max-w-[160px] block">{p.name}</Link>
                  </td>
                  <td className="p-4 text-gray-500 text-xs hidden md:table-cell">{p.vendorId?.businessName}</td>
                  <td className="p-4 text-right text-gold-400 font-mono hidden sm:table-cell">{formatCurrency(p.basePrice)}</td>
                  <td className="p-4 text-center"><StatusBadge status={p.status} /></td>
                  <td className="p-4 text-right">
                    <button onClick={() => setDeleteId(p._id)} className="text-red-400 text-xs hover:underline">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {meta && meta.totalPages > 1 && <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Remove Product"
        message="This will soft-delete the product and hide it from the store."
        danger loading={deleteMutation.isPending}
      />
    </div>
  )
}
