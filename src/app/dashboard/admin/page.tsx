// src/app/dashboard/admin/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  RiUserLine, RiStore2Line, RiShoppingBagLine, RiMoneyDollarCircleLine,
  RiAlertLine, RiMegaphoneLine, RiShieldLine, RiArrowRightLine,
} from 'react-icons/ri'
import { formatCurrency } from '@/lib/utils'

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn:  () => axios.get('/api/analytics/admin').then(r => r.data.data),
  })

  const cards = [
    { label: 'Total Users',    value: stats?.totalUsers?.toLocaleString()   ?? '—', icon: RiUserLine,                color: 'text-blue-400',   bg: 'bg-blue-500/10',   href: '/dashboard/admin/users'    },
    { label: 'Active Vendors', value: stats?.activeVendors?.toLocaleString() ?? '—', icon: RiStore2Line,             color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/dashboard/admin/vendors'  },
    { label: 'Total Orders',   value: stats?.totalOrders?.toLocaleString()   ?? '—', icon: RiShoppingBagLine,        color: 'text-green-400',  bg: 'bg-green-500/10',  href: '/dashboard/admin/orders'   },
    { label: 'Platform Revenue', value: stats ? formatCurrency(stats.platformRevenue ?? 0) : '—', icon: RiMoneyDollarCircleLine, color: 'text-gold-400', bg: 'bg-gold-500/10', href: '/dashboard/admin/analytics' },
    { label: 'Open Reports',   value: stats?.openReports?.toLocaleString()   ?? '—', icon: RiAlertLine,              color: 'text-red-400',    bg: 'bg-red-500/10',    href: '/dashboard/admin/reports'  },
    { label: 'Pending Vendors', value: stats?.pendingVendors?.toLocaleString() ?? '—', icon: RiShieldLine,           color: 'text-yellow-400', bg: 'bg-yellow-500/10', href: '/dashboard/admin/vendors?status=pending' },
  ]

  const quickActions = [
    { href: '/dashboard/admin/vendors?status=pending', icon: RiShieldLine,     label: 'Approve Vendors',    color: 'text-yellow-400' },
    { href: '/dashboard/admin/reports',                icon: RiAlertLine,      label: 'Review Reports',     color: 'text-red-400'    },
    { href: '/dashboard/admin/announcements/new',      icon: RiMegaphoneLine,   label: 'Post Announcement',  color: 'text-gold-400'   },
    { href: '/dashboard/admin/moderation',             icon: RiShieldLine,     label: 'Moderation Queue',   color: 'text-purple-400' },
  ]

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="page-container">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl text-gray-100">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Platform overview and management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {cards.map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link href={card.href} className={`card p-4 block hover:border-white/20 transition-all group`}>
                  <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-2`}>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <p className="text-gray-500 text-xs">{card.label}</p>
                  <p className={`font-display font-bold text-lg mt-0.5 ${isLoading ? 'text-gray-700 animate-pulse' : 'text-gray-100'}`}>
                    {card.value}
                  </p>
                </Link>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick actions */}
          <div className="card p-6">
            <h3 className="font-display font-semibold text-gray-200 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map(action => {
                const Icon = action.icon
                return (
                  <Link key={action.href} href={action.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-all group">
                    <Icon className={`w-4 h-4 ${action.color}`} />
                    <span className="text-sm font-medium">{action.label}</span>
                    <RiArrowRightLine className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div className="lg:col-span-2 card p-6">
            <h3 className="font-display font-semibold text-gray-200 mb-4">Recent Reports</h3>
            {stats?.recentReports?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentReports.slice(0, 5).map((r: any) => (
                  <div key={r._id} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <RiAlertLine className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300 text-sm truncate">{r.reason}</p>
                      <p className="text-gray-600 text-xs">{r.entityType} · {r.status}</p>
                    </div>
                    <Link href={`/dashboard/admin/reports?id=${r._id}`} className="text-gold-400 text-xs hover:underline flex-shrink-0">
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm text-center py-8">No recent reports</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
