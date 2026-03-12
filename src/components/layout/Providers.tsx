// src/components/layout/Providers.tsx
'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import type { Session } from 'next-auth'
import CartDrawer from '@/components/cart/CartDrawer'
import NotificationDrawer from '@/components/notifications/NotificationDrawer'
import LiveSearchOverlay from '@/components/shared/LiveSearchOverlay'

interface ProvidersProps {
  children: ReactNode
  session:  Session | null
}

export default function Providers({ children, session }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:            60 * 1000,
            gcTime:               5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry:                1,
          },
        },
      })
  )

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {children}
        <CartDrawer />
        <NotificationDrawer />
        <LiveSearchOverlay />
      </QueryClientProvider>
    </SessionProvider>
  )
}
