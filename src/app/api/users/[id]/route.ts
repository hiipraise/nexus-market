import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth/helpers'

type Params = { params: { id: string } }

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { error } = await requireAuth(['admin', 'superadmin', 'support'])
    if (error) return error
    await connectDB()
    const user = await User.findById(params.id).lean()
    if (!user) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: { ...user, passwordHash: undefined } })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { session, error } = await requireAuth(['admin', 'superadmin'])
    if (error) return error
    const body = await req.json()

    // Prevent non-superadmin from modifying superadmins
    await connectDB()
    const target = await User.findById(params.id).lean()
    if (!target) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    if ((target as any).role === 'superadmin' && session!.user.role !== 'superadmin') {
      return NextResponse.json({ success: false, error: 'Cannot modify superadmin' }, { status: 403 })
    }

    const allowed: Record<string, unknown> = {}
    if (body.isSuspended !== undefined) allowed['isSuspended'] = body.isSuspended
    if (body.role        !== undefined && session!.user.role === 'superadmin') allowed['role'] = body.role
    if (body.isDeleted   !== undefined) allowed['isDeleted']   = body.isDeleted

    const updated = await User.findByIdAndUpdate(params.id, allowed, { new: true }).lean()
    return NextResponse.json({ success: true, data: { ...(updated as any), passwordHash: undefined } })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
