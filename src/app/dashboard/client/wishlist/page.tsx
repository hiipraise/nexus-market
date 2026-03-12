'use client'
import { RiHeartLine } from 'react-icons/ri'
import { EmptyState } from '@/components/shared'
import Link from 'next/link'

export default function WishlistPage() {
  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <h1 className="font-display font-bold text-2xl text-gray-100 mb-8">Wishlist</h1>
      <EmptyState
        icon={<RiHeartLine className="w-16 h-16" />}
        title="Your wishlist is empty"
        message="Save products you love to come back to them later."
        action={<Link href="/products" className="btn-primary text-sm">Browse Products</Link>}
      />
    </div>
  )
}
