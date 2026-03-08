import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth/helpers'

export async function GET() {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()
    const user = await User.findById(session!.user.id).lean()
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

    return NextResponse.json({ success: true, data: { ...user, passwordHash: undefined } })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}

const UpdateProfileSchema = z.object({
  firstName:        z.string().max(50).optional(),
  lastName:         z.string().max(50).optional(),
  phoneNumber:      z.string().optional(),
  whatsapp:         z.string().optional(),
  bio:              z.string().max(300).optional(),
  isUsernamePublic: z.boolean().optional(),
  address: z.object({
    street:  z.string().optional(),
    city:    z.string().optional(),
    state:   z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
  avatarUrl:      z.string().url().optional(),
  avatarPublicId: z.string().optional(),
  preferences: z.object({
    notifications: z.boolean().optional(),
    newsletter:    z.boolean().optional(),
  }).optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const body  = await req.json()
    const parse = UpdateProfileSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: parse.error.flatten() }, { status: 400 })
    }

    await connectDB()

    const updates: Record<string, unknown> = {}
    const d = parse.data

    if (d.firstName !== undefined) updates['profile.firstName']   = d.firstName
    if (d.lastName  !== undefined) updates['profile.lastName']    = d.lastName
    if (d.phoneNumber !== undefined) updates['profile.phoneNumber'] = d.phoneNumber
    if (d.whatsapp  !== undefined) updates['profile.whatsapp']    = d.whatsapp
    if (d.bio       !== undefined) updates['profile.bio']         = d.bio
    if (d.avatarUrl !== undefined) updates['profile.avatarUrl']   = d.avatarUrl
    if (d.avatarPublicId !== undefined) updates['profile.avatarPublicId'] = d.avatarPublicId
    if (d.isUsernamePublic !== undefined) updates['isUsernamePublic'] = d.isUsernamePublic
    if (d.address) {
      for (const [k, v] of Object.entries(d.address)) {
        if (v !== undefined) updates[`profile.address.${k}`] = v
      }
    }
    if (d.preferences) {
      for (const [k, v] of Object.entries(d.preferences)) {
        if (v !== undefined) updates[`preferences.${k}`] = v
      }
    }

    const updated = await User.findByIdAndUpdate(session!.user.id, { $set: updates }, { new: true }).lean()
    return NextResponse.json({ success: true, data: { ...updated, passwordHash: undefined } })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 })
  }
}
