// src/app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { RiEyeLine, RiEyeOffLine, RiUserLine, RiMailLine, RiLockLine } from 'react-icons/ri'
import { toast } from 'sonner'
import axios from 'axios'
import { secretQuestions } from '@/config'

const RegisterSchema = z.object({
  username:       z.string().min(3, 'Min 3 chars').max(30).regex(/^[a-z0-9_]+$/i, 'Letters, numbers, underscores only'),
  email:          z.string().email('Enter a valid email'),
  password:       z.string().min(8, 'Min 8 characters'),
  secretQuestion: z.enum(secretQuestions as unknown as [string, ...string[]], {
  required_error: 'Choose a question'
}),
  secretAnswer:   z.string().min(1, 'Answer is required'),
})
type RegisterForm = z.infer<typeof RegisterSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPw, setShowPw] = useState(false)
  const [isLoading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    try {
      await axios.post('/api/auth/register', data)
      toast.success('Account created! Please sign in.')
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
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-gold-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-purple-700/15 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="w-12 h-12 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold mb-3">
              <span className="font-display font-black text-gray-950 text-2xl">N</span>
            </Link>
            <h1 className="font-display font-bold text-2xl text-gray-100">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Start shopping in minutes</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="input-label">Username <span className="text-red-400">*</span></label>
                <div className="relative">
                  <RiUserLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input {...register('username')} type="text" placeholder="your_username" className="input pl-11" />
                </div>
                {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
                <p className="text-gray-600 text-xs mt-1">Letters, numbers, underscores. No spaces.</p>
              </div>

              <div>
                <label className="input-label">Email <span className="text-red-400">*</span></label>
                <div className="relative">
                  <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input {...register('email')} type="email" placeholder="you@example.com" className="input pl-11" />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
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

              <div className="border-t border-white/10 pt-5">
                <p className="text-gray-400 text-sm font-body mb-4">Security question for username recovery</p>
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
                    <input {...register('secretAnswer')} type="text" placeholder="Your answer (case-insensitive)" className="input" />
                    {errors.secretAnswer && <p className="text-red-400 text-xs mt-1">{errors.secretAnswer.message}</p>}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3.5 text-base mt-2">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Creating account…
                  </span>
                ) : 'Create Account'}
              </button>
            </form>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-gold-400 hover:underline font-medium">Sign in</Link>
          </p>
          <p className="text-center text-gray-600 text-xs mt-2">
            Want to sell?{' '}
            <Link href="/vendor/register" className="text-purple-400 hover:underline">Become a vendor</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
