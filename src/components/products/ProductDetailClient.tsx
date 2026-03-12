'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  RiShoppingCartLine, RiPhoneLine, RiWhatsappLine, RiShieldCheckLine,
  RiStarFill, RiHeartLine, RiShareLine, RiAlertLine, RiArrowRightLine,
} from 'react-icons/ri'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { formatCurrency, discountPercentage, normalizePhone } from '@/lib/utils'
import { useCartStore } from '@/store'
import { StarRating, StatusBadge } from '@/components/shared'
import ReportModal from './ReportModal'
import ProductReviews from './ProductReviews'
import type { IProduct } from '@/types'

export default function ProductDetailClient({ product }: { product: any }) {
  const { data: session } = useSession()
  const addItem  = useCartStore(s => s.addItem)
  const openCart = useCartStore(s => s.openCart)

  const [selectedImage,   setSelectedImage]   = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string>(product.variants?.[0]?.size ?? '')
  const [qty,             setQty]             = useState(1)
  const [reportOpen,      setReportOpen]      = useState(false)

  const vendor     = product.vendorId as any
  const currentVariant = product.variants?.find((v: any) => v.size === selectedVariant)
  const hasDiscount    = !!product.discountPrice && product.discountPrice < product.basePrice
  const currentPrice   = product.discountPrice ?? product.basePrice
  const discountPct    = hasDiscount ? discountPercentage(product.basePrice, product.discountPrice) : 0
  const isOutOfStock   = !currentVariant || currentVariant.quantity === 0
  const isLowStock     = currentVariant && currentVariant.quantity > 0 && currentVariant.quantity <= 5

  const handleAddToCart = () => {
    if (!selectedVariant) { toast.error('Please select a size'); return }
    if (isOutOfStock)     { toast.error('Out of stock'); return }
    addItem({ productId: String(product._id), size: selectedVariant, quantity: qty })
    openCart()
    toast.success('Added to cart!')
  }

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 font-body">
          <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gold-400 transition-colors">Products</Link>
          {product.categories?.[0] && (
            <><span>/</span>
            <Link href={`/products?category=${product.categories[0]._id}`} className="hover:text-gold-400 transition-colors capitalize">
              {product.categories[0].name}
            </Link></>
          )}
          <span>/</span>
          <span className="text-gray-300 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10"
            >
              {product.images?.[selectedImage] ? (
                <Image
                  src={product.images[selectedImage].url}
                  alt={product.images[selectedImage].alt ?? product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-gold-800/20" />
              )}
              {hasDiscount && (
                <div className="absolute top-4 left-4">
                  <span className="badge-discount text-sm px-3 py-1.5">-{discountPct}%</span>
                </div>
              )}
              {product.isBlackFriday && (
                <div className="absolute top-4 right-4">
                  <span className="badge-black-friday text-sm px-3 py-1.5">Black Friday</span>
                </div>
              )}
            </motion.div>

            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all
                      ${selectedImage === i ? 'border-gold-400' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Vendor */}
            {vendor && (
              <Link href={`/vendors/${vendor.userId?.username ?? vendor._id}`} className="flex items-center gap-2 group w-fit">
                <div className="w-8 h-8 rounded-full bg-gradient-purple overflow-hidden flex items-center justify-center text-white text-xs font-bold">
                  {vendor.profilePic ? (
                    <Image src={vendor.profilePic} alt={vendor.businessName} width={32} height={32} className="w-full h-full object-cover" />
                  ) : vendor.businessName?.[0]}
                </div>
                <span className="text-gray-400 text-sm group-hover:text-gold-400 transition-colors">{vendor.businessName}</span>
                {vendor.badge && <RiShieldCheckLine className="w-4 h-4 text-gold-400" />}
              </Link>
            )}

            <div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-100 mb-2">{product.name}</h1>
              {product.ratings?.count > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating value={product.ratings.average} readOnly size="sm" />
                  <span className="text-gray-400 text-sm">{product.ratings.average.toFixed(1)} ({product.ratings.count} reviews)</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className={`font-display font-black text-3xl ${hasDiscount ? 'text-red-400' : 'text-gold-400'}`}>
                {formatCurrency(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="price-original text-lg">{formatCurrency(product.basePrice)}</span>
              )}
            </div>

            {/* Short desc */}
            {product.shortDesc && (
              <p className="text-gray-400 font-body leading-relaxed">{product.shortDesc}</p>
            )}

            {/* Gender/Category tags */}
            <div className="flex flex-wrap gap-2">
              <span className="badge-new capitalize px-3">{product.gender}</span>
              {product.categories?.map((cat: any) => (
                <span key={cat._id} className="badge-verified px-3">{cat.name}</span>
              ))}
            </div>

            {/* Size selector */}
            {product.variants?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="input-label mb-0">Size</label>
                  {isLowStock && (
                    <span className="text-orange-400 text-xs font-medium">Only {currentVariant?.quantity} left!</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button
                      key={v.size}
                      onClick={() => setSelectedVariant(v.size)}
                      disabled={v.quantity === 0}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all
                        ${selectedVariant === v.size
                          ? 'bg-gold-500 border-gold-500 text-gray-950 font-bold'
                          : v.quantity === 0
                            ? 'border-gray-700 text-gray-700 cursor-not-allowed line-through'
                            : 'border-white/20 text-gray-300 hover:border-gold-500/50 hover:text-gold-300'
                        }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="input-label mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 transition-all font-bold text-lg">
                  −
                </button>
                <span className="font-mono font-bold text-lg text-gray-100 w-8 text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(currentVariant?.quantity ?? 1, q + 1))}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 transition-all font-bold text-lg">
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-display font-bold text-base transition-all
                  ${isOutOfStock
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'btn-primary shadow-gold-lg'
                  }`}
              >
                <RiShoppingCartLine className="w-5 h-5" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button onClick={() => toast('Wishlist coming soon!')} className="btn-secondary p-4">
                <RiHeartLine className="w-5 h-5" />
              </button>
              <button onClick={handleShare} className="btn-secondary p-4">
                <RiShareLine className="w-5 h-5" />
              </button>
            </div>

            {/* Vendor contact */}
            {vendor && (
              <div className="card p-4 space-y-3">
                <p className="text-gray-400 text-sm font-body font-medium">Contact Vendor</p>
                <div className="flex gap-2">
                  {vendor.phone && (
                    <a href={`tel:${vendor.phone}`} className="flex items-center gap-2 btn-secondary text-sm flex-1 justify-center">
                      <RiPhoneLine className="w-4 h-4 text-green-400" /> Call
                    </a>
                  )}
                  {vendor.whatsapp && (
                    <a
                      href={`https://wa.me/${normalizePhone(vendor.whatsapp).replace(/\D/g,'')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 btn-secondary text-sm flex-1 justify-center"
                    >
                      <RiWhatsappLine className="w-4 h-4 text-green-400" /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Report */}
            {session && (
              <button onClick={() => setReportOpen(true)} className="flex items-center gap-1.5 text-gray-600 hover:text-red-400 text-xs transition-colors">
                <RiAlertLine className="w-3.5 h-3.5" /> Report this product
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-16 max-w-3xl">
          <h2 className="font-display font-bold text-xl text-gray-100 mb-4">Description</h2>
          <div className="divider-gold" />
          <p className="text-gray-400 font-body leading-loose whitespace-pre-wrap">{product.description}</p>
        </div>

        {/* Reviews */}
        <ProductReviews productId={product._id} vendorId={product.vendorId?._id ?? product.vendorId} />

        {/* Report Modal */}
        <ReportModal
          isOpen={reportOpen}
          onClose={() => setReportOpen(false)}
          entityType="product"
          entityId={String(product._id)}
        />
      </div>
    </div>
  )
}
