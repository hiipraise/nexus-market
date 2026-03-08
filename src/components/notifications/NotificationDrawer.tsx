'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import { RiCloseLine, RiBellLine, RiCheckDoubleLine } from 'react-icons/ri'
import { useUIStore, useNotificationStore } from '@/store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { timeAgo } from '@/lib/utils'
import Link from 'next/link'

const NOTIF_ICONS: Record<string, string> = {
  order_placed:        '🛍',
  payment_received:    '💰',
  order_status_update: '📦',
  low_stock:           '⚠',
  new_review:          '⭐',
  vendor_verified:     '✅',
  cart_shared:         '🛒',
  announcement:        '📢',
  new_message:         '💬',
  payout_processed:    '💸',
  return_requested:    '↩',
  refund_processed:    '💳',
}

export default function NotificationDrawer() {
  const { notificationOpen, toggleNotifications } = useUIStore()
  const { notifications, setNotifications, markRead, markAllRead, unreadCount } = useNotificationStore()
  const { data: session } = useSession()
  const qc = useQueryClient()

  useQuery({
    queryKey: ['notifications'],
    queryFn:  async () => {
      const res = await axios.get('/api/notifications')
      setNotifications(res.data.data)
      return res.data.data
    },
    enabled: !!session && notificationOpen,
    refetchInterval: 30_000,
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => axios.patch(`/api/notifications/${id}/read`),
    onSuccess:  (_, id) => markRead(id),
  })

  const markAllMutation = useMutation({
    mutationFn: () => axios.patch('/api/notifications/read-all'),
    onSuccess:  () => markAllRead(),
  })

  return (
    <Transition appear show={notificationOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={toggleNotifications}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="flex h-full justify-end">
            <Transition.Child
              as={Fragment}
              enter="transform ease-in-out duration-300" enterFrom="translate-x-full" enterTo="translate-x-0"
              leave="transform ease-in-out duration-200" leaveFrom="translate-x-0" leaveTo="translate-x-full"
            >
              <Dialog.Panel className="w-full max-w-sm glass border-l border-[rgba(200,139,0,0.15)] flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                  <Dialog.Title className="font-display font-bold text-xl text-gray-100 flex items-center gap-2">
                    <RiBellLine className="w-5 h-5 text-gold-400" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                    )}
                  </Dialog.Title>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllMutation.mutate()}
                        className="btn-ghost text-xs flex items-center gap-1"
                        title="Mark all as read"
                      >
                        <RiCheckDoubleLine className="w-4 h-4" />
                        All read
                      </button>
                    )}
                    <button onClick={toggleNotifications} className="btn-ghost p-2">
                      <RiCloseLine className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                      <RiBellLine className="w-12 h-12 text-gray-700 mb-3" />
                      <p className="text-gray-500 text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif, idx) => (
                      <motion.div
                        key={notif._id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => !notif.isRead && markReadMutation.mutate(notif._id)}
                        className={`p-4 rounded-xl cursor-pointer transition-all
                          ${notif.isRead ? 'bg-white/3 hover:bg-white/5' : 'bg-gold-500/8 border border-gold-500/15 hover:bg-gold-500/12'}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl flex-shrink-0 mt-0.5">
                            {NOTIF_ICONS[notif.type] ?? '🔔'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${notif.isRead ? 'text-gray-400' : 'text-gray-200'}`}>
                              {notif.title}
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-gray-700 text-xs mt-1">{timeAgo(notif.createdAt)}</p>
                          </div>
                          {!notif.isRead && (
                            <div className="w-2 h-2 rounded-full bg-gold-400 flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
