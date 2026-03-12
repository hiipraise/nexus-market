import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connectDB } from '@/lib/db/connect'
import { Product } from '@/models'
import ProductDetailClient from '@/components/products/ProductDetailClient'
import type { IProduct } from '@/types'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connectDB()
  const product = await Product.findOne({ slug: params.slug, status: 'active', isDeleted: false })
    .populate('categories', 'name').lean<IProduct>()
  if (!product) return { title: 'Product Not Found' }
  return {
    title:       product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.shortDesc ?? product.description.slice(0, 155),
    openGraph: {
      images: [product.images[0]?.url ?? ''],
      title:  product.name,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  await connectDB()
  const product = await Product.findOne({ slug: params.slug, isDeleted: false })
    .populate('vendorId',   'businessName badge profilePic phone whatsapp ratings userId')
    .populate('categories', 'name slug')
    .lean<IProduct>()

  if (!product) notFound()

  return <ProductDetailClient product={JSON.parse(JSON.stringify(product))} />
}
