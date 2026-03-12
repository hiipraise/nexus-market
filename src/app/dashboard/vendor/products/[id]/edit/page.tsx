'use client'
import { useParams } from 'next/navigation'
import ProductForm from '@/components/dashboard/vendor/ProductForm'

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <h1 className="font-display font-bold text-2xl text-gray-100 mb-8">Edit Product</h1>
      <ProductForm productId={id} />
    </div>
  )
}
