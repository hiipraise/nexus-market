// ================================================================
// NEXUS MARKET — UTILITY FUNCTIONS
// ================================================================

import { platformConfig } from '@/config'
import slugifyLib from 'slugify'
import { nanoid } from 'nanoid'

// ── Currency ─────────────────────────────────────────────────────

/** Convert kobo to naira and format as ₦x,xxx.xx */
export function formatCurrency(kobo: number): string {
  const naira = kobo / 100
  return new Intl.NumberFormat('en-NG', {
    style:    'currency',
    currency: platformConfig.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(naira)
}

/** Convert naira to kobo */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100)
}

/** Convert kobo to naira */
export function koboToNaira(kobo: number): number {
  return kobo / 100
}

// ── Slugify ───────────────────────────────────────────────────────

export function createSlug(text: string): string {
  return slugifyLib(text, {
    lower:     true,
    strict:    true,
    trim:      true,
    replacement: '-',
  })
}

export function createUniqueSlug(text: string): string {
  return `${createSlug(text)}-${nanoid(6)}`
}

// ── Order numbers ─────────────────────────────────────────────────

export function generateOrderNumber(): string {
  const ts     = Date.now().toString(36).toUpperCase()
  const random = nanoid(4).toUpperCase()
  return `NXM-${ts}-${random}`
}

export function generateReference(): string {
  return `NXM_${Date.now()}_${nanoid(8)}`
}

// ── Pagination ────────────────────────────────────────────────────

export function getPaginationMeta(
  total: number,
  page:  number,
  limit: number
) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext:    page < Math.ceil(total / limit),
    hasPrev:    page > 1,
  }
}

export function parsePagination(
  searchParams: URLSearchParams,
  defaultLimit = 20,
  maxLimit = 100
): { page: number; limit: number; skip: number } {
  const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10))
  const limit = Math.min(maxLimit, Math.max(1, parseInt(searchParams.get('limit') ?? String(defaultLimit), 10)))
  return { page, limit, skip: (page - 1) * limit }
}

// ── Discount ──────────────────────────────────────────────────────

export function calculateDiscountedPrice(
  basePrice:     number,
  discountType:  'percentage' | 'fixed',
  discountValue: number
): number {
  if (discountType === 'percentage') {
    return Math.round(basePrice * (1 - discountValue / 100))
  }
  return Math.max(0, basePrice - discountValue)
}

export function discountPercentage(
  basePrice:     number,
  discountPrice: number
): number {
  return Math.round(((basePrice - discountPrice) / basePrice) * 100)
}

// ── Date ──────────────────────────────────────────────────────────

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-NG', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-NG', {
    year:   'numeric',
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function timeAgo(date: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  const intervals: [number, string][] = [
    [31_536_000, 'year'],
    [2_592_000,  'month'],
    [86_400,     'day'],
    [3_600,      'hour'],
    [60,         'minute'],
    [1,          'second'],
  ]
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

// ── String ────────────────────────────────────────────────────────

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 3) + '…' : str
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split('@')
  const masked = user.slice(0, 2) + '*'.repeat(Math.max(0, user.length - 2))
  return `${masked}@${domain}`
}

// ── Array ─────────────────────────────────────────────────────────

export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

// ── URL / SEO ─────────────────────────────────────────────────────

export function buildQueryString(params: Record<string, unknown>): string {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      sp.set(key, String(value))
    }
  }
  return sp.toString()
}

// ── Phone ─────────────────────────────────────────────────────────

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) return `+234${digits.slice(1)}`
  if (digits.startsWith('234')) return `+${digits}`
  return phone
}

// ── Share cart ID ─────────────────────────────────────────────────

export function generateShareId(): string {
  return nanoid(10)
}

// ── Error helpers ─────────────────────────────────────────────────

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}

// ── Hash (bcrypt wrapper) ─────────────────────────────────────────

import bcrypt from 'bcryptjs'

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export async function hashAnswer(answer: string): Promise<string> {
  return bcrypt.hash(answer.toLowerCase().trim(), 10)
}

export async function compareAnswer(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain.toLowerCase().trim(), hash)
}
