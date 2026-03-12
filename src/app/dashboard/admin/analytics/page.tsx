'use client'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { LoadingSpinner } from '@/components/shared'

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn:  () => axios.get('/api/analytics/admin').then(r => r.data.data),
  })

  if (isLoading) return <LoadingSpinner fullPage />

  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <h1 className="font-display font-bold text-2xl text-gray-100 mb-8">Platform Analytics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users',      value: stats?.totalUsers?.toLocaleString() },
          { label: 'Active Vendors',   value: stats?.activeVendors?.toLocaleString() },
          { label: 'Total Orders',     value: stats?.totalOrders?.toLocaleString() },
          { label: 'Platform Revenue', value: formatCurrency(stats?.platformRevenue ?? 0) },
        ].map(c => (
          <div key={c.label} className="card p-5">
            <p className="text-gray-500 text-xs">{c.label}</p>
            <p className="font-display font-black text-2xl text-gold-400 mt-1">{c.value ?? '—'}</p>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <p className="text-gray-400 text-sm text-center py-12">Detailed time-series charts available via database analytics integration.</p>
      </div>
    </div>
  )
}
