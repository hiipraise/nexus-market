// src/models/index.ts
import { Schema, model, models } from 'mongoose'
import type {
  IVendor, ICategory, IProduct, IOrder, ICart,
  IReview, IReport, INotification, IChatMessage,
  IConversation, IPayout, IAd, IDiscount, IAnnouncement,
} from '@/types'

// ── Vendor ────────────────────────────────────────────────────────
const VendorSchema = new Schema<IVendor>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    phone:       { type: String, required: true },
    whatsapp:    { type: String, required: true },
    profilePic:  String,
    profilePicPublicId: String,
    status: {
      type:    String,
      enum:    ['pending', 'verified', 'suspended', 'banned'],
      default: 'pending',
    },
    verificationSubmittedAt: Date,
    verifiedAt:   Date,
    verifiedBy:   { type: Schema.Types.ObjectId, ref: 'User' },
    badge:        { type: Boolean, default: false },
    ratings: {
      average: { type: Number, default: 0 },
      count:   { type: Number, default: 0 },
    },
    totalSales:   { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    balance:      { type: Number, default: 0 },
    isDeleted:    { type: Boolean, default: false },
    deletedAt:    Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)
VendorSchema.index({ userId: 1 })
VendorSchema.index({ status: 1 })
VendorSchema.index({ isDeleted: 1 })
VendorSchema.pre(/^find/, function (this: any, next) {
  if (!this.getOptions().includeDeleted) this.where({ isDeleted: false })
  next()
})
export const Vendor = models.Vendor ?? model<IVendor>('Vendor', VendorSchema)

// ── Category ──────────────────────────────────────────────────────
const CategorySchema = new Schema<ICategory>(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    slug:        { type: String, required: true, unique: true },
    description: String,
    imageUrl:    String,
    parent:      { type: Schema.Types.ObjectId, ref: 'Category' },
    isActive:    { type: Boolean, default: true },
    isDeleted:   { type: Boolean, default: false },
    deletedAt:   Date,
  },
  { timestamps: true }
)
export const Category = models.Category ?? model<ICategory>('Category', CategorySchema)

