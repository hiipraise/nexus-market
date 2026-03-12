// ================================================================
// NEXUS MARKET — CORE TYPES
// ================================================================

import { Types } from 'mongoose'

// ── Enums ────────────────────────────────────────────────────────

export type UserRole = 'client' | 'vendor' | 'admin' | 'superadmin' | 'support'

export type VendorStatus = 'pending' | 'verified' | 'suspended' | 'banned'

export type ProductStatus = 'active' | 'inactive' | 'suspended' | 'deleted'

export type OrderStatus =
  | 'pending'
  | 'payment_confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refunded'

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded'

export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed'

export type ReportStatus = 'open' | 'under_review' | 'resolved' | 'dismissed'

export type ReportEntityType = 'product' | 'vendor' | 'review'

export type NotificationType =
  | 'order_placed'
  | 'order_status_update'
  | 'payment_received'
  | 'low_stock'
  | 'new_review'
  | 'vendor_verified'
  | 'report_update'
  | 'payout_processed'
  | 'new_message'
  | 'cart_shared'
  | 'announcement'
  | 'return_requested'
  | 'refund_processed'

export type AdType = 'banner' | 'carousel' | 'featured'

export type DiscountType = 'percentage' | 'fixed'

export type GenderCategory = 'male' | 'female' | 'kids' | 'unisex'

// ── User ─────────────────────────────────────────────────────────

export interface IUser {
  _id: Types.ObjectId | string
  username:          string
  email:             string
  passwordHash:      string
  role:              UserRole
  isUsernamePublic:  boolean
  profile: {
    firstName?:   string
    lastName?:    string
    phoneNumber?: string
    whatsapp?:    string
    address?: {
      street?:   string
      city?:     string
      state?:    string
      country?:  string
      zipCode?:  string
    }
    avatarUrl?:      string
    avatarPublicId?: string
    bio?:            string
  }
  security: {
    secretQuestion: string
    secretAnswer:   string   // hashed
  }
  preferences: {
    notifications: boolean
    newsletter:    boolean
  }
  isActive:    boolean
  isDeleted:   boolean
  deletedAt?:  Date
  createdAt:   Date
  updatedAt:   Date
}

// ── Vendor ───────────────────────────────────────────────────────

export interface IVendor {
  _id: Types.ObjectId | string
  userId:       Types.ObjectId | string
  businessName: string
  description:  string
  phone:        string
  whatsapp:     string
  profilePic?:  string
  profilePicPublicId?: string
  status:       VendorStatus
  verificationSubmittedAt?: Date
  verifiedAt?:  Date
  verifiedBy?:  Types.ObjectId | string
  badge:        boolean
  ratings: {
    average: number
    count:   number
  }
  totalSales:    number
  totalRevenue:  number
  balance:       number   // available for payout (kobo)
  isDeleted:     boolean
  deletedAt?:    Date
  createdAt:     Date
  updatedAt:     Date
}

// ── Category ─────────────────────────────────────────────────────

export interface ICategory {
  _id:         Types.ObjectId | string
  name:        string
  slug:        string
  description?: string
  imageUrl?:   string
  parent?:     Types.ObjectId | string
  isActive:    boolean
  isDeleted:   boolean
  deletedAt?:  Date
  createdAt:   Date
  updatedAt:   Date
}

// ── Product ──────────────────────────────────────────────────────

export interface IProductVariant {
  size:     string
  quantity: number
  sku?:     string
}

export interface IProductImage {
  url:       string
  publicId:  string
  isPrimary: boolean
  alt?:      string
}

export interface IProduct {
  _id: Types.ObjectId | string
  vendorId:     Types.ObjectId | string
  name:         string
  slug:         string
  description:  string
  shortDesc?:   string
  categories:   (Types.ObjectId | string)[]
  gender:       GenderCategory
  images:       IProductImage[]
  variants:     IProductVariant[]
  basePrice:    number    // in kobo
  discountPrice?: number  // in kobo
  discountType?: DiscountType
  discountValue?: number  // percentage or fixed kobo
  discountExpiry?: Date
  isBlackFriday: boolean
  tags:          string[]
  status:        ProductStatus
  views:         number
  searches:      number
  purchases:     number
  ratings: {
    average: number
    count:   number
  }
  isDeleted:   boolean
  deletedAt?:  Date
  createdAt:   Date
  updatedAt:   Date
  // SEO
  metaTitle?:       string
  metaDescription?: string
}

// ── Order ────────────────────────────────────────────────────────

export interface IOrderItem {
  productId:    Types.ObjectId | string
  vendorId:     Types.ObjectId | string
  name:         string
  imageUrl:     string
  size:         string
  quantity:     number
  priceAtOrder: number    // kobo
  vendorAmount: number    // kobo after fee
  platformFee:  number    // kobo
}

export interface IOrderTracking {
  status:    OrderStatus
  note?:     string
  timestamp: Date
  updatedBy?: Types.ObjectId | string
}

