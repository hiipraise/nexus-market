'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { RiShoppingCartLine, RiHeartLine, RiStarFill, RiShieldCheckLine } from 'react-icons/ri'
import { formatCurrency, discountPercentage } from '@/lib/utils'
import type { IProduct, IVendor } from '@/types'
import { useCartStore } from '@/store'
import { toast } from 'sonner'

interface ProductCardProps {
  product: IProduct & {
    vendorId?: Partial<IVendor> & { businessName?: string; badge?: boolean }
  }
  index?:   number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem   = useCartStore(s => s.addItem)
  const openCart  = useCartStore(s => s.openCart)

  const primaryImage  = product.images?.find(i => i.isPrimary) ?? product.images?.[0]
  const currentPrice  = product.discountPrice ?? product.basePrice
  const hasDiscount   = !!product.discountPrice && product.discountPrice < product.basePrice
  const discountPct   = hasDiscount
    ? discountPercentage(product.basePrice, product.discountPrice!)
    : 0
  const firstVariant  = product.variants?.[0]
  const totalStock    = product.variants?.reduce((s, v) => s + v.quantity, 0) ?? 0
  const isLowStock    = totalStock > 0 && totalStock <= 5
  const isOutOfStock  = totalStock === 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isOutOfStock || !firstVariant) {
      toast.error('This product is out of stock')
      return
    }
    addItem({ productId: String(product._id), size: firstVariant.size, quantity: 1 })
    openCart()
    toast.success('Added to cart!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/products/${product.slug}`} className="card-product group block">
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-gold-800/20 flex items-center justify-center">
              <RiShoppingCartLine className="w-12 h-12 text-gray-700" />
            </div>
          )}

          {/* Badges overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {hasDiscount && (
              <span className="badge-discount">-{discountPct}%</span>
            )}
            {product.isBlackFriday && (
              <span className="badge-black-friday text-[10px] px-1.5 py-0.5">BF</span>
            )}
            {isLowStock && (
              <span className="inline-flex items-center px-1.5 py-0.5 bg-orange-500/90 rounded-full text-white text-[10px] font-bold">
                Low Stock
              </span>
            )}
            {isOutOfStock && (
              <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-700 rounded-full text-gray-300 text-[10px] font-bold">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); toast('Coming soon!') }}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-300 hover:text-red-400"
            aria-label="Add to wishlist"
          >
            <RiHeartLine className="w-4 h-4" />
          </button>

          {/* Add to cart overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold font-display flex items-center justify-center gap-2 transition-all
                ${isOutOfStock
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gold-500 text-gray-950 hover:bg-gold-400 shadow-gold'
                }`}
            >
              <RiShoppingCartLine className="w-4 h-4" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          {/* Vendor */}
          {product.vendorId && (
            <div className="flex items-center gap-1 mb-1.5">
              <span className="text-gray-500 text-xs font-body truncate">
                {(product.vendorId as any).businessName}
              </span>
              {(product.vendorId as any).badge && (
                <RiShieldCheckLine className="w-3 h-3 text-gold-400 flex-shrink-0" />
              )}
            </div>
          )}

          {/* Name */}
          <h3 className="font-body font-medium text-gray-200 text-sm leading-snug line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Rating */}
          {product.ratings.count > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <RiStarFill className="w-3 h-3 text-gold-400" />
              <span className="text-gray-400 text-xs">{product.ratings.average.toFixed(1)}</span>
              <span className="text-gray-600 text-xs">({product.ratings.count})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-display font-bold text-base ${hasDiscount ? 'price-discount' : 'price-current'}`}>
              {formatCurrency(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="price-original text-xs">
                {formatCurrency(product.basePrice)}
              </span>
            )}
          </div>

          {/* Sizes */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {product.variants.slice(0, 5).map(v => (
                <span
                  key={v.size}
                  className={`text-[10px] px-1.5 py-0.5 rounded border font-mono
                    ${v.quantity === 0
                      ? 'border-gray-700 text-gray-700'
                      : 'border-gold-500/30 text-gold-400'
                    }`}
                >
                  {v.size}
                </span>
              ))}
              {product.variants.length > 5 && (
                <span className="text-[10px] text-gray-600">+{product.variants.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
