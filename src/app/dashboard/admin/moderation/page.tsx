'use client'
import Link from 'next/link'
import { RiAlertLine, RiShieldLine, RiArrowRightLine } from 'react-icons/ri'

export default function AdminModerationPage() {
  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <h1 className="font-display font-bold text-2xl text-gray-100 mb-8">Moderation</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        {[
          { href: '/dashboard/admin/reports', icon: RiAlertLine, label: 'Open Reports', desc: 'Review and resolve user reports', color: 'text-red-400' },
          { href: '/dashboard/admin/vendors?status=pending', icon: RiShieldLine, label: 'Pending Verifications', desc: 'Approve or reject vendor applications', color: 'text-yellow-400' },
        ].map(item => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className="card p-6 hover:border-gold-500/30 transition-all group">
              <Icon className={`w-8 h-8 ${item.color} mb-3`} />
              <h3 className="font-display font-bold text-gray-200 group-hover:text-gold-300 transition-colors">{item.label}</h3>
              <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
              <RiArrowRightLine className="w-4 h-4 text-gray-600 group-hover:text-gold-400 mt-3 transition-colors" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
