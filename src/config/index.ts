// ================================================================
// NEXUS MARKET — APP CONFIGURATION
// All values come from environment variables. Zero hard-coded.
// ================================================================

export const appConfig = {
  name:        process.env.NEXT_PUBLIC_APP_NAME        ?? 'Nexus Market',
  url:         process.env.NEXT_PUBLIC_APP_URL         ?? 'http://localhost:3000',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION ?? 'Premium multi-vendor eCommerce platform',
  nodeEnv:     process.env.NODE_ENV                    ?? 'development',
} as const

export const dbConfig = {
  uri:    process.env.MONGODB_URI!,
  dbName: process.env.MONGODB_DB_NAME ?? 'nexus_market',
} as const

export const authConfig = {
  secret:      process.env.NEXTAUTH_SECRET!,
  url:         process.env.NEXTAUTH_URL!,
  jwtSecret:   process.env.JWT_SECRET!,
  sessionAge:  60 * 60 * 24 * 7,   // 7 days
} as const

export const cloudinaryConfig = {
  cloudName:    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  apiKey:       process.env.CLOUDINARY_API_KEY!,
  apiSecret:    process.env.CLOUDINARY_API_SECRET!,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
  folders: {
    products:     'nexus_market/products',
    vendors:      'nexus_market/vendors',
    users:        'nexus_market/users',
    ads:          'nexus_market/ads',
    categories:   'nexus_market/categories',
    reviews:      'nexus_market/reviews',
  },
} as const

export const paystackConfig = {
  publicKey:  process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
  secretKey:  process.env.PAYSTACK_SECRET_KEY!,
  baseUrl:    'https://api.paystack.co',
  callbackPath: '/checkout/verify',
} as const

export const platformConfig = {
  feePercentage:  Number(process.env.PLATFORM_FEE_PERCENTAGE ?? 10),
  feeFlatKobo:    Number(process.env.PLATFORM_FEE_FLAT       ?? 10_000),
  payoutMinKobo:  Number(process.env.PLATFORM_PAYOUT_MINIMUM ?? 500_000),
  currency:       'NGN',
  currencySymbol: '₦',
} as const

export const moderationConfig = {
  reviewThreshold:  Number(process.env.REPORT_THRESHOLD_REVIEW  ?? 5),
  suspendThreshold: Number(process.env.REPORT_THRESHOLD_SUSPEND ?? 10),
} as const

export const stockConfig = {
  lowStockThreshold: Number(process.env.LOW_STOCK_THRESHOLD ?? 5),
} as const

export const socketConfig = {
  url: process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3001',
} as const

export const paginationConfig = {
  defaultLimit:   20,
  maxLimit:       100,
  trendingLimit:  20,
} as const

export const secretQuestions = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the name of your primary school?",
  "What was the make of your first car?",
  "What is your oldest sibling's middle name?",
  "What street did you grow up on?",
  "What was your childhood nickname?",
  "What is the name of your favourite teacher?",
  "What was the name of your childhood best friend?",
] as const

export type SecretQuestion = typeof secretQuestions[number]

export const productGenders = ['male', 'female', 'kids', 'unisex'] as const

export const productSizes = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  shoes:    ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  kids:     ['0-3M', '3-6M', '6-12M', '1Y', '2Y', '3Y', '4Y', '5Y', '6Y', '7Y', '8Y', '10Y', '12Y'],
  generic:  ['One Size'],
} as const

export const navLinks = {
  public: [
    { label: 'Shop',     href: '/products'               },
    { label: 'Vendors',  href: '/vendors'                },
    { label: 'Trending', href: '/trending'               },
    { label: 'Deals',    href: '/products?deals=true'    },
  ],
  client: [
    { label: 'My Orders',  href: '/dashboard/client/orders'   },
    { label: 'My Profile', href: '/dashboard/client/profile'  },
    { label: 'Wishlist',   href: '/dashboard/client/wishlist' },
    { label: 'Chat',       href: '/dashboard/client/chat'     },
  ],
  vendor: [
    { label: 'Dashboard',  href: '/dashboard/vendor'               },
    { label: 'Products',   href: '/dashboard/vendor/products'      },
    { label: 'Orders',     href: '/dashboard/vendor/orders'        },
    { label: 'Analytics',  href: '/dashboard/vendor/analytics'     },
    { label: 'Ads',        href: '/dashboard/vendor/ads'           },
    { label: 'Payouts',    href: '/dashboard/vendor/payouts'       },
  ],
  admin: [
    { label: 'Dashboard',     href: '/dashboard/admin'                  },
    { label: 'Users',         href: '/dashboard/admin/users'            },
    { label: 'Vendors',       href: '/dashboard/admin/vendors'          },
    { label: 'Products',      href: '/dashboard/admin/products'         },
    { label: 'Reports',       href: '/dashboard/admin/reports'          },
    { label: 'Announcements', href: '/dashboard/admin/announcements'    },
  ],
} as const
