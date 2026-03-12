// src/app/api/chat/[conversationId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { ChatMessage, Conversation } from '@/models'
import { requireAuth } from '@/lib/auth/helpers'

type Params = { params: Promise<{ conversationId: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { conversationId } = await params

    const { session, error } = await requireAuth()
    if (error) return error

    await connectDB()

    const conv = await Conversation.findOne({
      _id: conversationId,
      participants: session!.user.id,
      isDeleted: false,
    })

    if (!conv)
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      )

    const messages = await ChatMessage.find({
      conversationId,
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .limit(100)
      .populate('senderId', 'username profile.avatarUrl')
      .lean()

    await ChatMessage.updateMany(
      {
        conversationId,
        senderId: { $ne: session!.user.id },
        isRead: false,
      },
      { isRead: true }
    )

    return NextResponse.json({ success: true, data: messages })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { conversationId } = await params

    const { session, error } = await requireAuth()
    if (error) return error

    const { content } = await req.json()
    if (!content?.trim())
      return NextResponse.json(
        { success: false, error: 'Message required' },
        { status: 400 }
      )

    await connectDB()

    const conv = await Conversation.findOne({
      _id: conversationId,
      participants: session!.user.id,
      isDeleted: false,
    })

    if (!conv)
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const message = await ChatMessage.create({
      conversationId,
      senderId: session!.user.id,
      senderRole: session!.user.role,
      content: content.trim(),
    })

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content.trim().slice(0, 100),
      lastMessageAt: new Date(),
    })

    return NextResponse.json({ success: true, data: message }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}