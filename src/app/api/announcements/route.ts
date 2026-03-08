import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import { Announcement } from '@/models'
import { requireAuth, getSession } from '@/lib/auth/helpers'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    await connectDB()

    const filter: Record<string, unknown> = {
      isActive:  true,
      isDeleted: false,
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: { $exists: false }   },
      ],
    }

    if (session?.user.role) {
      filter['targetRoles'] = {
        $in: [session.user.role, 'client'], // always show 'client' announcements
      }
    } else {
      filter['targetRoles'] = { $in: ['client'] }
    }

    const announcements = await Announcement.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    return NextResponse.json({ success: true, data: announcements })
  } catch (err) {
    console.error('[ANNOUNCEMENTS_GET]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch announcements' }, { status: 500 })
  }
}

const CreateSchema = z.object({
  title:       z.string().min(3).max(100),
  content:     z.string().min(10).max(2000),
  type:        z.enum(['info', 'warning', 'success', 'promo']).default('info'),
  targetRoles: z.array(z.enum(['client', 'vendor', 'admin', 'superadmin', 'support'])).min(1),
  expiresAt:   z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth(['admin', 'superadmin'])
    if (error) return error

    const body  = await req.json()
    const parse = CreateSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: parse.error.flatten() }, { status: 400 })
    }

    await connectDB()

    const announcement = await Announcement.create({
      ...parse.data,
      expiresAt: parse.data.expiresAt ? new Date(parse.data.expiresAt) : undefined,
      createdBy: session!.user.id,
    })

    return NextResponse.json({ success: true, data: announcement }, { status: 201 })
  } catch (err) {
    console.error('[ANNOUNCEMENTS_POST]', err)
    return NextResponse.json({ success: false, error: 'Failed to create announcement' }, { status: 500 })
  }
}
