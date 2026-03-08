'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { motion } from 'framer-motion'
import { CldUploadWidget } from 'next-cloudinary'
import {
  RiShieldCheckLine, RiUploadLine, RiCheckLine,
  RiAlertLine, RiLoader4Line,
} from 'react-icons/ri'
import { toast } from 'sonner'
import Image from 'next/image'
import { cloudinaryConfig } from '@/config'

export default function VendorVerificationPage() {
  const [profilePic,        setProfilePic]        = useState('')
  const [profilePicPublicId, setProfilePicPublicId] = useState('')
  const [description,       setDescription]       = useState('')

  const { data: vendorData, refetch } = useQuery({
    queryKey: ['vendor-profile'],
    queryFn:  () => axios.get('/api/vendors/me').then(r => r.data.data),
  })

  const submitMutation = useMutation({
    mutationFn: () => axios.post('/api/vendors/verify', { profilePic, profilePicPublicId, description }),
    onSuccess:  () => { toast.success('Verification submitted!'); refetch() },
    onError:    (e: any) => toast.error(e.response?.data?.error ?? 'Submission failed'),
  })

  const status = vendorData?.status

  if (status === 'verified') {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card p-12 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto mb-4">
            <RiShieldCheckLine className="w-10 h-10 text-gold-400" />
          </div>
          <h2 className="font-display font-bold text-2xl text-gray-100 mb-2">You're Verified!</h2>
          <p className="text-gray-400">Your vendor account is verified. You can upload products, run ads, and create discounts.</p>
          <div className="badge-verified inline-flex mt-4 px-4 py-2">
            <RiShieldCheckLine className="w-4 h-4" />
            Verified Vendor
          </div>
        </motion.div>
      </div>
    )
  }

  const isSubmitted = vendorData?.verificationSubmittedAt && status === 'pending'

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="page-container max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="font-display font-bold text-2xl text-gray-100 mb-1">Vendor Verification</h1>
            <p className="text-gray-500 text-sm">Complete verification to start selling on the platform</p>
          </div>

          {isSubmitted ? (
            <div className="card p-8 text-center">
              <RiLoader4Line className="w-12 h-12 text-gold-400 mx-auto mb-4 animate-spin" />
              <h3 className="font-display font-semibold text-xl text-gray-100 mb-2">Under Review</h3>
              <p className="text-gray-400">Your verification is being reviewed by our team. You'll be notified once it's complete.</p>
            </div>
          ) : (
            <div className="card p-8 space-y-6">
              {/* Profile picture */}
              <div>
                <label className="input-label text-base mb-3 block">Profile Picture <span className="text-red-400">*</span></label>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    {profilePic ? (
                      <Image src={profilePic} alt="Profile" width={96} height={96} className="w-full h-full object-cover" />
                    ) : (
                      <RiUploadLine className="w-8 h-8 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <CldUploadWidget
                      uploadPreset={cloudinaryConfig.uploadPreset}
                      options={{ folder: 'nexus_market/vendors', maxFiles: 1, resourceType: 'image' }}
                      onSuccess={(result: any) => {
                        setProfilePic(result.info.secure_url)
                        setProfilePicPublicId(result.info.public_id)
                        toast.success('Image uploaded!')
                      }}
                    >
                      {({ open }) => (
                        <button type="button" onClick={() => open()} className="btn-secondary text-sm">
                          <RiUploadLine className="w-4 h-4" />
                          Upload Photo
                        </button>
                      )}
                    </CldUploadWidget>
                    <p className="text-gray-600 text-xs mt-2">JPG, PNG. Max 5MB.</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="input-label text-base mb-1 block">
                  About Your Business <span className="text-red-400">*</span>
                </label>
                <p className="text-gray-500 text-xs mb-3">
                  Tell us about your products, experience, and what makes your store unique. Min 50 characters.
                </p>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Describe your business, the types of products you sell, and why customers should shop with you..."
                  className="input resize-none"
                />
                <p className="text-gray-600 text-xs mt-1 text-right">{description.length}/2000</p>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex gap-2">
                  <RiAlertLine className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-purple-300">
                    <p className="font-medium mb-1">Before you submit</p>
                    <ul className="text-purple-400 space-y-0.5 text-xs">
                      <li>• Upload a clear, professional profile photo</li>
                      <li>• Provide accurate information about your business</li>
                      <li>• Review takes 24–48 hours</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => submitMutation.mutate()}
                disabled={!profilePic || description.length < 50 || submitMutation.isPending}
                className="btn-primary w-full justify-center py-3.5"
              >
                {submitMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Submitting…
                  </span>
                ) : (
                  <><RiCheckLine className="w-4 h-4" /> Submit for Verification</>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
