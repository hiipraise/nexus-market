'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StatusBadge, LoadingSpinner, Pagination, Modal } from '@/components/shared'

const ORDER_STATUSES = ['processing', 'payment_confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']

export default function VendorOrdersPage() {
  const qc          = useQueryClient()
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [newStatus, setNewStatus]         = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-orders', page],
    queryFn:  () => axios.get(`/api/orders?page=${page}&limit=20`).then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      axios.patch(`/api/orders/${id}`, { status }),
    onSuccess: () => {
      toast.success('Order status updated')
      qc.invalidateQueries({ queryKey: ['vendor-orders'] })
      setSelectedOrder(null)
    },
    onError: () => toast.error('Failed to update'),
  })

  const orders = data?.data ?? []
  const meta   = data?.meta

  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <h1 className="font-display font-bold text-2xl text-gray-100 mb-8">Orders</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <div className="card p-16 text-center text-gray-500">No orders yet.</div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500">
                  <th className="text-left p-4 font-medium">Order</th>
                  <th className="text-left p-4 font-medium hidden sm:table-cell">Date</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Amount</th>
                  <th className="text-right p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="p-4 font-mono text-gold-400 font-bold text-xs">#{order.orderNumber}</td>
                    <td className="p-4 text-gray-500 text-xs hidden sm:table-cell">{formatDate(order.createdAt)}</td>
                    <td className="p-4"><StatusBadge status={order.orderStatus} /></td>
                    <td className="p-4 text-right font-display font-bold text-gray-200">{formatCurrency(order.totalAmount)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => { setSelectedOrder(order); setNewStatus(order.orderStatus) }}
                        className="text-gold-400 text-xs hover:underline"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.totalPages > 1 && (
            <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Update Order Status" size="sm">
        {selectedOrder && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">Order <span className="text-gold-400 font-mono">#{selectedOrder.orderNumber}</span></p>
            <div>
              <label className="input-label">New Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input">
                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <button
              onClick={() => updateMutation.mutate({ id: selectedOrder._id, status: newStatus })}
              disabled={updateMutation.isPending}
              className="btn-primary w-full justify-center py-3"
            >
              {updateMutation.isPending ? 'Updating…' : 'Update Status'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
