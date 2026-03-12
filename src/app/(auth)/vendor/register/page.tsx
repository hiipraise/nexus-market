'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  RiEyeLine, RiEyeOffLine, RiUserLine, RiMailLine, RiLockLine,
  RiPhoneLine, RiStore2Line, RiWhatsappLine,
} from 'react-icons/ri'
import { toast } from 'sonner'
import axios from 'axios'
import { secretQuestions } from '@/config'

const VendorRegisterSchema = z.object({
  username:         z.string().min(3).max(30).regex(/^[a-z0-9_]+$/i, 'Letters, numbers, underscores only'),
  email:            z.string().email('Valid email required'),
  password:         z.string().min(8, 'Min 8 characters'),
  phone:            z.string().min(10, 'Valid phone required'),
  sameWhatsapp:     z.boolean().default(true),
  whatsapp:         z.string().optional(),
  businessName:     z.string().min(2, 'Business name required'),
  description:      z.string().min(20, 'At least 20 characters describing your business'),
  secretQuestion: z.enum([...secretQuestions], {
  required_error: 'Choose a question',
}),
  secretAnswer:     z.string().min(1, 'Answer required'),
})
type VendorRegisterForm = z.infer<typeof VendorRegisterSchema>

export default function VendorRegisterPage() {
  const router = useRouter()
  const [showPw, setShowPw] = useState(false)
  const [isLoading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<VendorRegisterForm>({
    resolver: zodResolver(VendorRegisterSchema),
    defaultValues: { sameWhatsapp: true },
  })

  const sameWhatsapp = watch('sameWhatsapp')

  const onSubmit = async (data: VendorRegisterForm) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        whatsapp: data.sameWhatsapp ? data.phone : data.whatsapp,
      }
      await axios.post('/api/auth/vendor-register', payload)
      toast.success('Vendor account created! Please sign in and submit for verification.')
      router.push('/login')
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-20">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-700/20 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-xl px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-purple flex items-center justify-center shadow-purple mb-3">
              <RiStore2Line className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl text-gray-100">Start selling today</h1>
            <p className="text-gray-500 text-sm mt-1">Create your vendor account</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="input-label">Username <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <RiUserLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input {...register('username')} type="text" placeholder="vendor_handle" className="input pl-11" />
                  </div>
                  {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
                </div>

                <div>
                  <label className="input-label">Business Name <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <RiStore2Line className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input {...register('businessName')} type="text" placeholder="Your Store Name" className="input pl-11" />
                  </div>
                  {errors.businessName && <p className="text-red-400 text-xs mt-1">{errors.businessName.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="input-label">Email <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input {...register('email')} type="email" placeholder="store@example.com" className="input pl-11" />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="input-label">Phone Number <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <RiPhoneLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input {...register('phone')} type="tel" placeholder="+234 800 000 0000" className="input pl-11" />
                  </div>
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="input-label">WhatsApp</label>
                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <input
                      {...register('sameWhatsapp')}
                      type="checkbox"
                      id="sameWa"
                      className="w-4 h-4 accent-yellow-500"
                    />
                    <label htmlFor="sameWa" className="text-gray-400 text-sm cursor-pointer">Same as phone</label>
                  </div>
                  {!sameWhatsapp && (
                    <div className="relative">
                      <RiWhatsappLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input {...register('whatsapp')} type="tel" placeholder="WhatsApp number" className="input pl-11" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="input-label">Password <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <RiLockLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      {...register('password')}
                      type={showPw ? 'text' : 'password'}
                      placeholder="Min 8 characters"
                      className="input pl-11 pr-11"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPw ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="input-label">Business Description <span className="text-red-400">*</span></label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    placeholder="Tell customers about your products and business…"
                    className="input resize-none"
                  />
                  {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
                </div>
              </div>

              <div className="border-t border-white/10 pt-5">
                <p className="text-gray-400 text-sm mb-4">Security question for username recovery</p>
                <div className="space-y-4">
                  <div>
                    <label className="input-label">Security Question <span className="text-red-400">*</span></label>
                    <select {...register('secretQuestion')} className="input">
                      <option value="">Select a question…</option>
                      {secretQuestions.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                    {errors.secretQuestion && <p className="text-red-400 text-xs mt-1">{errors.secretQuestion.message}</p>}
                  </div>
                  <div>
                    <label className="input-label">Your Answer <span className="text-red-400">*</span></label>
                    <input {...register('secretAnswer')} type="text" placeholder="Your answer" className="input" />
                    {errors.secretAnswer && <p className="text-red-400 text-xs mt-1">{errors.secretAnswer.message}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-gold-500/10 border border-gold-500/20 rounded-xl p-4 text-sm text-gold-300">
                After registering, you must submit a verification request from your dashboard before you can list products.
              </div>

              <button type="submit" disabled={isLoading} className="btn-purple w-full justify-center py-3.5 text-base">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Creating account…
                  </span>
                ) : 'Create Vendor Account'}
              </button>
            </form>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-gold-400 hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
