'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { RiShoppingBagLine, RiArrowRightLine } from 'react-icons/ri'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StatusBadge, LoadingSpinner, Pagination, EmptyState } from '@/components/shared'

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page],
    queryFn:  () => axios.get(`/api/orders?page=${page}&limit=10`).then(r => r.data),
    enabled:  !!session,
  })

  if (status === 'unauthenticated') {
    if (typeof window !== 'undefined') window.location.href = '/login'
    return null
  }

  const orders = data?.data ?? []
  const meta   = data?.meta

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="page-container max-w-3xl">
        <h1 className="section-title mb-8">My Orders</h1>

        {isLoading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<RiShoppingBagLine className="w-16 h-16" />}
            title="No orders yet"
            message="When you place your first order, it will appear here."
            action={<Link href="/products" className="btn-primary">Start Shopping</Link>}
          />
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order: any, i: number) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/orders/${order._id}`} className="card p-5 flex items-center gap-4 hover:border-gold-500/30 transition-all group block">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-gold-400 font-bold text-sm">#{order.orderNumber}</span>
                        <StatusBadge status={order.orderStatus} />
                        <StatusBadge status={order.paymentStatus} />
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{formatDate(order.createdAt)} · {order.items?.length} item(s)</p>
                    </div>
                    <div className="text-right flex-shrink-0 flex items-center gap-3">
                      <span className="font-display font-bold text-gold-400">{formatCurrency(order.totalAmount)}</span>
                      <RiArrowRightLine className="w-4 h-4 text-gray-500 group-hover:text-gold-400 transition-colors" />
                    </div>
                  </Link>
                </motion.div>
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
