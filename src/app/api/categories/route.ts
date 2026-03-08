import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import { Category } from '@/models'
import { requireAuth } from '@/lib/auth/helpers'
import { createSlug } from '@/lib/utils'

export async function GET() {
  try {
    await connectDB()
    const categories = await Category.find({ isActive: true, isDeleted: false }).sort({ name: 1 }).lean()
    return NextResponse.json({ success: true, data: categories })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 })
  }
}

const CreateCategorySchema = z.object({
  name:        z.string().min(2).max(60),
  description: z.string().optional(),
  imageUrl:    z.string().url().optional(),
  parent:      z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAuth(['admin', 'superadmin'])
    if (error) return error

    const body  = await req.json()
    const parse = CreateCategorySchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json({ success: false, error: 'Validation failed' }, { status: 400 })
    }

    await connectDB()

    const slug     = createSlug(parse.data.name)
    const category = await Category.create({ ...parse.data, slug })

    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 })
  }
}
