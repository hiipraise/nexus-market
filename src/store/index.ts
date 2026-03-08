// ================================================================
// NEXUS MARKET — CLIENT STATE STORES (Zustand, no localStorage)
// ================================================================

import { create } from 'zustand'
import type { ICartItem } from '@/types'

// ── Cart store ────────────────────────────────────────────────────
interface CartState {
  items:       ICartItem[]
  isOpen:      boolean
  isLoading:   boolean
  setItems:    (items: ICartItem[]) => void
  addItem:     (item: ICartItem) => void
  removeItem:  (productId: string, size: string) => void
  updateQty:   (productId: string, size: string, qty: number) => void
  clear:       () => void
  openCart:    () => void
  closeCart:   () => void
  setLoading:  (v: boolean) => void
  totalItems:  () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items:     [],
  isOpen:    false,
  isLoading: false,

  setItems:   (items)  => set({ items }),
  addItem:    (item)   => set(state => {
    const idx = state.items.findIndex(
      i => String(i.productId) === String(item.productId) && i.size === item.size
    )
    if (idx >= 0) {
      const items = [...state.items]
      items[idx] = { ...items[idx], quantity: items[idx].quantity + item.quantity }
      return { items }
    }
    return { items: [...state.items, item] }
  }),
  removeItem: (productId, size) => set(state => ({
    items: state.items.filter(
      i => !(String(i.productId) === productId && i.size === size)
    ),
  })),
  updateQty:  (productId, size, qty) => set(state => ({
    items: state.items.map(i =>
      String(i.productId) === productId && i.size === size
        ? { ...i, quantity: qty }
        : i
    ),
  })),
  clear:      ()  => set({ items: [] }),
  openCart:   ()  => set({ isOpen: true }),
  closeCart:  ()  => set({ isOpen: false }),
  setLoading: (v) => set({ isLoading: v }),
  totalItems: ()  => get().items.reduce((s, i) => s + i.quantity, 0),
}))

// ── UI store ──────────────────────────────────────────────────────
interface UIState {
  mobileNavOpen:     boolean
  searchOpen:        boolean
  notificationOpen:  boolean
  chatOpen:          boolean
  openMobileNav:     () => void
  closeMobileNav:    () => void
  toggleSearch:      () => void
  toggleNotifications: () => void
  toggleChat:        () => void
}

export const useUIStore = create<UIState>((set) => ({
  mobileNavOpen:    false,
  searchOpen:       false,
  notificationOpen: false,
  chatOpen:         false,

  openMobileNav:       ()  => set({ mobileNavOpen: true }),
  closeMobileNav:      ()  => set({ mobileNavOpen: false }),
  toggleSearch:        ()  => set(s => ({ searchOpen:       !s.searchOpen })),
  toggleNotifications: ()  => set(s => ({ notificationOpen: !s.notificationOpen })),
  toggleChat:          ()  => set(s => ({ chatOpen:         !s.chatOpen })),
}))

// ── Notification store ────────────────────────────────────────────
interface Notif {
  _id:       string
  type:      string
  title:     string
  message:   string
  isRead:    boolean
  createdAt: string
  data?:     Record<string, unknown>
}

interface NotificationState {
  notifications: Notif[]
  unreadCount:   number
  setNotifications: (notifs: Notif[]) => void
  addNotification:  (notif: Notif) => void
  markRead:         (id: string) => void
  markAllRead:      () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount:   0,

  setNotifications: (notifications) => set({
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
  }),
  addNotification: (notif) => set(state => ({
    notifications: [notif, ...state.notifications],
    unreadCount:   state.unreadCount + (notif.isRead ? 0 : 1),
  })),
  markRead: (id) => set(state => ({
    notifications: state.notifications.map(n => n._id === id ? { ...n, isRead: true } : n),
    unreadCount:   Math.max(0, state.unreadCount - 1),
  })),
  markAllRead: () => set(state => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
    unreadCount:   0,
  })),
}))

// ── Search store ──────────────────────────────────────────────────
interface SearchState {
  query:       string
  results:     unknown[]
  isSearching: boolean
  setQuery:    (q: string) => void
  setResults:  (r: unknown[]) => void
  setSearching: (v: boolean) => void
  clearSearch: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  query:       '',
  results:     [],
  isSearching: false,

  setQuery:    (query)    => set({ query }),
  setResults:  (results)  => set({ results }),
  setSearching: (v)       => set({ isSearching: v }),
  clearSearch: ()         => set({ query: '', results: [], isSearching: false }),
}))
