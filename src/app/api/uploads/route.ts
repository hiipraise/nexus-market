import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/helpers'
import { uploadImage } from '@/lib/cloudinary'
import { cloudinaryConfig } from '@/config'

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const formData = await req.formData()
    const file     = formData.get('file') as File
    const folder   = (formData.get('folder') as string) ?? 'nexus_market/misc'

    if (!file) return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const result = await uploadImage(buffer, folder)

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 })
  }
}
