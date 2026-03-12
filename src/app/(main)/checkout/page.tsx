'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { RiSecurePaymentLine, RiLockLine, RiArrowRightLine } from 'react-icons/ri'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { useCartStore } from '@/store'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'

const CheckoutSchema = z.object({
  email:      z.string().email('Valid email required'),
  firstName:  z.string().min(1, 'Required'),
  lastName:   z.string().min(1, 'Required'),
  phone:      z.string().min(10, 'Valid phone required'),
  address:    z.string().min(5, 'Required'),
  city:       z.string().min(2, 'Required'),
  state:      z.string().min(2, 'Required'),
  discountCode: z.string().optional(),
})
type CheckoutForm = z.infer<typeof CheckoutSchema>

export default function CheckoutPage() {
  const router           = useRouter()
  const { data: session } = useSession()
  const { items, clearCart } = useCartStore()
  const [discountInfo, setDiscountInfo] = useState<{ value: number; type: string } | null>(null)
  const [validatingCode, setValidatingCode] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(CheckoutSchema),
    defaultValues: {
      email:     session?.user?.email ?? '',
      firstName: '',
      lastName:  '',
    },
  })

  const subtotal = items.reduce(
    (s, i) => s + (i.discountPrice ?? i.basePrice ?? 0) * i.quantity, 0
  )
  const discount = discountInfo
    ? discountInfo.type === 'percentage'
      ? Math.floor(subtotal * discountInfo.value / 100)
      : discountInfo.value * 100
    : 0
  const total = subtotal - discount

  const discountCode = watch('discountCode')

  const validateCode = async () => {
    if (!discountCode) return
    setValidatingCode(true)
    try {
      const res = await axios.post('/api/discounts/validate', { code: discountCode, amount: subtotal })
      setDiscountInfo(res.data.data)
      toast.success('Discount applied!')
    } catch {
      toast.error('Invalid or expired code')
      setDiscountInfo(null)
    } finally {
      setValidatingCode(false)
    }
  }

  const orderMutation = useMutation({
    mutationFn: (data: CheckoutForm) =>
      axios.post('/api/orders', {
        items: items.map(i => ({
          productId:   i.productId,
          size:        i.size,
          quantity:    i.quantity,
        })),
        guestInfo: !session ? {
          email:     data.email,
          firstName: data.firstName,
          lastName:  data.lastName,
          phone:     data.phone,
        } : undefined,
        shippingAddress: {
          street:  data.address,
          city:    data.city,
          state:   data.state,
          country: 'Nigeria',
        },
        discountCode: data.discountCode || undefined,
        callbackUrl:  `${window.location.origin}/checkout/verify`,
      }),
    onSuccess: (res) => {
      if (res.data.data?.authorizationUrl) {
        // Redirect to Paystack
        window.location.href = res.data.data.authorizationUrl
      }
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? 'Order failed. Try again.'),
  })

  const onSubmit = (data: CheckoutForm) => {
    if (items.length === 0) { toast.error('Your cart is empty'); return }
    orderMutation.mutate(data)
  }

  if (items.length === 0) {
    router.replace('/cart')
    return null
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        <h1 className="section-title mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="card p-6">
                <h2 className="font-display font-bold text-lg text-gray-100 mb-5 flex items-center gap-2">
                  <RiSecurePaymentLine className="w-5 h-5 text-gold-400" /> Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">First Name <span className="text-red-400">*</span></label>
                    <input {...register('firstName')} type="text" className="input" />
                    {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="input-label">Last Name <span className="text-red-400">*</span></label>
                    <input {...register('lastName')} type="text" className="input" />
                    {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="input-label">Email <span className="text-red-400">*</span></label>
                    <input {...register('email')} type="email" className="input" />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="input-label">Phone <span className="text-red-400">*</span></label>
                    <input {...register('phone')} type="tel" placeholder="+234…" className="input" />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-display font-bold text-lg text-gray-100 mb-5">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="input-label">Street Address <span className="text-red-400">*</span></label>
                    <input {...register('address')} type="text" placeholder="House no, street name" className="input" />
                    {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
                  </div>
                  <div>
                    <label className="input-label">City <span className="text-red-400">*</span></label>
                    <input {...register('city')} type="text" className="input" />
                    {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="input-label">State <span className="text-red-400">*</span></label>
                    <input {...register('state')} type="text" className="input" />
                    {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state.message}</p>}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={orderMutation.isPending}
                className="btn-primary w-full justify-center py-4 text-base"
              >
                {orderMutation.isPending ? 'Processing…' : (
                  <><RiLockLine className="w-5 h-5" /> Pay {formatCurrency(total)} with Paystack</>
                )}
              </button>

              <p className="text-center text-gray-600 text-xs flex items-center justify-center gap-1">
                <RiLockLine className="w-3.5 h-3.5" /> Secured by Paystack. Your data is encrypted.
              </p>
            </form>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-display font-bold text-gray-200 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      {item.imageUrl && <Image src={item.imageUrl} alt="" width={48} height={48} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300 text-sm truncate">{item.name}</p>
                      <p className="text-gray-500 text-xs">Size: {item.size} × {item.quantity}</p>
                    </div>
                    <span className="text-gold-400 text-sm font-bold flex-shrink-0">
                      {formatCurrency((item.discountPrice ?? item.basePrice ?? 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Discount code */}
              <div className="border-t border-white/10 pt-4 mb-4">
                <label className="input-label mb-2">Discount Code</label>
                <div className="flex gap-2">
                  <input
                    {...register('discountCode')}
                    type="text"
                    placeholder="Enter code…"
                    className="input flex-1 text-sm py-2"
                  />
                  <button
                    type="button"
                    onClick={validateCode}
                    disabled={validatingCode}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    {validatingCode ? '…' : 'Apply'}
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 flex justify-between font-display font-black text-base">
                  <span className="text-gray-100">Total</span>
                  <span className="text-gold-400">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
