'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { RiShoppingCartLine, RiDeleteBin2Line, RiArrowRightLine, RiStore2Line } from 'react-icons/ri'
import { useCartStore } from '@/store'
import { formatCurrency } from '@/lib/utils'
import { EmptyState } from '@/components/shared'

export default function CartPage() {
  const { items, removeItem, updateQty, totalItems, clearCart } = useCartStore()
  const cartItemCount = totalItems()

  const subtotal = items.reduce(
    (sum, item) => sum + (item.discountPrice ?? item.basePrice ?? 0) * item.quantity,
    0
  )

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-28 pb-16">
        <div className="page-container">
          <EmptyState
            icon={<RiShoppingCartLine className="w-20 h-20" />}
            title="Your cart is empty"
            message="Browse our products and add something you love."
            action={<Link href="/products" className="btn-primary">Start Shopping</Link>}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="page-container">
        <div className="flex items-center justify-between mb-8">
          <h1 className="section-title">Your Cart ({cartItemCount})</h1>
          <button onClick={clearCart} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition-colors">
            <RiDeleteBin2Line className="w-4 h-4" /> Clear cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item, i) => (
              <motion.div
                key={`${item.productId}-${item.size}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-4 flex gap-4"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.name ?? ''} width={80} height={80} className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-body font-medium text-gray-200 truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.vendorName && (
                      <span className="text-gray-500 text-xs flex items-center gap-1">
                        <RiStore2Line className="w-3 h-3" /> {item.vendorName}
                      </span>
                    )}
                    {item.size && (
                      <span className="text-gray-500 text-xs">· Size: {item.size}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Qty control */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => item.quantity > 1 ? updateQty(String(item.productId), item.size, item.quantity - 1) : removeItem(String(item.productId), item.size)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 text-lg font-bold transition-all"
                      >−</button>
                      <span className="font-mono text-gray-200 w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(String(item.productId), item.size, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 text-lg font-bold transition-all"
                      >+</button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-gold-400">
                        {formatCurrency((item.discountPrice ?? item.basePrice ?? 0) * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(String(item.productId), item.size)}
                        className="text-gray-600 hover:text-red-400 transition-colors"
                      >
                        <RiDeleteBin2Line className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="card p-6 h-fit sticky top-28 space-y-4">
            <h2 className="font-display font-bold text-lg text-gray-100">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal ({cartItemCount} items)</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Delivery</span>
                <span className="text-green-400">Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 flex justify-between">
              <span className="font-display font-bold text-gray-200">Total</span>
              <span className="font-display font-black text-xl text-gold-400">{formatCurrency(subtotal)}</span>
            </div>

            <Link href="/checkout" className="btn-primary w-full justify-center py-4 text-base">
              Proceed to Checkout <RiArrowRightLine className="w-5 h-5" />
            </Link>
            <Link href="/products" className="btn-ghost w-full justify-center text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
