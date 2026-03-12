'use client'
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import { RiUploadLine } from 'react-icons/ri'
import { cloudinaryConfig } from '@/config'

export default function ClientProfilePage() {
  const qc = useQueryClient()
  const { data: userData } = useQuery({
    queryKey: ['user-profile'],
    queryFn:  () => axios.get('/api/users/me').then(r => r.data.data),
  })

  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '', bio: '', avatarUrl: '', avatarPublicId: '', isUsernamePublic: true })

  useEffect(() => {
    if (userData) {
      setForm({
        firstName:       userData.profile?.firstName       ?? '',
        lastName:        userData.profile?.lastName        ?? '',
        phoneNumber:     userData.profile?.phoneNumber     ?? '',
        bio:             userData.profile?.bio             ?? '',
        avatarUrl:       userData.profile?.avatarUrl       ?? '',
        avatarPublicId:  userData.profile?.avatarPublicId  ?? '',
        isUsernamePublic: userData.isUsernamePublic ?? true,
      })
    }
  }, [userData])

  const mutation = useMutation({
    mutationFn: () => axios.patch('/api/users/me', form),
    onSuccess:  () => { toast.success('Profile updated!'); qc.invalidateQueries({ queryKey: ['user-profile'] }) },
    onError:    () => toast.error('Update failed'),
  })

  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <h1 className="font-display font-bold text-2xl text-gray-100 mb-8">My Profile</h1>
      <div className="card p-8 max-w-xl space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-purple flex items-center justify-center flex-shrink-0">
            {form.avatarUrl ? (
              <Image src={form.avatarUrl} alt="Avatar" width={80} height={80} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white/40 text-3xl font-black">{userData?.username?.[0]?.toUpperCase() ?? '?'}</span>
            )}
          </div>
          <CldUploadWidget
            uploadPreset={cloudinaryConfig.uploadPreset}
            options={{ folder: 'nexus_market/avatars', maxFiles: 1 }}
            onSuccess={(res: any) => setForm(f => ({ ...f, avatarUrl: res.info.secure_url, avatarPublicId: res.info.public_id }))}
          >
            {({ open }) => (
              <button type="button" onClick={() => open()} className="btn-secondary text-sm">
                <RiUploadLine className="w-4 h-4" /> Change Photo
              </button>
            )}
          </CldUploadWidget>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">First Name</label>
            <input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="input-label">Last Name</label>
            <input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="input" />
          </div>
        </div>
        <div>
          <label className="input-label">Phone</label>
          <input type="tel" value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} className="input" />
        </div>
        <div>
          <label className="input-label">Bio</label>
          <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} className="input resize-none" maxLength={300} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isUsernamePublic} onChange={e => setForm(f => ({ ...f, isUsernamePublic: e.target.checked }))} className="accent-yellow-500 w-4 h-4" />
          <span className="text-gray-400 text-sm">Make my username visible on public reviews</span>
        </label>
        <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary py-3 px-8">
          {mutation.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