// ── Product ───────────────────────────────────────────────────────
const ProductImageSchema = new Schema({
  url:       { type: String, required: true },
  publicId:  { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
  alt:       String,
}, { _id: false })

const ProductVariantSchema = new Schema({
  size:     { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  sku:      String,
}, { _id: false })

const ProductSchema = new Schema<IProduct>(
  {
    vendorId:     { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    name:         { type: String, required: true, trim: true },
    slug:         { type: String, required: true },
    description:  { type: String, required: true },
    shortDesc:    String,
    categories:   [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    gender: {
      type: String,
      enum: ['male', 'female', 'kids', 'unisex'],
      default: 'unisex',
    },
    images:       [ProductImageSchema],
    variants:     [ProductVariantSchema],
    basePrice:    { type: Number, required: true, min: 0 },
    discountPrice: Number,
    discountType:  { type: String, enum: ['percentage', 'fixed'] },
    discountValue: Number,
    discountExpiry: Date,
    isBlackFriday: { type: Boolean, default: false },
    tags:          [String],
    status: {
      type:    String,
      enum:    ['active', 'inactive', 'suspended', 'deleted'],
      default: 'active',
    },
    views:     { type: Number, default: 0 },
    searches:  { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    ratings: {
      average: { type: Number, default: 0 },
      count:   { type: Number, default: 0 },
    },
    metaTitle:       String,
    metaDescription: String,
    isDeleted:  { type: Boolean, default: false },
    deletedAt:  Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)
ProductSchema.index({ vendorId: 1 })
ProductSchema.index({ slug: 1 })
ProductSchema.index({ categories: 1 })
ProductSchema.index({ gender: 1 })
ProductSchema.index({ basePrice: 1 })
ProductSchema.index({ views: -1 })
ProductSchema.index({ purchases: -1 })
ProductSchema.index({ 'ratings.average': -1 })
ProductSchema.index({ isDeleted: 1, status: 1 })
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' })
ProductSchema.pre(/^find/, function (this: any, next) {
  if (!this.getOptions().includeDeleted) this.where({ isDeleted: false })
  next()
})
export const Product = models.Product ?? model<IProduct>('Product', ProductSchema)

// ── Order ─────────────────────────────────────────────────────────
const OrderItemSchema = new Schema({
  productId:    { type: Schema.Types.ObjectId, ref: 'Product' },
  vendorId:     { type: Schema.Types.ObjectId, ref: 'Vendor'  },
  name:         String,
  imageUrl:     String,
  size:         String,
  quantity:     Number,
  priceAtOrder: Number,
  vendorAmount: Number,
  platformFee:  Number,
}, { _id: false })

const TrackingSchema = new Schema({
  status:    String,
  note:      String,
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { _id: false })

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber:  { type: String, required: true, unique: true },
    userId:       { type: Schema.Types.ObjectId, ref: 'User'  },
    guestInfo: {
      email: String,
      name:  String,
      phone: String,
    },
    items:           [OrderItemSchema],
    shippingAddress: {
      name:    String,
      phone:   String,
      street:  String,
      city:    String,
      state:   String,
      country: String,
      zipCode: String,
    },
    subtotal:      { type: Number, required: true },
    platformFee:   { type: Number, required: true },
    shippingFee:   { type: Number, default: 0 },
    total:         { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending','success','failed','refunded'], default: 'pending' },
    paystackRef:   String,
    paystackData:  Schema.Types.Mixed,
    orderStatus:   { type: String, enum: ['pending','payment_confirmed','processing','shipped','out_for_delivery','delivered','cancelled','return_requested','returned','refunded'], default: 'pending' },
    tracking:      [TrackingSchema],
    returnReason:  String,
    returnStatus:  { type: String, enum: ['requested','approved','rejected','completed'] },
    refundAmount:  Number,
    isDeleted:     { type: Boolean, default: false },
    deletedAt:     Date,
  },
  { timestamps: true }
)
OrderSchema.index({ userId: 1 })
OrderSchema.index({ orderNumber: 1 })
OrderSchema.index({ 'items.vendorId': 1 })
OrderSchema.index({ paymentStatus: 1 })
OrderSchema.index({ orderStatus: 1 })
export const Order = models.Order ?? model<IOrder>('Order', OrderSchema)

// ── Cart ──────────────────────────────────────────────────────────
const CartSchema = new Schema<ICart>(
  {
    userId:   { type: Schema.Types.ObjectId, ref: 'User' },
    shareId:  { type: String, unique: true, sparse: true },
    items: [{
      productId: { type: Schema.Types.ObjectId, ref: 'Product' },
      size:      String,
      quantity:  Number,
    }],
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)
export const Cart = models.Cart ?? model<ICart>('Cart', CartSchema)

// ── Review ────────────────────────────────────────────────────────
const ReviewSchema = new Schema<IReview>(
  {
    productId:  { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    vendorId:   { type: Schema.Types.ObjectId, ref: 'Vendor',  required: true },
    userId:     { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    orderId:    { type: Schema.Types.ObjectId, ref: 'Order',   required: true },
    rating:     { type: Number, required: true, min: 1, max: 5 },
    title:      String,
    body:       { type: String, required: true },
    images:     [String],
    isDeleted:  { type: Boolean, default: false },
    deletedAt:  Date,
  },
  { timestamps: true }
)
ReviewSchema.index({ productId: 1 })
ReviewSchema.index({ vendorId: 1  })
ReviewSchema.index({ userId: 1    })
export const Review = models.Review ?? model<IReview>('Review', ReviewSchema)

// ── Report ────────────────────────────────────────────────────────
const ReportSchema = new Schema<IReport>(
  {
    reportedBy:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    entityType:  { type: String, enum: ['product','vendor','review'], required: true },
    entityId:    { type: Schema.Types.ObjectId, required: true },
    reason:      { type: String, required: true },
    details:     String,
    status: {
      type:    String,
      enum:    ['open','under_review','resolved','dismissed'],
      default: 'open',
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolution: String,
    isDeleted:  { type: Boolean, default: false },
  },
  { timestamps: true }
)
ReportSchema.index({ entityType: 1, entityId: 1 })
ReportSchema.index({ status: 1 })
export const Report = models.Report ?? model<IReport>('Report', ReportSchema)

// ── Notification ──────────────────────────────────────────────────
const NotificationSchema = new Schema<INotification>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type:      { type: String, required: true },
    title:     { type: String, required: true },
    message:   { type: String, required: true },
    data:      Schema.Types.Mixed,
    isRead:    { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true } }
)
NotificationSchema.index({ userId: 1, isRead: 1 })
export const Notification = models.Notification ?? model<INotification>('Notification', NotificationSchema)

// ── Chat ──────────────────────────────────────────────────────────
const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastMessage:    String,
    lastMessageAt:  Date,
    isDeleted:      { type: Boolean, default: false },
  },
  { timestamps: true }
)
export const Conversation = models.Conversation ?? model<IConversation>('Conversation', ConversationSchema)

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole:     { type: String, required: true },
    content:        { type: String, required: true },
    attachments:    [String],
    isRead:         { type: Boolean, default: false },
    isDeleted:      { type: Boolean, default: false },
  },
  { timestamps: true }
)
ChatMessageSchema.index({ conversationId: 1 })
export const ChatMessage = models.ChatMessage ?? model<IChatMessage>('ChatMessage', ChatMessageSchema)

// ── Payout ────────────────────────────────────────────────────────
const PayoutSchema = new Schema<IPayout>(
  {
    vendorId:      { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    amount:        { type: Number, required: true },
    status: {
      type:    String,
      enum:    ['pending','processing','paid','failed'],
      default: 'pending',
    },
    reference:     { type: String, required: true, unique: true },
    bankCode:      String,
    accountNumber: String,
    accountName:   String,
    processedAt:   Date,
    processedBy:   { type: Schema.Types.ObjectId, ref: 'User' },
    notes:         String,
    isDeleted:     { type: Boolean, default: false },
    deletedAt:     Date,
  },
  { timestamps: true }
)
PayoutSchema.index({ vendorId: 1 })
export const Payout = models.Payout ?? model<IPayout>('Payout', PayoutSchema)

// ── Ad ────────────────────────────────────────────────────────────
const AdSchema = new Schema<IAd>(
  {
    vendorId:   { type: Schema.Types.ObjectId, ref: 'Vendor',  required: true },
    productId:  { type: Schema.Types.ObjectId, ref: 'Product' },
    type: {
      type: String,
      enum: ['banner','carousel','featured'],
      required: true,
    },
    title:         { type: String, required: true },
    imageUrl:      { type: String, required: true },
    imagePublicId: { type: String, required: true },
    linkUrl:       String,
    isActive:      { type: Boolean, default: true },
    startsAt:      { type: Date, required: true },
    endsAt:        { type: Date, required: true },
    clicks:        { type: Number, default: 0 },
    impressions:   { type: Number, default: 0 },
    isDeleted:     { type: Boolean, default: false },
    deletedAt:     Date,
  },
  { timestamps: true }
)
AdSchema.index({ type: 1, isActive: 1 })
export const Ad = models.Ad ?? model<IAd>('Ad', AdSchema)

// ── Discount ──────────────────────────────────────────────────────
const DiscountSchema = new Schema<IDiscount>(
  {
    vendorId:  { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    code:      { type: String, required: true, uppercase: true },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    value:     { type: Number, required: true },
    minOrder:  Number,
    maxUses:   Number,
    usedCount: { type: Number, default: 0 },
    isActive:  { type: Boolean, default: true },
    startsAt:  { type: Date, required: true },
    endsAt:    { type: Date, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
)
DiscountSchema.index({ vendorId: 1, code: 1 }, { unique: true })
export const Discount = models.Discount ?? model<IDiscount>('Discount', DiscountSchema)

// ── Announcement ──────────────────────────────────────────────────
const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title:       { type: String, required: true },
    content:     { type: String, required: true },
    type: {
      type:    String,
      enum:    ['info','warning','success','promo'],
      default: 'info',
    },
    targetRoles: [{ type: String }],
    isActive:    { type: Boolean, default: true },
    expiresAt:   Date,
    createdBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted:   { type: Boolean, default: false },
    deletedAt:   Date,
  },
  { timestamps: true }
)
export const Announcement = models.Announcement ?? model<IAnnouncement>('Announcement', AnnouncementSchema)
