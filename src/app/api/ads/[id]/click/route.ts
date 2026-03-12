import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Ad } from '@/models'

type Params = { params: { id: string } }

export async function PATCH(_: NextRequest, { params }: Params) {
  try {
    await connectDB()
    await Ad.findByIdAndUpdate(params.id, { $inc: { clicks: 1 } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
