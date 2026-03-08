'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { RiMailLine, RiArrowRightLine, RiUserLine, RiCheckLine } from 'react-icons/ri'
import { toast } from 'sonner'
import axios from 'axios'

export default function ForgotUsernamePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [recoveredUsername, setRecoveredUsername] = useState('')
  const [isLoading, setLoading] = useState(false)

  const handleGetQuestion = async () => {
    if (!email) { toast.error('Enter your email'); return }
    setLoading(true)
    try {
      const res = await axios.get(`/api/auth/forgot-username?email=${encodeURIComponent(email)}`)
      if (res.data.data?.question) {
        setQuestion(res.data.data.question)
        setStep(2)
      } else {
        toast.error('No account found with that email')
      }
    } catch {
      toast.error('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!answer) { toast.error('Enter your answer'); return }
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/forgot-username', { email, answer })
      setRecoveredUsername(res.data.data.username)
      setStep(3)
    } catch {
      toast.error('Incorrect answer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-purple-700/15 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="w-12 h-12 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold mb-3">
              <span className="font-display font-black text-gray-950 text-2xl">N</span>
            </Link>
            <h1 className="font-display font-bold text-2xl text-gray-100">Recover your username</h1>
            <p className="text-gray-500 text-sm mt-1">
              {step === 1 && 'Enter your email to get started'}
              {step === 2 && 'Answer your security question'}
              {step === 3 && 'Username recovered!'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className={`flex items-center gap-2 ${s < 3 ? '' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${step === s ? 'bg-gold-500 text-gray-950' :
                    step > s  ? 'bg-green-500 text-white' :
                    'bg-white/10 text-gray-500'}`}>
                  {step > s ? <RiCheckLine className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-green-500' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>

          <div className="card p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <label className="input-label">Email Address</label>
                    <div className="relative">
                      <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleGetQuestion()}
                        placeholder="you@example.com"
                        className="input pl-11"
                      />
                    </div>
                  </div>
                  <button onClick={handleGetQuestion} disabled={isLoading} className="btn-primary w-full justify-center py-3">
                    {isLoading ? 'Looking up…' : <>Continue <RiArrowRightLine className="w-4 h-4" /></>}
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                    <p className="text-gray-300 text-sm font-body">{question}</p>
                  </div>
                  <div>
                    <label className="input-label">Your Answer</label>
                    <input
                      type="text"
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmitAnswer()}
                      placeholder="Your answer"
                      className="input"
                    />
                  </div>
                  <button onClick={handleSubmitAnswer} disabled={isLoading} className="btn-primary w-full justify-center py-3">
                    {isLoading ? 'Verifying…' : <>Verify Answer <RiArrowRightLine className="w-4 h-4" /></>}
                  </button>
                  <button onClick={() => setStep(1)} className="btn-ghost w-full justify-center text-sm">Back</button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto">
                    <RiCheckLine className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Your username is:</p>
                    <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-4 flex items-center justify-center gap-2">
                      <RiUserLine className="w-5 h-5 text-gold-400" />
                      <span className="font-display font-bold text-xl text-gold-400">@{recoveredUsername}</span>
                    </div>
                  </div>
                  <Link href="/login" className="btn-primary w-full justify-center py-3 inline-flex">
                    Sign In Now
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-center text-gray-600 text-sm mt-6">
            Remember it?{' '}
            <Link href="/login" className="text-gold-400 hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
