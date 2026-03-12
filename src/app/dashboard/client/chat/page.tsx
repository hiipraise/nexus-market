'use client'
import ChatWindow from '@/components/chat/ChatWindow'

export default function ClientChatPage() {
  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <h1 className="font-display font-bold text-2xl text-gray-100 mb-8">Messages</h1>
      <ChatWindow />
    </div>
  )
}
