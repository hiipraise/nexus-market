import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import User from '@/models/User'
import { hashPassword, hashAnswer } from '@/lib/utils'
import { secretQuestions } from '@/config'

const RegisterSchema = z.object({
  username:       z.string().min(3).max(30).regex(/^[a-z0-9_]+$/i),
  email:          z.string().email(),
  password:       z.string().min(8).max(72),
  secretQuestion: z.enum(secretQuestions as [string, ...string[]]),
  secretAnswer:   z.string().min(1).max(100),
  role:           z.enum(['client']).default('client'),
})

export async function POST(req: NextRequest) {
  try {
    const body  = await req.json()
    const parse = RegisterSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parse.error.flatten() },
        { status: 400 }
      )
    }

    const { username, email, password, secretQuestion, secretAnswer, role } = parse.data

    await connectDB()

    // Check uniqueness
    const existing = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email:    email.toLowerCase()    },
      ],
    }).setOptions({ includeDeleted: true })

    if (existing) {
      const field = existing.username === username.toLowerCase() ? 'username' : 'email'
      return NextResponse.json(
        { success: false, error: `This ${field} is already taken` },
        { status: 409 }
      )
    }

    const passwordHash  = await hashPassword(password)
    const hashedAnswer  = await hashAnswer(secretAnswer)

    const user = await User.create({
      username:  username.toLowerCase().trim(),
      email:     email.toLowerCase().trim(),
      passwordHash,
      role,
      security: {
        secretQuestion,
        secretAnswer: hashedAnswer,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        data: {
          id:       String(user._id),
          username: user.username,
          email:    user.email,
          role:     user.role,
        },
      },
      { status: 201 }
    )
  } catch (err: unknown) {
    console.error('[REGISTER]', err)
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
