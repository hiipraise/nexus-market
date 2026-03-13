'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { RiArrowRightLine, RiShieldCheckLine, RiFlashlightLine } from 'react-icons/ri'

const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-purple-700/20 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-gold-500/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[160px]" />

        {/* Geometric grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(200,139,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,139,0,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="page-container relative z-10 py-20">
        <div className="max-w-4xl">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Tag line */}
            <motion.div variants={item} className="inline-flex items-center gap-2 mb-8">
              <span className="badge-new px-3 py-1.5 text-xs font-semibold">
                <RiFlashlightLine className="w-3.5 h-3.5" />
                New vendors weekly
              </span>
              <span className="text-gray-500 text-sm">·</span>
              {/* <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                <RiShieldCheckLine className="w-4 h-4 text-gold-400" />
                Paystack-secured payments
              </span> */}
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={item}
              className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.95] mb-6"
            >
              <span className="text-gray-100 block">The market</span>
              <span className="text-gradient-gold block">that never</span>
              <span className="text-gray-100 block">sleeps.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={item}
              className="text-gray-400 text-lg sm:text-xl font-body max-w-xl leading-relaxed mb-10"
            >
              Shop thousands of products from verified vendors — fashion, accessories, and more. Delivered to your door.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="flex flex-wrap gap-4">
              <Link href="/products" className="btn-primary text-base px-8 py-4">
                Shop Now
                <RiArrowRightLine className="w-5 h-5" />
              </Link>
              <Link href="/vendor/register" className="btn-secondary text-base px-8 py-4">
                Become a Vendor
              </Link>
            </motion.div>

            {/* Stats */}
            {/* <motion.div
              variants={item}
              className="flex flex-wrap gap-8 mt-16"
            >
              {[
                { value: '10K+',   label: 'Products'        },
                { value: '500+',   label: 'Verified Vendors' },
                { value: '50K+',   label: 'Happy Customers'  },
                { value: '4.9★',   label: 'Average Rating'   },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="font-display font-black text-2xl text-gold-400">{stat.value}</div>
                  <div className="text-gray-500 text-sm font-body mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div> */}
          </motion.div>
        </div>

        {/* Floating product cards (decorative) */}
        <div className="hidden xl:block absolute right-0 top-1/2 -translate-y-1/2 w-[480px]">
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Mock product cards */}
            <div className="card p-4 w-64 absolute top-0 right-16 rotate-3 shadow-gold">
              <div className="w-full h-36 rounded-lg bg-gradient-to-br from-purple-800/50 to-gold-700/30 mb-3" />
              <div className="h-3 rounded bg-white/10 w-3/4 mb-2" />
              <div className="h-3 rounded bg-white/5 w-1/2 mb-3" />
              <div className="flex items-center justify-between">
                <div className="h-4 rounded bg-gold-500/40 w-16" />
                <div className="badge-discount">-20%</div>
              </div>
            </div>
            <div className="card p-4 w-64 absolute top-24 right-0 -rotate-2 shadow-purple">
              <div className="w-full h-36 rounded-lg bg-gradient-to-br from-gold-700/30 to-purple-800/50 mb-3" />
              <div className="h-3 rounded bg-white/10 w-2/3 mb-2" />
              <div className="h-3 rounded bg-white/5 w-1/3 mb-3" />
              <div className="badge-verified">
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M5 9l-3-3 1.4-1.4L5 6.2l4.6-4.6L11 3z"/>
                </svg>
                Verified Vendor
              </div>
            </div>
            <div className="card p-4 w-52 absolute top-52 right-20 rotate-1">
              <div className="w-full h-28 rounded-lg bg-gradient-to-br from-purple-600/30 to-gold-500/20 mb-3" />
              <div className="h-3 rounded bg-white/10 w-3/5 mb-2" />
              <div className="badge-black-friday">
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 1l1.5 3 3.3.5-2.4 2.3.6 3.3L6 8.6 3 10.1l.6-3.3L1.2 4.5l3.3-.5z"/>
                </svg>
                Black Friday
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="text-gray-600 text-xs font-body">Scroll to explore</span>
        <motion.div
          className="w-5 h-8 rounded-full border border-gold-500/30 flex items-start justify-center pt-1.5"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-1 h-2 rounded-full bg-gold-400" />
        </motion.div>
      </motion.div>
    </section>
  )
}
