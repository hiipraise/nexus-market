import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Conversation, ChatMessage } from '@/models'
import { requireAuth } from '@/lib/auth/helpers'
import { getPaginationMeta, parsePagination } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error
    await connectDB()
    const conversations = await Conversation.find({
      participants: session!.user.id,
      isDeleted: false,
    }).sort({ lastMessageAt: -1 }).limit(20)
      .populate('participants', 'username profile.avatarUrl').lean()
    return NextResponse.json({ success: true, data: conversations })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error
    const { recipientId, content } = await req.json()
    if (!recipientId || !content) return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
    await connectDB()
    let conv = await Conversation.findOne({
      participants: { $all: [session!.user.id, recipientId] },
      isDeleted: false,
    })
    if (!conv) {
      conv = await Conversation.create({ participants: [session!.user.id, recipientId] })
    }
    const msg = await ChatMessage.create({
      conversationId: conv._id,
      senderId: session!.user.id,
      senderRole: session!.user.role,
      content,
    })
    await Conversation.findByIdAndUpdate(conv._id, { lastMessage: content, lastMessageAt: new Date() })
    return NextResponse.json({ success: true, data: msg }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}
