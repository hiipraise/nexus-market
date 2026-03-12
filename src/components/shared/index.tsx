'use client'

import { Fragment, type ReactNode } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import { RiCloseLine, RiStarFill, RiStarLine, RiAlertLine, RiLoader4Line } from 'react-icons/ri'

// ── Modal ─────────────────────────────────────────────────────────
interface ModalProps {
  isOpen:    boolean
  onClose:   () => void
  title?:    string
  children:  ReactNode
  size?:     'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const sizeClass = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }[size]

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full ${sizeClass} glass rounded-2xl shadow-purple-lg`}>
                {title && (
                  <div className="flex items-center justify-between p-5 border-b border-white/10">
                    <Dialog.Title className="font-display font-semibold text-lg text-gray-100">{title}</Dialog.Title>
                    <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
                      <RiCloseLine className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <div className="p-5">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

// ── StarRating ────────────────────────────────────────────────────
interface StarRatingProps {
  value:      number
  max?:       number
  onChange?:  (v: number) => void
  size?:      'sm' | 'md' | 'lg'
  readOnly?:  boolean
}

export function StarRating({ value, max = 5, onChange, size = 'md', readOnly = false }: StarRatingProps) {
  const sizeClass = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' }[size]
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(value)
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(i + 1)}
            className={`transition-all ${readOnly ? 'cursor-default' : 'hover:scale-110 cursor-pointer'}`}
          >
            {filled
              ? <RiStarFill  className={`${sizeClass} text-gold-400`} />
              : <RiStarLine  className={`${sizeClass} text-gray-600`} />
            }
          </button>
        )
      })}
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?:     ReactNode
  title:     string
  message?:  string
  action?:   ReactNode
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      {icon && <div className="text-gray-700 mb-4">{icon}</div>}
      <p className="font-display font-semibold text-xl text-gray-400">{title}</p>
      {message && <p className="text-gray-600 text-sm mt-1 max-w-xs">{message}</p>}
      {action  && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}

// ── LoadingSpinner ────────────────────────────────────────────────
interface SpinnerProps { size?: 'sm' | 'md' | 'lg'; fullPage?: boolean }

export function LoadingSpinner({ size = 'md', fullPage = false }: SpinnerProps) {
  const sizeClass = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  const spinner = <RiLoader4Line className={`${sizeClass} text-gold-400 animate-spin`} />
  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinner}
      </div>
    )
  }
  return <div className="flex items-center justify-center p-8">{spinner}</div>
}

// ── Pagination ────────────────────────────────────────────────────
interface PaginationProps {
  page:        number
  totalPages:  number
  onPageChange: (p: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1
    if (page <= 3) return i + 1
    if (page >= totalPages - 2) return totalPages - 4 + i
    return page - 2 + i
  })

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="btn-secondary text-sm px-3 py-2 disabled:opacity-40"
      >
        Prev
      </button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-xl text-sm font-medium transition-all
            ${p === page
              ? 'bg-gold-500 text-gray-950 font-bold'
              : 'bg-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/10'
            }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="btn-secondary text-sm px-3 py-2 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  )
}

// ── ConfirmDialog ─────────────────────────────────────────────────
interface ConfirmDialogProps {
  isOpen:    boolean
  onClose:   () => void
  onConfirm: () => void
  title:     string
  message:   string
  danger?:   boolean
  loading?:  boolean
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, danger = false, loading = false }: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4 ${danger ? 'bg-red-500/20' : 'bg-gold-500/20'}`}>
          <RiAlertLine className={`w-7 h-7 ${danger ? 'text-red-400' : 'text-gold-400'}`} />
        </div>
        <h3 className="font-display font-bold text-lg text-gray-100 mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50
              ${danger ? 'bg-red-500 hover:bg-red-400 text-white' : 'btn-primary'}`}
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Confirm'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── StatusBadge ───────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  active:            'bg-green-500/20 text-green-300 border-green-500/30',
  inactive:          'bg-gray-500/20 text-gray-400 border-gray-500/30',
  pending:           'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  verified:          'bg-gold-500/20 text-gold-300 border-gold-500/30',
  suspended:         'bg-orange-500/20 text-orange-300 border-orange-500/30',
  banned:            'bg-red-500/20 text-red-300 border-red-500/30',
  success:           'bg-green-500/20 text-green-300 border-green-500/30',
  failed:            'bg-red-500/20 text-red-300 border-red-500/30',
  delivered:         'bg-green-500/20 text-green-300 border-green-500/30',
  shipped:           'bg-blue-500/20 text-blue-300 border-blue-500/30',
  processing:        'bg-purple-500/20 text-purple-300 border-purple-500/30',
  payment_confirmed: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  cancelled:         'bg-red-500/20 text-red-300 border-red-500/30',
  refunded:          'bg-gray-500/20 text-gray-300 border-gray-500/30',
  open:              'bg-red-500/20 text-red-300 border-red-500/30',
  under_review:      'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  resolved:          'bg-green-500/20 text-green-300 border-green-500/30',
  dismissed:         'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
