import type { Metadata } from 'next'
import ProductsClientPage from '@/components/products/ProductsClientPage'

export const metadata: Metadata = {
  title:       'Shop All Products',
  description: 'Browse thousands of products across all categories. Filter by gender, price, and more.',
}

export default function ProductsPage() {
  return <ProductsClientPage />
}
