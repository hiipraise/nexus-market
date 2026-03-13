// src/models/User.ts
import mongoose, { Schema, model, models } from 'mongoose'
import type { IUser } from '@/types'

const UserSchema = new Schema<IUser>(
  {
    username: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match:     /^[a-z0-9_]+$/,
    },
    email: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type:    String,
      enum:    ['client', 'vendor', 'admin', 'superadmin', 'support'],
      default: 'client',
    },
    isUsernamePublic: { type: Boolean, default: true },
    profile: {
      firstName:   { type: String, trim: true },
      lastName:    { type: String, trim: true },
      phoneNumber: { type: String },
      whatsapp:    { type: String },
      address: {
        street:  String,
        city:    String,
        state:   String,
        country: String,
        zipCode: String,
      },
      avatarUrl:      String,
      avatarPublicId: String,
      bio:            String,
    },
    security: {
      secretQuestion: { type: String, required: true },
      secretAnswer:   { type: String, required: true, select: false },
    },
    preferences: {
      notifications: { type: Boolean, default: true },
      newsletter:    { type: Boolean, default: false },
    },
    isActive:  { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject:{ virtuals: true },
  }
)

// Indexes
UserSchema.index({ username: 1 }, { unique: true })
UserSchema.index({ email: 1    }, { unique: true })
UserSchema.index({ isDeleted: 1 })
UserSchema.index({ role: 1 })

// Soft-delete guard — exclude deleted docs by default
UserSchema.pre(/^find/, function (this: mongoose.Query<unknown, IUser>, next) {
  if (!(this.getOptions() as { includeDeleted?: boolean }).includeDeleted) {
    this.where({ isDeleted: false })
  }
  next()
})

const User = models.User ?? model<IUser>('User', UserSchema)
export default User
