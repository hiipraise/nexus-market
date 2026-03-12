'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { RiAddLine } from 'react-icons/ri'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { toast } from 'sonner'
import { StarRating, Modal, Pagination, LoadingSpinner } from '@/components/shared'
import { timeAgo } from '@/lib/utils'

interface Props { productId: string; vendorId: string }

export default function ProductReviews({ productId, vendorId }: Props) {
  const { data: session } = useSession()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [writeOpen, setWriteOpen] = useState(false)
  const [form, setForm] = useState({ rating: 0, title: '', body: '', orderId: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId, page],
    queryFn:  () => axios.get(`/api/reviews?product=${productId}&page=${page}&limit=10`).then(r => r.data),
  })

  const { data: eligibleOrders } = useQuery({
    queryKey: ['eligible-orders', productId],
    queryFn:  () => axios.get(`/api/orders?eligible=${productId}`).then(r => r.data.data),
    enabled:  !!session,
  })

  const reviewMutation = useMutation({
    mutationFn: () => axios.post('/api/reviews', { ...form, productId }),
    onSuccess:  () => {
      toast.success('Review submitted!')
      setWriteOpen(false)
      setForm({ rating: 0, title: '', body: '', orderId: '' })
      qc.invalidateQueries({ queryKey: ['reviews', productId] })
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? 'Failed to submit review'),
  })

  const reviews    = data?.data ?? []
  const meta       = data?.meta
  const totalRatings = data?.data?.reduce((s: number, r: any) => s + r.rating, 0)
  const avgRating  = reviews.length ? totalRatings / reviews.length : 0

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-xl text-gray-100">
            Reviews {meta?.total ? `(${meta.total})` : ''}
          </h2>
          {avgRating > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={avgRating} readOnly size="sm" />
              <span className="text-gray-400 text-sm">{avgRating.toFixed(1)} average</span>
            </div>
          )}
        </div>
        {session?.user.role === 'client' && (
          <button onClick={() => setWriteOpen(true)} className="btn-secondary text-sm flex items-center gap-1.5">
            <RiAddLine className="w-4 h-4" /> Write a Review
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : reviews.length === 0 ? (
        <p className="text-gray-600 text-center py-12 font-body">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any, i: number) => {
            const user = review.userId as any
            return (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-purple overflow-hidden flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {user?.profile?.avatarUrl ? (
                        <Image src={user.profile.avatarUrl} alt="" width={36} height={36} className="w-full h-full object-cover" />
                      ) : (
                        user?.username?.[0]?.toUpperCase() ?? '?'
                      )}
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm font-medium">@{user?.username ?? 'User'}</p>
                      <p className="text-gray-600 text-xs">{timeAgo(review.createdAt)}</p>
                    </div>
                  </div>
                  <StarRating value={review.rating} readOnly size="sm" />
                </div>

                {review.title && (
                  <p className="font-display font-semibold text-gray-200 mt-3">{review.title}</p>
                )}
                <p className="text-gray-400 text-sm font-body leading-relaxed mt-1">{review.body}</p>

                {review.images?.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {review.images.map((url: string, idx: number) => (
                      <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden">
                        <Image src={url} alt="" width={64} height={64} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
      )}

      {/* Write Review Modal */}
      <Modal isOpen={writeOpen} onClose={() => setWriteOpen(false)} title="Write a Review" size="md">
        <div className="space-y-4">
          {eligibleOrders?.length === 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-yellow-300 text-sm">
              You can only review products from delivered orders.
            </div>
          )}

          <div>
            <label className="input-label">Rating <span className="text-red-400">*</span></label>
            <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} size="lg" />
          </div>

          {eligibleOrders?.length > 0 && (
            <div>
              <label className="input-label">Order <span className="text-red-400">*</span></label>
              <select
                value={form.orderId}
                onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))}
                className="input"
              >
                <option value="">Select order…</option>
                {eligibleOrders.map((o: any) => (
                  <option key={o._id} value={o._id}>#{o.orderNumber}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="input-label">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Short summary…"
              className="input"
            />
          </div>

          <div>
            <label className="input-label">Review <span className="text-red-400">*</span></label>
            <textarea
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              rows={4}
              placeholder="Share your experience with this product…"
              className="input resize-none"
            />
          </div>

          <button
            onClick={() => reviewMutation.mutate()}
            disabled={!form.rating || !form.body || !form.orderId || reviewMutation.isPending}
            className="btn-primary w-full justify-center py-3 disabled:opacity-50"
          >
            {reviewMutation.isPending ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
