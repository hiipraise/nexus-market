'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  RiMoneyDollarCircleLine, RiShoppingBagLine, RiStarLine,
  RiStore2Line, RiShieldCheckLine, RiAlertLine, RiArrowRightLine,
  RiTrophyLine, RiUploadLine,
} from 'react-icons/ri'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function VendorDashboardClient() {
  const { data: session } = useSession()

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['vendor-analytics', '30d'],
    queryFn:  () => axios.get('/api/analytics/vendor?range=30d').then(r => r.data.data),
  })

  const { data: vendorData } = useQuery({
    queryKey: ['vendor-profile'],
    queryFn:  () => axios.get('/api/vendors/me').then(r => r.data.data),
  })

  const summary = analytics?.summary
  const period  = analytics?.period

  const statCards = [
    { label: 'Total Revenue',  value: summary ? formatCurrency(summary.totalRevenue) : '—', icon: RiMoneyDollarCircleLine, color: 'text-gold-400',   bg: 'bg-gold-500/10',   border: 'border-gold-500/20'   },
    { label: 'Available Balance', value: summary ? formatCurrency(summary.balance)    : '—', icon: RiStore2Line,            color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20'  },
    { label: 'Total Orders',   value: summary?.totalOrders?.toLocaleString() ?? '—',          icon: RiShoppingBagLine,       color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20'   },
    { label: 'Avg. Rating',    value: summary ? `${summary.averageRating?.toFixed(1)} ★` : '—', icon: RiStarLine,            color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  ]

  if (vendorData?.status === 'pending') {
    return (
      <div className="min-h-screen pt-28 pb-16">
        <div className="page-container max-w-2xl">
          <div className="card p-10 text-center">
            <RiAlertLine className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="font-display font-bold text-2xl text-gray-100 mb-2">Verification Pending</h2>
            <p className="text-gray-400 mb-6">
              Your vendor account is pending review. Complete your verification to start listing products.
            </p>
            <Link href="/dashboard/vendor/verification" className="btn-primary">
              Submit Verification
              <RiArrowRightLine className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display font-bold text-2xl text-gray-100">
                Welcome, {session?.user.username}
              </h1>
              {vendorData?.badge && (
                <span className="badge-verified">
                  <RiShieldCheckLine className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-gray-500 font-body text-sm">Your vendor dashboard</p>
          </div>
          <Link href="/dashboard/vendor/products/new" className="btn-primary">
            <RiUploadLine className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`card p-5 border ${card.border}`}
              >
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className="text-gray-500 text-xs font-body">{card.label}</p>
                <p className={`font-display font-bold text-xl mt-1 ${isLoading ? 'animate-pulse text-gray-700' : 'text-gray-100'}`}>
                  {isLoading ? '———' : card.value}
                </p>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue chart */}
          <div className="lg:col-span-2 card p-6">
            <h3 className="font-display font-semibold text-gray-200 mb-1">Revenue (Last 30 Days)</h3>
            <p className="text-gray-500 text-sm mb-4 font-body">
              {period ? formatCurrency(period.revenue) : '—'} earned this period
            </p>
            {period?.revenueByDay && period.revenueByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={period.revenueByDay}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: '#1a0a2e', border: '1px solid rgba(200,139,0,0.2)', borderRadius: 12, color: '#f0e8d6' }}
                    formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#c88b00" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-600 text-sm">No revenue data yet</p>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="card p-6">
            <h3 className="font-display font-semibold text-gray-200 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { href: '/dashboard/vendor/products',   icon: RiStore2Line,          label: 'Manage Products'  },
                { href: '/dashboard/vendor/orders',     icon: RiShoppingBagLine,     label: 'View Orders'      },
                { href: '/dashboard/vendor/analytics',  icon: RiTrophyLine,          label: 'Full Analytics'   },
                { href: '/dashboard/vendor/ads',        icon: RiUploadLine,          label: 'Run Ads'          },
                { href: '/dashboard/vendor/payouts',    icon: RiMoneyDollarCircleLine, label: 'Request Payout' },
                { href: '/dashboard/vendor/chat',       icon: RiStarLine,            label: 'Customer Chats'   },
              ].map(action => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-gold-300 transition-all group"
                  >
                    <Icon className="w-4 h-4 group-hover:text-gold-400" />
                    <span className="text-sm font-medium">{action.label}</span>
                    <RiArrowRightLine className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top products */}
        {analytics?.topProducts && analytics.topProducts.length > 0 && (
          <div className="card p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-gray-200">Top Products</h3>
              <Link href="/dashboard/vendor/products" className="text-gold-400 text-sm hover:underline">View all</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-white/10">
                    <th className="text-left pb-3 font-medium">Product</th>
                    <th className="text-right pb-3 font-medium">Views</th>
                    <th className="text-right pb-3 font-medium">Sold</th>
                    <th className="text-right pb-3 font-medium">Rating</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {analytics.topProducts.slice(0, 5).map((p: any) => (
                    <tr key={p._id} className="border-b border-white/5 hover:bg-white/2">
                      <td className="py-3 text-gray-300 font-medium truncate max-w-[200px]">{p.name}</td>
                      <td className="py-3 text-right text-gray-400">{p.views?.toLocaleString()}</td>
                      <td className="py-3 text-right text-gray-400">{p.purchases?.toLocaleString()}</td>
                      <td className="py-3 text-right text-gold-400">
                        {p.ratings?.count > 0 ? `${p.ratings.average.toFixed(1)} ★` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
