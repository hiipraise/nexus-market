'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  RiCheckLine, RiLoader4Line, RiTruckLine,
  RiHomeLine, RiArchiveLine, RiArrowRightLine,
} from 'react-icons/ri'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { StatusBadge, LoadingSpinner, Modal } from '@/components/shared'
import { useState } from 'react'

const TRACK_STEPS = [
  { status: 'processing',        icon: RiArchiveLine,  label: 'Order Placed'     },
  { status: 'payment_confirmed', icon: RiCheckLine,    label: 'Payment Confirmed'},
  { status: 'shipped',           icon: RiTruckLine,    label: 'Shipped'          },
  { status: 'out_for_delivery',  icon: RiLoader4Line,  label: 'Out for Delivery' },
  { status: 'delivered',         icon: RiHomeLine,     label: 'Delivered'        },
]

export default function OrderDetailPage() {
  const { id }  = useParams<{ id: string }>()
  const qc      = useQueryClient()
  const [returnOpen, setReturnOpen] = useState(false)
  const [returnReason, setReturnReason] = useState('')

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn:  () => axios.get(`/api/orders/${id}`).then(r => r.data.data),
  })

  const returnMutation = useMutation({
    mutationFn: () => axios.post(`/api/orders/${id}/return`, { reason: returnReason }),
    onSuccess:  () => {
      toast.success('Return request submitted.')
      setReturnOpen(false)
      qc.invalidateQueries({ queryKey: ['order', id] })
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? 'Failed'),
  })

  if (isLoading) return <LoadingSpinner fullPage />
  if (!order)    return <p className="text-center pt-40 text-gray-500">Order not found.</p>

  const stepOrder = ['processing', 'payment_confirmed', 'shipped', 'out_for_delivery', 'delivered']
  const currentStep = stepOrder.indexOf(order.orderStatus)

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container max-w-3xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display font-black text-2xl text-gray-100">
              Order <span className="text-gold-400">#{order.orderNumber}</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">{formatDateTime(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={order.orderStatus} />
            <StatusBadge status={order.paymentStatus} />
          </div>
        </div>

        {/* Tracking timeline */}
        {order.orderStatus !== 'cancelled' && (
          <div className="card p-6 mb-6">
            <h2 className="font-display font-semibold text-gray-200 mb-6">Tracking</h2>
            <div className="relative">
              {/* Progress line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/10" />
              <div
                className="absolute top-5 left-5 h-0.5 bg-gold-500 transition-all duration-700"
                style={{ width: `${(currentStep / (TRACK_STEPS.length - 1)) * 100}%` }}
              />

              <div className="relative flex justify-between">
                {TRACK_STEPS.map((step, i) => {
                  const Icon    = step.icon
                  const done    = i <= currentStep
                  return (
                    <div key={step.status} className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10
                        ${done ? 'bg-gold-500 border-gold-500' : 'bg-[#0d0520] border-white/20'}`}>
                        <Icon className={`w-4 h-4 ${done ? 'text-gray-950' : 'text-gray-600'}`} />
                      </div>
                      <p className={`text-xs text-center max-w-[60px] leading-tight ${done ? 'text-gold-300' : 'text-gray-600'}`}>
                        {step.label}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="card p-6 mb-6">
          <h2 className="font-display font-semibold text-gray-200 mb-4">Items</h2>
          <div className="space-y-3">
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="flex gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                  {item.imageUrl && <Image src={item.imageUrl} alt="" width={64} height={64} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-200 font-body font-medium truncate">{item.productName}</p>
                  <p className="text-gray-500 text-xs">Size: {item.size} · Qty: {item.quantity}</p>
                </div>
                <span className="font-display font-bold text-gold-400 flex-shrink-0">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="card p-6 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotalAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Platform Fee</span>
              <span>{formatCurrency(order.platformFee)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-2 flex justify-between font-display font-black">
              <span className="text-gray-100">Total</span>
              <span className="text-gold-400">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Shipping */}
        {order.shippingAddress && (
          <div className="card p-6 mb-6">
            <h2 className="font-display font-semibold text-gray-200 mb-3">Shipping Address</h2>
            <p className="text-gray-400 text-sm font-body">
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.country}
            </p>
          </div>
        )}

        {/* Return request */}
        {order.orderStatus === 'delivered' && !order.returnRequest?.requested && (
          <button
            onClick={() => setReturnOpen(true)}
            className="text-sm text-gray-500 hover:text-gold-400 transition-colors"
          >
            Request a return or refund
          </button>
        )}

        {order.returnRequest?.requested && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-yellow-300 text-sm">
            Return request submitted — Status: <strong>{order.returnRequest.status}</strong>
          </div>
        )}

        <Modal isOpen={returnOpen} onClose={() => setReturnOpen(false)} title="Request Return" size="sm">
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">Please describe the reason for your return:</p>
            <textarea
              value={returnReason}
              onChange={e => setReturnReason(e.target.value)}
              rows={4}
              className="input resize-none"
              placeholder="Explain what was wrong with the order…"
            />
            <button
              onClick={() => returnMutation.mutate()}
              disabled={!returnReason || returnMutation.isPending}
              className="btn-primary w-full justify-center py-3 disabled:opacity-50"
            >
              {returnMutation.isPending ? 'Submitting…' : 'Submit Return Request'}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  )
}
