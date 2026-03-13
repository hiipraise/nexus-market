// src/app/layout.tsx
import type { Metadata } from 'next'
import { Syne, DM_Sans, DM_Mono } from 'next/font/google'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import Providers from '@/components/layout/Providers'
import { Toaster } from 'sonner'
import '@/styles/globals.css'
import { appConfig } from '@/config'

const syne = Syne({
  subsets:  ['latin'],
  variable: '--font-syne',
  display:  'swap',
  weight:   ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets:  ['latin'],
  variable: '--font-dm-sans',
  display:  'swap',
  weight:   ['300', '400', '500', '600'],
})

const dmMono = DM_Mono({
  subsets:  ['latin'],
  variable: '--font-dm-mono',
  display:  'swap',
  weight:   ['300', '400', '500'],
})

export const metadata: Metadata = {
  metadataBase:  new URL(appConfig.url),
  title: {
    default:  appConfig.name,
    template: `%s | ${appConfig.name}`,
  },
  description: appConfig.description,
  keywords:    ['ecommerce', 'shop', 'fashion', 'nexus market', 'buy online', 'vendors'],
  authors:     [{ name: appConfig.name }],
  creator:     appConfig.name,
  openGraph: {
    type:        'website',
    locale:      'en_NG',
    url:         appConfig.url,
    title:       appConfig.name,
    description: appConfig.description,
    siteName:    appConfig.name,
    images: [{ url: `${appConfig.url}/og-image.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       appConfig.name,
    description: appConfig.description,
    images:      [`${appConfig.url}/og-image.jpg`],
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },
  verification: { google: '' },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body bg-gray-950 text-gray-100 antialiased">
        <Providers session={session}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a0a2e',
                border:     '1px solid rgba(200,139,0,0.3)',
                color:      '#f3d97a',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
