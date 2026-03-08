import { getServerSession } from 'next-auth'
import { authOptions } from './options'
import type { UserRole } from '@/types'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function getSession() {
  return getServerSession(authOptions)
}

export async function requireAuth(allowedRoles?: UserRole[]) {
  const session = await getSession()
  if (!session) {
    return { session: null, error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) }
  }
  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return { session: null, error: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }) }
  }
  return { session, error: null }
}

export function isAdmin(role: UserRole) {
  return role === 'admin' || role === 'superadmin'
}

export function isVendorOrAdmin(role: UserRole) {
  return ['vendor', 'admin', 'superadmin'].includes(role)
}

export function canModerate(role: UserRole) {
  return ['admin', 'superadmin', 'support'].includes(role)
}
