// src/app/api/ads/[id]/click/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Ad } from '@/models'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await connectDB()
  await Ad.findByIdAndUpdate(id, { $inc: { clicks: 1 } })

  return NextResponse.json({ success: true })
}