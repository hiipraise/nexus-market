'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LoadingSpinner, StarRating } from '@/components/shared'

const RANGES = ['7d', '30d', '90d', '1y'] as const
type Range = typeof RANGES[number]

const currencyTooltipFormatter = (value: ValueType | undefined, _name: NameType | undefined): [string, string] => {
  const numericValue = typeof value === 'number' ? value : Number(value ?? 0)
  return [formatCurrency(numericValue), 'Revenue']
}

export default function VendorAnalyticsPage() {
  const [range, setRange] = useState<Range>('30d')

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['vendor-analytics', range],
    queryFn:  () => axios.get(`/api/analytics/vendor?range=${range}`).then(r => r.data.data),
  })

  const summary       = analytics?.summary
  const period        = analytics?.period
  const topProducts   = analytics?.topProducts ?? []
  const recentReviews = analytics?.recentReviews ?? []
  const productRevenue = analytics?.productRevenue ?? []

  const tooltipStyle = {
    contentStyle: { background: '#1a0a2e', border: '1px solid rgba(200,139,0,0.2)', borderRadius: 12, color: '#f0e8d6' },
  }

  if (isLoading) return <LoadingSpinner fullPage />

  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-2xl text-gray-100">Analytics</h1>
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${range === r ? 'bg-gold-500 text-gray-950' : 'text-gray-400 hover:text-gray-200'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue',    value: formatCurrency(summary?.totalRevenue ?? 0)          },
          { label: 'Available Balance', value: formatCurrency(summary?.balance ?? 0)               },
          { label: 'Total Orders',     value: (summary?.totalOrders ?? 0).toLocaleString()         },
          { label: 'Avg. Rating',      value: summary?.averageRating ? `${summary.averageRating.toFixed(1)} ★` : 'N/A' },
        ].map(card => (
          <div key={card.label} className="card p-5">
            <p className="text-gray-500 text-xs">{card.label}</p>
            <p className="font-display font-black text-xl text-gold-400 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue over time */}
        <div className="card p-6">
          <h3 className="font-display font-semibold text-gray-200 mb-4">Revenue ({range})</h3>
          <p className="text-gray-500 text-sm mb-4">Total: {formatCurrency(period?.revenue ?? 0)}</p>
          {period?.revenueByDay?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={period.revenueByDay}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" hide tick={{ fill: '#6b7280', fontSize: 10 }} />
                <YAxis hide tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Tooltip {...tooltipStyle} formatter={currencyTooltipFormatter} />
                <Line type="monotone" dataKey="revenue" stroke="#c88b00" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-sm text-center py-12">No revenue data for this period</p>
          )}
        </div>

        {/* Product revenue bar chart */}
        <div className="card p-6">
          <h3 className="font-display font-semibold text-gray-200 mb-4">Top Products by Revenue</h3>
          {productRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={productRevenue.slice(0, 6)} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Tooltip {...tooltipStyle} formatter={currencyTooltipFormatter} />
                <Bar dataKey="revenue" fill="#7a5498" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-sm text-center py-12">No data yet</p>
          )}
        </div>
      </div>

      {/* Top products table */}
      {topProducts.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="font-display font-semibold text-gray-200 mb-4">Product Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500">
                  <th className="text-left pb-3 font-medium">Product</th>
                  <th className="text-right pb-3 font-medium">Views</th>
                  <th className="text-right pb-3 font-medium">Sold</th>
                  <th className="text-right pb-3 font-medium">Searches</th>
                  <th className="text-right pb-3 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p: any) => (
                  <tr key={p._id} className="border-b border-white/5">
                    <td className="py-3 text-gray-300 font-medium truncate max-w-[200px]">{p.name}</td>
                    <td className="py-3 text-right text-gray-400">{p.views?.toLocaleString()}</td>
                    <td className="py-3 text-right text-gray-400">{p.purchases?.toLocaleString()}</td>
                    <td className="py-3 text-right text-gray-400">{p.searches?.toLocaleString()}</td>
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

      {/* Recent reviews */}
      {recentReviews.length > 0 && (
        <div className="card p-6">
          <h3 className="font-display font-semibold text-gray-200 mb-4">Recent Reviews</h3>
          <div className="space-y-4">
            {recentReviews.map((r: any) => (
              <div key={r._id} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-gray-400 text-sm">@{r.userId?.username ?? 'User'}</p>
                  <StarRating value={r.rating} readOnly size="sm" />
                </div>
                {r.title && <p className="text-gray-200 text-sm font-medium">{r.title}</p>}
                <p className="text-gray-500 text-sm mt-0.5">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
