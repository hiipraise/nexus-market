'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import { RiUploadLine } from 'react-icons/ri'
import { cloudinaryConfig } from '@/config'
import { useVendorProfile } from '@/hooks'

export default function VendorSettingsPage() {
  const qc = useQueryClient()
  const { data: vendorData } = useVendorProfile()
  const vendor = (vendorData as any)?.data

  const [form, setForm] = useState({
    businessName:  '',
    description:   '',
    phone:         '',
    whatsapp:      '',
    profilePic:    '',
    profilePicPub: '',
  })

  useEffect(() => {
    if (vendor) {
      setForm({
        businessName:  vendor.businessName  ?? '',
        description:   vendor.description   ?? '',
        phone:         vendor.phone         ?? '',
        whatsapp:      vendor.whatsapp      ?? '',
        profilePic:    vendor.profilePic    ?? '',
        profilePicPub: vendor.profilePicPublicId ?? '',
      })
    }
  }, [vendor])

  const mutation = useMutation({
    mutationFn: () => axios.patch('/api/vendors/me', {
      businessName:        form.businessName,
      description:         form.description,
      phone:               form.phone,
      whatsapp:            form.whatsapp,
      profilePic:          form.profilePic,
      profilePicPublicId:  form.profilePicPub,
    }),
    onSuccess: () => {
      toast.success('Profile updated!')
      qc.invalidateQueries({ queryKey: ['vendor-profile'] })
    },
    onError: () => toast.error('Update failed'),
  })

  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <h1 className="font-display font-bold text-2xl text-gray-100 mb-8">Store Settings</h1>

      <div className="card p-8 max-w-2xl space-y-6">
        {/* Profile picture */}
        <div>
          <label className="input-label mb-3 block">Store Profile Picture</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-purple flex items-center justify-center flex-shrink-0">
              {form.profilePic ? (
                <Image src={form.profilePic} alt="Profile" width={80} height={80} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white/40 text-3xl font-black">{form.businessName?.[0] ?? '?'}</span>
              )}
            </div>
            <CldUploadWidget
              uploadPreset={cloudinaryConfig.uploadPreset}
              options={{ folder: 'nexus_market/vendors', maxFiles: 1 }}
              onSuccess={(res: any) => {
                setForm(f => ({ ...f, profilePic: res.info.secure_url, profilePicPub: res.info.public_id }))
                toast.success('Image uploaded')
              }}
            >
              {({ open }) => (
                <button type="button" onClick={() => open()} className="btn-secondary text-sm">
                  <RiUploadLine className="w-4 h-4" /> Change Photo
                </button>
              )}
            </CldUploadWidget>
          </div>
        </div>

        <div>
          <label className="input-label">Business Name</label>
          <input type="text" value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} className="input" />
        </div>

        <div>
          <label className="input-label">About Your Business</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} className="input resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Phone</label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="input-label">WhatsApp</label>
            <input type="tel" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} className="input" />
          </div>
        </div>

        <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary py-3 px-8">
          {mutation.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
