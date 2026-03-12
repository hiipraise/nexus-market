'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { RiAddLine } from 'react-icons/ri'
import { Modal, LoadingSpinner, StatusBadge } from '@/components/shared'
import { CldUploadWidget } from 'next-cloudinary'
import { cloudinaryConfig } from '@/config'
import { formatDate } from '@/lib/utils'

export default function VendorAdsPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ type: 'banner', title: '', imageUrl: '', imagePublicId: '', linkUrl: '', startsAt: '', endsAt: '' })

  const { data: ads, isLoading } = useQuery({
    queryKey: ['vendor-ads'],
    queryFn:  () => axios.get('/api/ads').then(r => r.data.data),
  })

  const createMutation = useMutation({
    mutationFn: () => axios.post('/api/ads', form),
    onSuccess:  () => { toast.success('Ad created!'); qc.invalidateQueries({ queryKey: ['vendor-ads'] }); setOpen(false) },
    onError: (e: any) => toast.error(e.response?.data?.error ?? 'Failed'),
  })

  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-2xl text-gray-100">Ads</h1>
        <button onClick={() => setOpen(true)} className="btn-primary text-sm"><RiAddLine className="w-4 h-4" /> Create Ad</button>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {(ads ?? []).length === 0 && <div className="card p-12 text-center text-gray-500">No ads yet. Create one to promote your products.</div>}
          {(ads ?? []).map((ad: any) => (
            <div key={ad._id} className="card p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-gray-200 font-medium">{ad.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{ad.type} · {formatDate(ad.startsAt)} – {formatDate(ad.endsAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-gray-500 text-xs">{ad.clicks ?? 0} clicks</p>
                <StatusBadge status={ad.isActive ? 'active' : 'inactive'} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Create Ad" size="md">
        <div className="space-y-4">
          <div>
            <label className="input-label">Ad Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input">
              <option value="banner">Banner</option>
              <option value="carousel">Carousel</option>
              <option value="featured">Featured</option>
            </select>
          </div>
          <div>
            <label className="input-label">Title</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="input-label">Image</label>
            {form.imageUrl && <img src={form.imageUrl} alt="" className="w-full h-32 object-cover rounded-xl mb-2" />}
            <CldUploadWidget
              uploadPreset={cloudinaryConfig.uploadPreset}
              options={{ folder: 'nexus_market/ads', maxFiles: 1 }}
              onSuccess={(res: any) => setForm(f => ({ ...f, imageUrl: res.info.secure_url, imagePublicId: res.info.public_id }))}
            >
              {({ open: o }) => <button type="button" onClick={() => o()} className="btn-secondary text-sm w-full">Upload Image</button>}
            </CldUploadWidget>
          </div>
          <div>
            <label className="input-label">Link URL (optional)</label>
            <input type="url" value={form.linkUrl} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))} className="input" placeholder="https://…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Starts At</label>
              <input type="datetime-local" value={form.startsAt} onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="input-label">Ends At</label>
              <input type="datetime-local" value={form.endsAt} onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))} className="input" />
            </div>
          </div>
          <button onClick={() => createMutation.mutate()} disabled={!form.title || !form.imageUrl || !form.startsAt || !form.endsAt || createMutation.isPending} className="btn-primary w-full justify-center py-3 disabled:opacity-50">
            {createMutation.isPending ? 'Creating…' : 'Create Ad'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
