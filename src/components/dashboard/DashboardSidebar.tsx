// src/components/dashboard/DashboardSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiDashboardLine, RiStore2Line, RiShoppingBagLine, RiBarChart2Line,
  RiMegaphoneLine, RiPercentLine, RiMoneyDollarCircleLine, RiSettings3Line,
  RiMessage2Line, RiShieldCheckLine, RiUserLine, RiAlertLine, RiGroup2Line, RiHeartLine, RiLogoutBoxLine,
  RiArrowLeftLine, RiArrowRightLine,
} from 'react-icons/ri'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import type { UserRole } from '@/types'

interface NavItem {
  href:  string
  label: string
  icon:  React.ElementType
}

const navByRole: Record<UserRole, NavItem[]> = {
  client: [
    { href: '/dashboard/client',          label: 'Overview',  icon: RiDashboardLine        },
    { href: '/dashboard/client/orders',   label: 'My Orders', icon: RiShoppingBagLine      },
    { href: '/dashboard/client/profile',  label: 'Profile',   icon: RiUserLine             },
    { href: '/dashboard/client/wishlist', label: 'Wishlist',  icon: RiHeartLine            },
    { href: '/dashboard/client/chat',     label: 'Messages',  icon: RiMessage2Line         },
  ],
  vendor: [
    { href: '/dashboard/vendor',              label: 'Overview',   icon: RiDashboardLine        },
    { href: '/dashboard/vendor/products',     label: 'Products',   icon: RiStore2Line           },
    { href: '/dashboard/vendor/orders',       label: 'Orders',     icon: RiShoppingBagLine      },
    { href: '/dashboard/vendor/analytics',    label: 'Analytics',  icon: RiBarChart2Line        },
    { href: '/dashboard/vendor/ads',          label: 'Ads',        icon: RiMegaphoneLine        },
    { href: '/dashboard/vendor/discounts',    label: 'Discounts',  icon: RiPercentLine          },
    { href: '/dashboard/vendor/payouts',      label: 'Payouts',    icon: RiMoneyDollarCircleLine},
    { href: '/dashboard/vendor/chat',         label: 'Messages',   icon: RiMessage2Line         },
    { href: '/dashboard/vendor/verification', label: 'Verify',     icon: RiShieldCheckLine      },
    { href: '/dashboard/vendor/settings',     label: 'Settings',   icon: RiSettings3Line        },
  ],
  admin: [
    { href: '/dashboard/admin',               label: 'Overview',      icon: RiDashboardLine  },
    { href: '/dashboard/admin/users',         label: 'Users',         icon: RiGroup2Line     },
    { href: '/dashboard/admin/vendors',       label: 'Vendors',       icon: RiStore2Line     },
    { href: '/dashboard/admin/products',      label: 'Products',      icon: RiShoppingBagLine},
    { href: '/dashboard/admin/reports',       label: 'Reports',       icon: RiAlertLine      },
    { href: '/dashboard/admin/moderation',    label: 'Moderation',    icon: RiShieldCheckLine},
    { href: '/dashboard/admin/announcements', label: 'Announcements', icon: RiMegaphoneLine   },
    { href: '/dashboard/admin/analytics',     label: 'Analytics',     icon: RiBarChart2Line  },
    { href: '/dashboard/admin/settings',      label: 'Settings',      icon: RiSettings3Line  },
  ],
  superadmin: [
    { href: '/dashboard/admin',               label: 'Overview',      icon: RiDashboardLine  },
    { href: '/dashboard/admin/users',         label: 'Users',         icon: RiGroup2Line     },
    { href: '/dashboard/admin/vendors',       label: 'Vendors',       icon: RiStore2Line     },
    { href: '/dashboard/admin/products',      label: 'Products',      icon: RiShoppingBagLine},
    { href: '/dashboard/admin/reports',       label: 'Reports',       icon: RiAlertLine      },
    { href: '/dashboard/admin/moderation',    label: 'Moderation',    icon: RiShieldCheckLine},
    { href: '/dashboard/admin/announcements', label: 'Announcements', icon: RiMegaphoneLine   },
    { href: '/dashboard/admin/analytics',     label: 'Analytics',     icon: RiBarChart2Line  },
    { href: '/dashboard/admin/settings',      label: 'Settings',      icon: RiSettings3Line  },
  ],
  support: [
    { href: '/dashboard/support',            label: 'Overview',    icon: RiDashboardLine  },
    { href: '/dashboard/support/reports',    label: 'Reports',     icon: RiAlertLine      },
    { href: '/dashboard/support/moderation', label: 'Moderation',  icon: RiShieldCheckLine},
  ],
}

interface Props { role: UserRole; username: string }

export default function DashboardSidebar({ role, username }: Props) {
  const pathname  = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const items     = navByRole[role] ?? navByRole.client

  const roleLabel: Record<UserRole, string> = {
    client:     'Shopper',
    vendor:     'Vendor',
    admin:      'Admin',
    superadmin: 'Super Admin',
    support:    'Support',
  }

  const roleColor: Record<UserRole, string> = {
    client:     'bg-blue-500/20 text-blue-300',
    vendor:     'bg-purple-500/20 text-purple-300',
    admin:      'bg-gold-500/20 text-gold-300',
    superadmin: 'bg-red-500/20 text-red-300',
    support:    'bg-green-500/20 text-green-300',
  }

  return (
    <aside
      style={{
        top: 'var(--announcement-bar-height, 0px)',
        height: 'calc(100vh - var(--announcement-bar-height, 0px))',
      }}
      className={`hidden lg:flex flex-col fixed left-0 z-40 border-r border-[rgba(200,139,0,0.1)] bg-[#0d0520] transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Header */}
      <div className={`flex items-center gap-3 p-4 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-gray-200 text-sm truncate">@{username}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[role]}`}>
              {roleLabel[role]}
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-all"
        >
          {collapsed ? <RiArrowRightLine className="w-3.5 h-3.5" /> : <RiArrowLeftLine className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {items.map(item => {
          const Icon    = item.icon
          const active  = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${active
                  ? 'bg-gold-500/15 text-gold-300 border border-gold-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }
                ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-gold-400' : 'group-hover:text-gold-400 transition-colors'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-white/5">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <RiLogoutBoxLine className="w-4 h-4 flex-shrink-0" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  )
}
