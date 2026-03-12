import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useCartStore } from '@/store'
import type { ICartItem } from '@/types'

// ── useDebounce ───────────────────────────────────────────────────
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ── useServerCart ─────────────────────────────────────────────────
export function useServerCart() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  const setItems = useCartStore(s => s.setItems)

  const { data, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn:  async () => {
      const res = await axios.get('/api/cart')
      const items = res.data.data?.items ?? []
      setItems(items)
      return res.data.data
    },
    enabled: !!session,
  })

  const addMutation = useMutation({
    mutationFn: (item: ICartItem) => axios.post('/api/cart', item),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['cart'] }),
  })

  const removeMutation = useMutation({
    mutationFn: ({ productId, size }: { productId: string; size: string }) =>
      axios.delete('/api/cart', { data: { productId, size } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  })

  const clearMutation = useMutation({
    mutationFn: () => axios.delete('/api/cart', { data: { clearAll: true } }),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['cart'] }),
  })

  return {
    cart:     data,
    isLoading,
    addItem:    addMutation.mutate,
    removeItem: removeMutation.mutate,
    clearCart:  clearMutation.mutate,
  }
}

// ── useVendorProfile ──────────────────────────────────────────────
export function useVendorProfile() {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ['vendor-profile'],
    queryFn:  () => axios.get('/api/vendors/me').then(r => r.data.data),
    enabled:  session?.user.role === 'vendor',
  })
}

// ── useNotifications ──────────────────────────────────────────────
export function useNotifications() {
  const { data: session } = useSession()
  return useQuery({
    queryKey:       ['notifications'],
    queryFn:        () => axios.get('/api/notifications').then(r => r.data.data),
    enabled:        !!session,
    refetchInterval: 30_000,
  })
}

// ── useClickOutside ───────────────────────────────────────────────
export function useClickOutside<T extends HTMLElement>(callback: () => void) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) callback()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [callback])
  return ref
}

// ── useLocalStorage-free persistent form ─────────────────────────
export function useFormPersist<T extends Record<string, unknown>>(initial: T) {
  const [values, setValues] = useState<T>(initial)
  const update = useCallback((key: keyof T, value: unknown) => {
    setValues(v => ({ ...v, [key]: value }))
  }, [])
  const reset = useCallback(() => setValues(initial), [initial])
  return { values, update, reset, setValues }
}

// ── usePagination ─────────────────────────────────────────────────
export function usePagination(totalPages: number, initial = 1) {
  const [page, setPage] = useState(initial)
  const next  = useCallback(() => setPage(p => Math.min(p + 1, totalPages)), [totalPages])
  const prev  = useCallback(() => setPage(p => Math.max(p - 1, 1)),        [])
  const goTo  = useCallback((p: number) => setPage(Math.min(Math.max(1, p), totalPages)), [totalPages])
  return { page, next, prev, goTo, setPage }
}

// ── useProductFilters ─────────────────────────────────────────────
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { buildQueryString } from '@/lib/utils'

export function useProductFilters() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const filters = {
    gender:      searchParams.get('gender')      ?? '',
    category:    searchParams.get('category')    ?? '',
    sort:        searchParams.get('sort')        ?? 'newest',
    minPrice:    searchParams.get('minPrice')    ?? '',
    maxPrice:    searchParams.get('maxPrice')    ?? '',
    deals:       searchParams.get('deals')       === 'true',
    blackFriday: searchParams.get('blackFriday') === 'true',
    q:           searchParams.get('q')           ?? '',
    page:        parseInt(searchParams.get('page') ?? '1'),
  }

  const setFilter = useCallback((key: string, value: string | boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === '' || value === false) {
      params.delete(key)
    } else {
      params.set(key, String(value))
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router])

  const clearFilters = useCallback(() => router.push(pathname), [pathname, router])

  const hasActiveFilters = !!(filters.gender || filters.category || filters.minPrice || filters.maxPrice || filters.deals || filters.blackFriday)

  return { filters, setFilter, clearFilters, hasActiveFilters }
}