export interface IOrder {
  _id: Types.ObjectId | string
  orderNumber:  string
  userId?:      Types.ObjectId | string   // null for guests
  guestInfo?: {
    email:   string
    name:    string
    phone:   string
  }
  items:          IOrderItem[]
  shippingAddress: {
    name:     string
    phone:    string
    street:   string
    city:     string
    state:    string
    country:  string
    zipCode?: string
  }
  subtotal:       number   // kobo
  platformFee:    number   // kobo
  shippingFee:    number   // kobo
  total:          number   // kobo
  paymentStatus:  PaymentStatus
  paystackRef?:   string
  paystackData?:  Record<string, unknown>
  orderStatus:    OrderStatus
  tracking:       IOrderTracking[]
  returnReason?:  string
  returnStatus?:  'requested' | 'approved' | 'rejected' | 'completed'
  refundAmount?:  number
  isDeleted:      boolean
  deletedAt?:     Date
  createdAt:      Date
  updatedAt:      Date
}

// ── Cart ─────────────────────────────────────────────────────────

export interface ICartItem {
  productId: Types.ObjectId | string
  size:      string
  quantity:  number
  name?:         string
  imageUrl?:     string
  vendorName?:   string
  basePrice?:    number
  discountPrice?: number
}

export interface ICart {
  _id: Types.ObjectId | string
  userId?:  Types.ObjectId | string
  shareId?: string               // for shareable carts
  items:    ICartItem[]
  expiresAt?: Date
  isDeleted:  boolean
  deletedAt?: Date
  createdAt:  Date
  updatedAt:  Date
}

// ── Review ───────────────────────────────────────────────────────

export interface IReview {
  _id: Types.ObjectId | string
  productId:  Types.ObjectId | string
  vendorId:   Types.ObjectId | string
  userId:     Types.ObjectId | string
  orderId:    Types.ObjectId | string
  rating:     1 | 2 | 3 | 4 | 5
  title?:     string
  body:       string
  images?:    string[]
  isDeleted:  boolean
  deletedAt?: Date
  createdAt:  Date
  updatedAt:  Date
}

// ── Report ───────────────────────────────────────────────────────

export interface IReport {
  _id: Types.ObjectId | string
  reportedBy:   Types.ObjectId | string
  entityType:   ReportEntityType
  entityId:     Types.ObjectId | string
  reason:       string
  details?:     string
  status:       ReportStatus
  reviewedBy?:  Types.ObjectId | string
  resolution?:  string
  isDeleted:    boolean
  createdAt:    Date
  updatedAt:    Date
}

// ── Ad ───────────────────────────────────────────────────────────

export interface IAd {
  _id: Types.ObjectId | string
  vendorId:   Types.ObjectId | string
  productId?: Types.ObjectId | string
  type:       AdType
  title:      string
  imageUrl:   string
  imagePublicId: string
  linkUrl?:   string
  isActive:   boolean
  startsAt:   Date
  endsAt:     Date
  clicks:     number
  impressions: number
  isDeleted:  boolean
  deletedAt?: Date
  createdAt:  Date
  updatedAt:  Date
}

// ── Discount ─────────────────────────────────────────────────────

export interface IDiscount {
  _id: Types.ObjectId | string
  vendorId:   Types.ObjectId | string
  code:       string
  type:       DiscountType
  value:      number
  minOrder?:  number    // kobo
  maxUses?:   number
  usedCount:  number
  isActive:   boolean
  startsAt:   Date
  endsAt:     Date
  isDeleted:  boolean
  deletedAt?: Date
  createdAt:  Date
  updatedAt:  Date
}

// ── Notification ─────────────────────────────────────────────────

export interface INotification {
  _id: Types.ObjectId | string
  userId:    Types.ObjectId | string
  type:      NotificationType
  title:     string
  message:   string
  data?:     Record<string, unknown>
  isRead:    boolean
  isDeleted: boolean
  createdAt: Date
}

// ── Chat ─────────────────────────────────────────────────────────

export interface IChatMessage {
  _id: Types.ObjectId | string
  conversationId: Types.ObjectId | string
  senderId:       Types.ObjectId | string
  senderRole:     UserRole
  content:        string
  attachments?:   string[]
  isRead:         boolean
  isDeleted:      boolean
  createdAt:      Date
}

export interface IConversation {
  _id: Types.ObjectId | string
  participants:    (Types.ObjectId | string)[]
  lastMessage?:    string
  lastMessageAt?:  Date
  isDeleted:       boolean
  createdAt:       Date
  updatedAt:       Date
}

// ── Payout ───────────────────────────────────────────────────────

export interface IPayout {
  _id: Types.ObjectId | string
  vendorId:      Types.ObjectId | string
  amount:        number     // kobo
  status:        PayoutStatus
  reference:     string
  bankCode?:     string
  accountNumber?: string
  accountName?:  string
  processedAt?:  Date
  processedBy?:  Types.ObjectId | string
  notes?:        string
  isDeleted:     boolean
  deletedAt?:    Date
  createdAt:     Date
  updatedAt:     Date
}

// ── Announcement ─────────────────────────────────────────────────

export interface IAnnouncement {
  _id: Types.ObjectId | string
  title:       string
  content:     string
  type:        'info' | 'warning' | 'success' | 'promo'
  targetRoles: UserRole[]
  isActive:    boolean
  expiresAt?:  Date
  createdBy:   Types.ObjectId | string
  isDeleted:   boolean
  deletedAt?:  Date
  createdAt:   Date
  updatedAt:   Date
}

// ── API Response Helpers ─────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?:   T
  error?:  string
  message?: string
  meta?: {
    page:       number
    limit:      number
    total:      number
    totalPages: number
  }
}

export interface PaginationQuery {
  page?:  number
  limit?: number
  sort?:  string
  order?: 'asc' | 'desc'
}
