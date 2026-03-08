# 🛍️ Nexus Market

**A full-featured multi-vendor eCommerce platform built with Next.js 14, TypeScript, MongoDB, and Paystack.**

---

## ✨ Features

### 🛒 Shopping
- Guest & authenticated checkout
- Shareable cart (share via username)
- Live product search with filters
- Category, gender, price range filters
- Discount codes & percentage-off badges
- Black Friday promotions
- Product ads carousel (vendor-sponsored)
- Order tracking with full status history
- Returns & refunds system

### 👥 User Roles
| Role | Permissions |
|------|------------|
| **Client** | Browse, buy, review, chat with vendors |
| **Vendor** | Sell products, run ads, create discounts, receive payouts |
| **Admin** | Approve vendors, manage reports, post announcements |
| **Super Admin** | Full platform control |
| **Support** | View reports & moderation queue |

### 🏪 Vendor System
- Register with business profile
- Upload profile picture & description
- Admin verification workflow (badge after approval)
- Unverified vendors **cannot** upload products
- Product management (create, update, soft-delete)
- Analytics dashboard (revenue, orders, views)
- Ad campaigns (carousel, banner, featured)
- Discount code management
- Payout requests via Paystack transfers
- WhatsApp & phone contact buttons (shared if same number)

### 🔐 Authentication
- Username + password (no OTP, no passwordless)
- Show/hide password toggle (no confirm field)
- Unique username enforced at DB level
- Username privacy (public/private choice)
- Secret question for username recovery
- JWT sessions via NextAuth

### 📊 Analytics
- Vendor: Revenue charts, top products, order stats
- Admin: Platform revenue, active vendors, open reports

### 🏆 Trending & Discovery (Public)
- Top 20: Trending, Most Viewed, Most Purchased
- Cheapest, Priciest, Most Searched
- Trending Vendors leaderboard

### 💬 Communication
- In-app notifications with real-time badge
- Vendor ↔ User chat system
- Admin announcements bar (per-role targeting)

### 🔒 Moderation
- Product & vendor reporting
- Auto-review at threshold (configurable)
- Auto-suspend at higher threshold
- Admin can ban permanently (scam protection)

### 💳 Payments (Paystack)
- Initialize & verify transactions
- 10% platform fee + flat fee (configurable via `.env`)
- Vendor balance tracking
- Payout requests with Paystack Transfers API
- Webhook handler for real-time updates

### ♻️ Data Integrity
- **Soft delete** — records are never permanently destroyed
- All config values via environment variables (zero hard-coded)

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | HeadlessUI |
| Animation | Framer Motion |
| Database | MongoDB (Mongoose) |
| Auth | NextAuth.js (credentials) |
| Payments | Paystack |
| Images | Cloudinary |
| State | Zustand (no localStorage) |
| Data Fetching | TanStack React Query |
| Forms | React Hook Form + Zod |
| Icons | React Icons (ri) + Lucide |
| Fonts | Syne (display) + DM Sans (body) |
| Carousel | Embla Carousel |
| Charts | Recharts |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Paystack account

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/nexus-market.git
cd nexus-market

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# MongoDB
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=nexus_market

# NextAuth
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=nexus_market_unsigned

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...

# Platform Fees
PLATFORM_FEE_PERCENTAGE=10
PLATFORM_FEE_FLAT=10000       # ₦100 in kobo
PLATFORM_PAYOUT_MINIMUM=500000 # ₦5000 in kobo

