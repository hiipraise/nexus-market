'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { RiCheckLine, RiCloseLine, RiLoader4Line, RiArrowRightLine } from 'react-icons/ri'
import axios from 'axios'
import { useCartStore } from '@/store'

type Status = 'verifying' | 'success' | 'failed'

export default function PaymentVerifyPage() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const clearCart    = useCartStore(s => s.clearCart)
  const reference    = searchParams.get('reference') ?? ''

  const [status,    setStatus]    = useState<Status>('verifying')
  const [orderData, setOrderData] = useState<any>(null)

  useEffect(() => {
    if (!reference) { setStatus('failed'); return }

    axios.get(`/api/payments/verify/${reference}`)
      .then(res => {
        if (res.data.success) {
          setStatus('success')
          setOrderData(res.data.data)
          clearCart()
        } else {
          setStatus('failed')
        }
      })
      .catch(() => setStatus('failed'))
  }, [reference]) // eslint-disable-line

  return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-12 max-w-md w-full mx-4 text-center"
      >
        {status === 'verifying' && (
          <>
            <RiLoader4Line className="w-16 h-16 text-gold-400 mx-auto animate-spin mb-4" />
            <h2 className="font-display font-bold text-xl text-gray-100 mb-2">Verifying payment…</h2>
            <p className="text-gray-500 text-sm">Please wait, do not close this page.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-6">
              <RiCheckLine className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="font-display font-black text-2xl text-gray-100 mb-2">Payment Successful!</h2>
            <p className="text-gray-400 text-sm mb-2">Your order has been placed.</p>
            {orderData?.orderNumber && (
              <p className="text-gold-400 font-mono font-bold mb-6">#{orderData.orderNumber}</p>
            )}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push(`/orders/${orderData?._id ?? ''}`)}
                className="btn-primary w-full justify-center py-3"
              >
                Track Order <RiArrowRightLine className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push('/products')}
                className="btn-ghost w-full justify-center text-sm"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-6">
              <RiCloseLine className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="font-display font-black text-2xl text-gray-100 mb-2">Payment Failed</h2>
            <p className="text-gray-400 text-sm mb-6">
              Your payment could not be verified. If you were charged, please contact support.
            </p>
            <button onClick={() => router.push('/checkout')} className="btn-primary w-full justify-center py-3">
              Try Again
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
