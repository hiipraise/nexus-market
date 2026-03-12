'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { RiSendPlaneLine, RiMessage2Line } from 'react-icons/ri'
import { LoadingSpinner } from '@/components/shared'
import { timeAgo } from '@/lib/utils'

export default function ChatWindow() {
  const { data: session }             = useSession()
  const qc                            = useQueryClient()
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [message, setMessage]         = useState('')
  const bottomRef                     = useRef<HTMLDivElement>(null)

  const { data: conversations, isLoading: convsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn:  () => axios.get('/api/chat').then(r => r.data.data),
    refetchInterval: 15_000,
  })

  const { data: messages, isLoading: msgsLoading } = useQuery({
    queryKey: ['messages', activeConvId],
    queryFn:  () => axios.get(`/api/chat/${activeConvId}`).then(r => r.data.data),
    enabled:  !!activeConvId,
    refetchInterval: 5_000,
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMutation = useMutation({
    mutationFn: () => axios.post(`/api/chat/${activeConvId}`, { content: message }),
    onSuccess:  () => {
      setMessage('')
      qc.invalidateQueries({ queryKey: ['messages', activeConvId] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  return (
    <div className="card overflow-hidden flex h-[calc(100vh-200px)] min-h-[400px]">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-white/10">
          <p className="text-gray-400 text-sm font-medium">Conversations</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <LoadingSpinner />
          ) : (conversations ?? []).length === 0 ? (
            <div className="p-6 text-center">
              <RiMessage2Line className="w-10 h-10 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-600 text-xs">No conversations yet</p>
            </div>
          ) : (
            (conversations ?? []).map((conv: any) => {
              const other = conv.participants?.find((p: any) => String(p._id) !== session?.user.id)
              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveConvId(conv._id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all text-left
                    ${activeConvId === conv._id ? 'bg-gold-500/10 border-r-2 border-gold-500' : ''}`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-purple flex-shrink-0 overflow-hidden flex items-center justify-center text-white text-xs font-bold">
                    {other?.profile?.avatarUrl
                      ? <Image src={other.profile.avatarUrl} alt="" width={36} height={36} className="w-full h-full object-cover" />
                      : other?.username?.[0]?.toUpperCase() ?? '?'
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 text-sm font-medium truncate">@{other?.username ?? 'User'}</p>
                    <p className="text-gray-600 text-xs truncate">{conv.lastMessage ?? 'No messages'}</p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        {!activeConvId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <RiMessage2Line className="w-16 h-16 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">Select a conversation to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgsLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  {(messages ?? []).map((msg: any) => {
                    const isMe = String(msg.senderId?._id ?? msg.senderId) === session?.user.id
                    return (
                      <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm
                          ${isMe
                            ? 'bg-gold-500 text-gray-950 font-medium rounded-br-sm'
                            : 'bg-white/10 text-gray-200 rounded-bl-sm'
                          }`}>
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-gray-800' : 'text-gray-500'}`}>
                            {timeAgo(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            <div className="border-t border-white/10 p-4 flex gap-2">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && message && sendMutation.mutate()}
                placeholder="Type a message…"
                className="input flex-1 py-2 text-sm"
              />
              <button
                onClick={() => sendMutation.mutate()}
                disabled={!message.trim() || sendMutation.isPending}
                className="btn-primary px-4 py-2 disabled:opacity-50"
              >
                <RiSendPlaneLine className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