# Moderation
REPORT_THRESHOLD_REVIEW=5
REPORT_THRESHOLD_SUSPEND=10
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/                 # Login, Register, Forgot Username
│   │   ├── login/
│   │   ├── register/
│   │   ├── vendor/register/
│   │   └── forgot-username/
│   ├── (main)/                 # Public pages
│   │   ├── page.tsx            # Homepage
│   │   ├── products/           # Product listing
│   │   ├── vendors/            # Vendor directory
│   │   ├── trending/           # Top 20 charts
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── orders/
│   ├── dashboard/
│   │   ├── vendor/             # Vendor dashboard
│   │   ├── admin/              # Admin panel
│   │   ├── client/             # Client dashboard
│   │   └── support/            # Support tools
│   └── api/
│       ├── auth/               # NextAuth + register + forgot-username
│       ├── products/           # CRUD + search
│       ├── vendors/            # Vendor management + verification
│       ├── orders/             # Order lifecycle
│       ├── payments/           # Paystack + webhook
│       ├── cart/               # Cart + share
│       ├── analytics/          # Vendor + admin analytics
│       ├── reports/            # Report system
│       ├── notifications/      # In-app notifications
│       ├── announcements/      # Admin announcements
│       ├── payouts/            # Vendor payouts
│       ├── ads/                # Ad campaigns
│       ├── discounts/          # Discount codes
│       ├── reviews/            # Ratings & reviews
│       ├── search/             # Live search
│       ├── trending/           # Trending data
│       └── users/              # Profile + data export
├── components/
│   ├── layout/                 # Navbar, Footer, Providers
│   ├── home/                   # Hero, Carousel, Category grid
│   ├── products/               # ProductCard, ProductsPage
│   ├── cart/                   # CartDrawer
│   ├── notifications/          # NotificationDrawer
│   ├── shared/                 # SearchOverlay, AnnouncementBar
│   └── dashboard/              # Vendor + Admin dashboards
├── lib/
│   ├── db/connect.ts           # MongoDB connection
│   ├── auth/                   # NextAuth config + helpers
│   ├── paystack/               # Payment utilities
│   ├── cloudinary/             # Image upload
│   └── utils/                  # Formatting, slugify, etc.
├── models/                     # Mongoose schemas (all with soft delete)
├── types/                      # TypeScript interfaces
├── store/                      # Zustand stores (no localStorage)
├── config/                     # App configuration (env-driven)
└── styles/                     # Global CSS
```

---

## 🎨 Theme

| Variable | Color |
|----------|-------|
| Gold Primary | `#c88b00` |
| Gold Light | `#e1b983` |
| Purple | `#7a5498` |
| Purple Dark | `#4d2f70` |

Fonts: **Syne** (headings) · **DM Sans** (body) · **DM Mono** (code/prices)

---

## 💰 Fee Structure

```
Platform fee = (order_subtotal × 10%) + ₦100 flat fee
Vendor receives = subtotal - platform_fee

Example: ₦10,000 order
  Platform fee = ₦1,000 + ₦100 = ₦1,100
  Vendor gets  = ₦8,900
```

All values configurable via environment variables.

---

## 📦 Key API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Client registration |
| POST | `/api/auth/vendor-register` | Vendor registration |
| GET/POST | `/api/auth/forgot-username` | Username recovery |
| GET/POST | `/api/products` | List / create products |
| GET | `/api/search?q=` | Live product search |
| GET | `/api/trending` | Top 20 charts |
| POST | `/api/orders` | Place order |
| POST | `/api/payments/webhook` | Paystack webhook |
| GET/PATCH | `/api/cart` | Cart management |
| PATCH | `/api/cart` (share) | Share cart by username |
| GET | `/api/analytics/vendor` | Vendor analytics |
| GET | `/api/analytics/admin` | Admin analytics |
| POST | `/api/reports` | Report product/vendor |
| POST | `/api/payouts` | Request payout |
| GET | `/api/users/export` | Export user data (JSON/CSV) |

---

## 🔧 Deployment

```bash
# Build for production
npm run build
npm start

# Environment: Set all .env.example variables
# Paystack webhook: Register https://yourdomain.com/api/payments/webhook
# Cloudinary: Create upload preset "nexus_market_unsigned"
# MongoDB: Ensure text index on products collection
```

---

## 📄 License

MIT — See LICENSE for details.

---

## 🙏 Credits

Built with Next.js, MongoDB, Paystack, Cloudinary, Zustand, TanStack Query, HeadlessUI, and Framer Motion.
