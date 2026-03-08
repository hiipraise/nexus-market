'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Dialog, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import {
  RiCloseLine, RiShoppingCartLine, RiDeleteBinLine,
  RiAddLine, RiSubtractLine, RiShareLine,
} from 'react-icons/ri'
import { useCartStore } from '@/store'
import { formatCurrency } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { toast } from 'sonner'

export default function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQty, totalItems } = useCartStore()
  const { data: session } = useSession()

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart', session?.user.id],
    queryFn:  () => axios.get('/api/cart').then(r => r.data.data),
    enabled:  !!session && isOpen,
  })

  const resolvedItems = cartData?.items ?? items

  const subtotal = resolvedItems.reduce((acc: number, item: any) => {
    const price = item.productId?.discountPrice ?? item.productId?.basePrice ?? 0
    return acc + price * item.quantity
  }, 0)

  const handleShare = async () => {
    const username = prompt('Enter the username to share your cart with:')
    if (!username) return
    try {
      await axios.patch('/api/cart', { targetUsername: username })
      toast.success(`Cart shared with @${username}!`)
    } catch {
      toast.error('Could not share cart. Check if username exists and is public.')
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeCart}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="flex h-full justify-end">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-200"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="w-full max-w-md glass border-l border-[rgba(200,139,0,0.15)] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                  <Dialog.Title className="font-display font-bold text-xl text-gray-100 flex items-center gap-2">
                    <RiShoppingCartLine className="w-5 h-5 text-gold-400" />
                    Cart
                    {totalItems() > 0 && (
                      <span className="text-sm bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded-full">
                        {totalItems()} items
                      </span>
                    )}
                  </Dialog.Title>
                  <div className="flex items-center gap-2">
                    {session && totalItems() > 0 && (
                      <button
                        onClick={handleShare}
                        className="btn-ghost p-2 rounded-xl"
                        title="Share cart"
                      >
                        <RiShareLine className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={closeCart} className="btn-ghost p-2 rounded-xl">
                      <RiCloseLine className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1,2,3].map(i => (
                        <div key={i} className="skeleton h-24 rounded-xl" />
                      ))}
                    </div>
                  ) : resolvedItems.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center h-64 text-center"
                    >
                      <RiShoppingCartLine className="w-16 h-16 text-gray-700 mb-4" />
                      <p className="text-gray-400 font-body">Your cart is empty</p>
                      <p className="text-gray-600 text-sm mt-1">Start exploring our products</p>
                      <Link href="/products" onClick={closeCart} className="btn-primary mt-4 text-sm">
                        Browse Products
                      </Link>
                    </motion.div>
                  ) : (
                    resolvedItems.map((item: any, idx: number) => {
                      const product = item.productId ?? {}
                      const image   = product.images?.find((i: any) => i.isPrimary) ?? product.images?.[0]
                      const price   = product.discountPrice ?? product.basePrice ?? 0

                      return (
                        <motion.div
                          key={`${String(item.productId?._id ?? item.productId)}-${item.size}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex gap-3 p-3 card rounded-xl"
                        >
                          {/* Image */}
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                            {image ? (
                              <Image
                                src={image.url}
                                alt={product.name ?? ''}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-800/30 to-gold-700/20" />
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <p className="font-body font-medium text-gray-200 text-sm line-clamp-1">
                              {product.name ?? 'Product'}
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5">Size: {item.size}</p>
                            <p className="text-gold-400 font-display font-bold text-sm mt-1">
                              {formatCurrency(price)}
                            </p>

                            {/* Qty controls */}
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => {
                                  if (item.quantity <= 1) {
                                    removeItem(String(item.productId?._id ?? item.productId), item.size)
                                  } else {
                                    updateQty(String(item.productId?._id ?? item.productId), item.size, item.quantity - 1)
                                  }
                                }}
                                className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center hover:bg-gold-500/20 transition-colors"
                              >
                                <RiSubtractLine className="w-3 h-3" />
                              </button>
                              <span className="font-mono text-sm text-gray-300 w-5 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQty(String(item.productId?._id ?? item.productId), item.size, item.quantity + 1)}
                                className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center hover:bg-gold-500/20 transition-colors"
                              >
                                <RiAddLine className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => removeItem(String(item.productId?._id ?? item.productId), item.size)}
                                className="ml-auto text-gray-600 hover:text-red-400 transition-colors"
                              >
                                <RiDeleteBinLine className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </div>

                {/* Footer */}
                {resolvedItems.length > 0 && (
                  <div className="p-5 border-t border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-body">Subtotal</span>
                      <span className="font-display font-bold text-xl text-gold-400">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs font-body">
                      Shipping and taxes calculated at checkout
                    </p>
                    <Link
                      href="/checkout"
                      onClick={closeCart}
                      className="btn-primary w-full justify-center text-base py-4"
                    >
                      Proceed to Checkout
                    </Link>
                    {!session && (
                      <p className="text-center text-xs text-gray-500">
                        <Link href="/login" className="text-gold-400 hover:underline">Sign in</Link>
                        {' '}for a faster checkout experience
                      </p>
                    )}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
