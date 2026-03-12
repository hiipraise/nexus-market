'use client'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import Link from 'next/link'
import { RiShoppingBagLine, RiHeartLine, RiMessage2Line, RiUserLine, RiArrowRightLine } from 'react-icons/ri'
import { StatusBadge, LoadingSpinner } from '@/components/shared'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function ClientDashboardPage() {
  const { data: session } = useSession()

  const { data: ordersData } = useQuery({
    queryKey: ['client-orders-recent'],
    queryFn:  () => axios.get('/api/orders?limit=5').then(r => r.data),
  })

  const recentOrders = ordersData?.data ?? []

  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-gray-100">Welcome, @{session?.user.username} 👋</h1>
        <p className="text-gray-500 text-sm mt-0.5">Your shopping dashboard</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { href: '/dashboard/client/orders',   icon: RiShoppingBagLine, label: 'Orders'   },
          { href: '/dashboard/client/wishlist', icon: RiHeartLine,       label: 'Wishlist'  },
          { href: '/dashboard/client/chat',     icon: RiMessage2Line,    label: 'Messages'  },
          { href: '/dashboard/client/profile',  icon: RiUserLine,        label: 'Profile'   },
        ].map(item => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className="card p-5 flex flex-col items-center gap-2 hover:border-gold-500/30 transition-all group">
              <Icon className="w-6 h-6 text-gold-400" />
              <span className="text-gray-300 text-sm font-medium group-hover:text-gold-300 transition-colors">{item.label}</span>
            </Link>
          )
        })}
      </div>

      {recentOrders.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-gray-200">Recent Orders</h2>
            <Link href="/dashboard/client/orders" className="text-gold-400 text-sm hover:underline flex items-center gap-1">
              View all <RiArrowRightLine className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order: any) => (
              <Link key={order._id} href={`/orders/${order._id}`} className="flex items-center justify-between p-3 bg-white/3 rounded-xl hover:bg-white/6 transition-all group">
                <div>
                  <p className="font-mono text-gold-400 text-xs font-bold">#{order.orderNumber}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.orderStatus} />
                  <span className="font-display font-bold text-gray-200 text-sm">{formatCurrency(order.totalAmount)}</span>
                  <RiArrowRightLine className="w-3.5 h-3.5 text-gray-600 group-hover:text-gold-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
