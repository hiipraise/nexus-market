'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import { toast } from 'sonner'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { RiAddLine, RiDeleteBin2Line, RiUploadLine } from 'react-icons/ri'
import { productGenders, productSizes, cloudinaryConfig } from '@/config'
import { LoadingSpinner } from '@/components/shared'

const VariantSchema = z.object({
  size:     z.string().min(1),
  quantity: z.number().int().min(0),
})

const ProductFormSchema = z.object({
  name:          z.string().min(3).max(200),
  description:   z.string().min(20),
  shortDesc:     z.string().max(300).optional(),
  basePrice:     z.number().positive(),
  discountPrice: z.number().positive().optional(),
  gender:        z.enum(['male', 'female', 'kids', 'unisex']),
  categories:    z.array(z.string()).min(1, 'Select at least one category'),
  tags:          z.string().optional(),
  variants:      z.array(VariantSchema).min(1, 'Add at least one size/stock entry'),
  isBlackFriday: z.boolean().default(false),
  status:        z.enum(['active', 'draft']).default('active'),
})
type ProductFormData = z.infer<typeof ProductFormSchema>

interface Props { productId?: string }

export default function ProductForm({ productId }: Props) {
  const router  = useRouter()
  const isEdit  = !!productId
  const [images, setImages] = useState<{ url: string; publicId: string; isPrimary: boolean }[]>([])

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['product-edit', productId],
    queryFn:  () => axios.get(`/api/products/${productId}`).then(r => r.data.data),
    enabled:  isEdit,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => axios.get('/api/categories').then(r => r.data.data),
  })

  const {
    register, control, handleSubmit, reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver:      zodResolver(ProductFormSchema),
    defaultValues: { variants: [{ size: 'Free Size', quantity: 10 }], gender: 'unisex', status: 'active' },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' })

  useEffect(() => {
    if (existing) {
      reset({
        name:          existing.name,
        description:   existing.description,
        shortDesc:     existing.shortDesc,
        basePrice:     existing.basePrice,
        discountPrice: existing.discountPrice,
        gender:        existing.gender,
        categories:    existing.categories?.map((c: any) => String(c._id ?? c)),
        tags:          existing.tags?.join(', '),
        variants:      existing.variants,
        isBlackFriday: existing.isBlackFriday,
        status:        existing.status,
      })
      if (existing.images) setImages(existing.images)
    }
  }, [existing, reset])

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) => {
      const payload = {
        ...data,
        basePrice:     data.basePrice * 100,
        discountPrice: data.discountPrice ? data.discountPrice * 100 : undefined,
        tags:          data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        images,
      }
      return isEdit
        ? axios.patch(`/api/products/${productId}`, payload)
        : axios.post('/api/products', payload)
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Product updated!' : 'Product created!')
      router.push('/dashboard/vendor/products')
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? 'Failed'),
  })

  if (isEdit && loadingExisting) return <LoadingSpinner fullPage />

  const allProductSizes = Object.values(productSizes).flat()

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-6 max-w-2xl">
      {/* Images */}
      <div className="card p-6">
        <label className="input-label text-base mb-3 block">Product Images</label>
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((img, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group">
              <Image src={img.url} alt="" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button type="button" onClick={() => setImages(imgs => imgs.map((im, j) => ({ ...im, isPrimary: j === i })))}
                  className="text-white text-xs font-bold px-1.5 py-0.5 bg-gold-500 rounded">Primary</button>
                <button type="button" onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))}
                  className="text-white"><RiDeleteBin2Line className="w-4 h-4 text-red-400" /></button>
              </div>
              {img.isPrimary && <div className="absolute top-1 left-1 text-xs bg-gold-500 text-gray-950 font-bold px-1 rounded">★</div>}
            </div>
          ))}
          <CldUploadWidget
            uploadPreset={cloudinaryConfig.uploadPreset}
            options={{ folder: 'nexus_market/products', maxFiles: 8, resourceType: 'image' }}
            onSuccess={(res: any) => setImages(prev => [
              ...prev,
              { url: res.info.secure_url, publicId: res.info.public_id, isPrimary: prev.length === 0 },
            ])}
          >
            {({ open }) => (
              <button type="button" onClick={() => open()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-white/20 hover:border-gold-500/50 flex flex-col items-center justify-center text-gray-500 hover:text-gold-400 transition-all text-xs gap-1">
                <RiUploadLine className="w-5 h-5" />
                Upload
              </button>
            )}
          </CldUploadWidget>
        </div>
      </div>

      {/* Basic info */}
      <div className="card p-6 space-y-4">
        <h3 className="font-display font-semibold text-gray-200 mb-1">Product Details</h3>

        <div>
          <label className="input-label">Name <span className="text-red-400">*</span></label>
          <input {...register('name')} type="text" className="input" placeholder="Product name" />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="input-label">Short Description</label>
          <input {...register('shortDesc')} type="text" className="input" placeholder="One-line summary (optional)" />
        </div>

        <div>
          <label className="input-label">Full Description <span className="text-red-400">*</span></label>
          <textarea {...register('description')} rows={5} className="input resize-none" placeholder="Describe the product in detail…" />
          {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Base Price (₦) <span className="text-red-400">*</span></label>
            <input {...register('basePrice', { valueAsNumber: true })} type="number" min="0" step="0.01" className="input" />
            {errors.basePrice && <p className="text-red-400 text-xs mt-1">{errors.basePrice.message}</p>}
          </div>
          <div>
            <label className="input-label">Discount Price (₦)</label>
            <input {...register('discountPrice', { valueAsNumber: true })} type="number" min="0" step="0.01" className="input" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Gender <span className="text-red-400">*</span></label>
            <select {...register('gender')} className="input">
              {productGenders.map(g => <option key={g} value={g} className="capitalize">{g}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Status</label>
            <select {...register('status')} className="input">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div>
          <label className="input-label">Categories <span className="text-red-400">*</span></label>
          <div className="flex flex-wrap gap-2 mt-1">
            {(categories ?? []).map((cat: any) => (
              <label key={cat._id} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  value={cat._id}
                  {...register('categories')}
                  className="accent-yellow-500"
                />
                <span className="text-gray-400 text-sm hover:text-gray-200">{cat.name}</span>
              </label>
            ))}
          </div>
          {errors.categories && <p className="text-red-400 text-xs mt-1">{errors.categories.message}</p>}
        </div>

        <div>
          <label className="input-label">Tags (comma-separated)</label>
          <input {...register('tags')} type="text" className="input" placeholder="shoes, leather, formal" />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input {...register('isBlackFriday')} type="checkbox" className="accent-yellow-500 w-4 h-4" />
          <span className="text-gray-400 text-sm">Mark as Black Friday deal</span>
        </label>
      </div>

      {/* Variants */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-gray-200">Sizes & Stock <span className="text-red-400">*</span></h3>
          <button type="button" onClick={() => append({ size: '', quantity: 0 })} className="btn-secondary text-xs flex items-center gap-1">
            <RiAddLine className="w-3.5 h-3.5" /> Add Size
          </button>
        </div>
        {errors.variants && <p className="text-red-400 text-xs mb-3">{errors.variants.message}</p>}

        <div className="space-y-2">
          {fields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <select {...register(`variants.${i}.size`)} className="input flex-1 text-sm py-2">
                <option value="">Select size…</option>
                {allProductSizes.map((s) => <option key={s} value={s}>{s}</option>)}
                <option value="Free Size">Free Size</option>
                <option value="One Size">One Size</option>
              </select>
              <input
                {...register(`variants.${i}.quantity`, { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="Stock"
                className="input w-24 text-sm py-2"
              />
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(i)} className="text-gray-500 hover:text-red-400 transition-colors px-1">
                  <RiDeleteBin2Line className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 justify-center py-3.5">
          {mutation.isPending ? 'Saving…' : isEdit ? 'Update Product' : 'Publish Product'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary px-6">Cancel</button>
      </div>
    </form>
  )
}
