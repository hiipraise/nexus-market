import ProductForm from '@/components/dashboard/vendor/ProductForm'

export default function NewProductPage() {
  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <h1 className="font-display font-bold text-2xl text-gray-100 mb-8">Add New Product</h1>
      <ProductForm />
    </div>
  )
}
