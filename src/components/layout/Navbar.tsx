// src/components/layout/Navbar.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiSearchLine, RiShoppingCartLine, RiBellLine, RiMenuLine,
  RiCloseLine, RiUserLine, RiStore2Line, RiShieldLine,
  RiLogoutBoxLine, RiArrowDownSLine, RiHeartLine,
} from 'react-icons/ri'
import { useCartStore, useUIStore, useNotificationStore } from '@/store'
import { navLinks, appConfig } from '@/config'

export default function Navbar() {
  const { data: session }  = useSession()
  const cartTotal          = useCartStore(s => s.totalItems())
  const openCart           = useCartStore(s => s.openCart)
  const { mobileNavOpen, openMobileNav, closeMobileNav, toggleSearch } = useUIStore()
  const unreadCount        = useNotificationStore(s => s.unreadCount)
  const toggleNotifications = useUIStore(s => s.toggleNotifications)

  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const role = session?.user.role

  const getDashboardLink = () => {
    if (!role) return '/login'
    if (role === 'vendor')   return '/dashboard/vendor'
    if (role === 'admin' || role === 'superadmin') return '/dashboard/admin'
    if (role === 'support')  return '/dashboard/support'
    return '/dashboard/client'
  }

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled
          ? 'glass border-b border-[rgba(200,139,0,0.15)] py-3'
          : 'bg-transparent py-5'
        }
      `}
    >
      <div className="page-container flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
            <span className="font-display font-black text-gray-950 text-lg">N</span>
          </div>
          <span className="font-display font-bold text-xl text-gradient-gold hidden sm:block">
            {appConfig.name}
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.public.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-lg text-gray-300 hover:text-gold-300 hover:bg-white/5 font-body text-sm font-medium transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            onClick={toggleSearch}
            className="btn-ghost p-2.5 rounded-xl"
            aria-label="Search"
          >
            <RiSearchLine className="w-5 h-5" />
          </button>

          {/* Cart */}
          <button
            onClick={openCart}
            className="btn-ghost p-2.5 rounded-xl relative"
            aria-label="Cart"
          >
            <RiShoppingCartLine className="w-5 h-5" />
            {cartTotal > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 text-gray-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartTotal > 9 ? '9+' : cartTotal}
              </span>
            )}
          </button>

          {/* Notifications (logged in only) */}
          {session && (
            <button
              onClick={toggleNotifications}
              className="btn-ghost p-2.5 rounded-xl relative"
              aria-label="Notifications"
            >
              <RiBellLine className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse-gold">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User Menu */}
          {session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.username}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    session.user.username[0].toUpperCase()
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-300">
                  @{session.user.username}
                </span>
                <RiArrowDownSLine className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{  opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 glass rounded-2xl overflow-hidden shadow-purple-lg"
                  >
                    <div className="p-2 space-y-1">
                      <Link
                        href={getDashboardLink()}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-gold-300 hover:bg-white/5 text-sm font-medium transition-all"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {role === 'vendor' ? <RiStore2Line className="w-4 h-4" /> :
                         (role === 'admin' || role === 'superadmin') ? <RiShieldLine className="w-4 h-4" /> :
                         <RiUserLine className="w-4 h-4" />}
                        Dashboard
                      </Link>
                      {role === 'client' && (
                        <Link
                          href="/dashboard/client/wishlist"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-gold-300 hover:bg-white/5 text-sm font-medium transition-all"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <RiHeartLine className="w-4 h-4" />
                          Wishlist
                        </Link>
                      )}
                      <div className="h-px bg-white/10 my-1" />
                      <button
                        onClick={() => { signOut({ callbackUrl: '/' }); setUserMenuOpen(false) }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all"
                      >
                        <RiLogoutBoxLine className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-ghost text-sm px-4 py-2 hidden sm:flex">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary text-xs px-4 py-2">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={mobileNavOpen ? closeMobileNav : openMobileNav}
            className="btn-ghost p-2.5 rounded-xl lg:hidden"
            aria-label="Menu"
          >
            {mobileNavOpen
              ? <RiCloseLine className="w-5 h-5" />
              : <RiMenuLine className="w-5 h-5" />
            }
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{  opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden border-t border-[rgba(200,139,0,0.15)] bg-[#120829]/95 backdrop-blur-xl"
          >
            <nav className="page-container py-4 space-y-1">
              {navLinks.public.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileNav}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-gold-300 hover:bg-white/5 font-body font-medium transition-all"
                >
                  {link.label}
                </Link>
              ))}
              {!session && (
                <div className="pt-2 flex flex-col gap-2">
                  <Link href="/login"    onClick={closeMobileNav} className="btn-secondary w-full justify-center">Sign In</Link>
                  <Link href="/register" onClick={closeMobileNav} className="btn-primary  w-full justify-center">Create Account</Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
