'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { RiEyeLine, RiEyeOffLine, RiUserLine, RiLockLine, RiArrowRightLine } from 'react-icons/ri'
import { toast } from 'sonner'
import type { Metadata } from 'next'

const LoginSchema = z.object({
  username: z.string().min(3, 'Enter your username'),
  password: z.string().min(1, 'Enter your password'),
})
type LoginForm = z.infer<typeof LoginSchema>

export default function LoginPage() {
  const router            = useRouter()
  const [showPw, setShowPw] = useState(false)
  const [isLoading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(LoginSchema) })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        username: data.username.toLowerCase().trim(),
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Invalid username or password')
        return
      }

      toast.success('Welcome back!')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-700/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2.5 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold">
                <span className="font-display font-black text-gray-950 text-2xl">N</span>
              </div>
            </Link>
            <h1 className="font-display font-bold text-2xl text-gray-100 mt-3">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
          </div>

          {/* Form Card */}
          <div className="card p-8 space-y-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username */}
              <div>
                <label className="input-label">Username</label>
                <div className="relative">
                  <RiUserLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    {...register('username')}
                    type="text"
                    placeholder="your_username"
                    autoComplete="username"
                    className="input pl-11"
                  />
                </div>
                {errors.username && (
                  <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="input-label mb-0">Password</label>
                  <Link
                    href="/forgot-username"
                    className="text-xs text-gold-400 hover:underline font-body"
                  >
                    Forgot username?
                  </Link>
                </div>
                <div className="relative">
                  <RiLockLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    {...register('password')}
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="input pl-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPw ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full justify-center py-3.5 text-base"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  <>Sign In <RiArrowRightLine className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>

          {/* Register links */}
          <div className="text-center mt-6 space-y-3">
            <p className="text-gray-500 text-sm">
              No account?{' '}
              <Link href="/register" className="text-gold-400 hover:underline font-medium">
                Create one
              </Link>
            </p>
            <p className="text-gray-600 text-xs">
              Want to sell?{' '}
              <Link href="/vendor/register" className="text-purple-400 hover:underline">
                Become a vendor
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
