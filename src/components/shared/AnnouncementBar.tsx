'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RiCloseLine, RiMegaphoneLine, RiAlertLine, RiCheckLine, RiGiftLine } from 'react-icons/ri'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const TYPE_STYLES = {
  info:    { bg: 'bg-blue-500/10 border-b border-blue-500/20',    text: 'text-blue-300',   icon: RiMegaphoneLine },
  warning: { bg: 'bg-yellow-500/10 border-b border-yellow-500/20', text: 'text-yellow-300', icon: RiAlertLine    },
  success: { bg: 'bg-green-500/10 border-b border-green-500/20',  text: 'text-green-300',  icon: RiCheckLine    },
  promo:   { bg: 'bg-gold-500/10 border-b border-gold-500/20',    text: 'text-gold-300',   icon: RiGiftLine     },
} as const

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState<string[]>([])
  const barRef = useRef<HTMLDivElement | null>(null)

  const { data: announcements } = useQuery({
    queryKey: ['announcements'],
    queryFn:  () => axios.get('/api/announcements').then(r => r.data.data),
    staleTime: 60_000,
  })

  const visible = (announcements ?? []).filter((a: any) => !dismissed.includes(a._id))

  useEffect(() => {
    const root = document.documentElement

    if (!visible.length) {
      root.style.setProperty('--announcement-bar-height', '0px')
      return
    }

    const updateHeight = () => {
      const height = barRef.current?.getBoundingClientRect().height ?? 0
      root.style.setProperty('--announcement-bar-height', `${Math.ceil(height)}px`)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => {
      window.removeEventListener('resize', updateHeight)
      root.style.setProperty('--announcement-bar-height', '0px')
    }
  }, [visible.length])

  if (!visible.length) return null

  const ann   = visible[0]
  const style = TYPE_STYLES[ann.type as keyof typeof TYPE_STYLES] ?? TYPE_STYLES.info
  const Icon  = style.icon

  return (
    <AnimatePresence>
      <motion.div
        ref={barRef}
        key={ann._id}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`${style.bg} fixed top-0 left-0 right-0 z-[60]`}
      >
        <div className="page-container py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Icon className={`w-4 h-4 flex-shrink-0 ${style.text}`} />
            <p className={`text-sm font-body truncate ${style.text}`}>
              <span className="font-semibold">{ann.title}:</span>{' '}{ann.content}
            </p>
          </div>
          <button
            onClick={() => setDismissed(d => [...d, ann._id])}
            className={`flex-shrink-0 hover:opacity-70 transition-opacity ${style.text}`}
            aria-label="Dismiss"
          >
            <RiCloseLine className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
