'use client'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { RiAddLine, RiDeleteBin2Line } from 'react-icons/ri'
import { StatusBadge, LoadingSpinner } from '@/components/shared'
import { formatDate } from '@/lib/utils'

export default function AnnouncementsPage() {
  const qc = useQueryClient()
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn:  () => axios.get('/api/announcements').then(r => r.data.data),
  })

  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-2xl text-gray-100">Announcements</h1>
        <Link href="/dashboard/admin/announcements/new" className="btn-primary text-sm">
          <RiAddLine className="w-4 h-4" /> New Announcement
        </Link>
      </div>
      {isLoading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {(announcements ?? []).length === 0 && <div className="card p-12 text-center text-gray-500">No announcements yet.</div>}
          {(announcements ?? []).map((a: any) => (
            <div key={a._id} className="card p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={a.type} />
                  <p className="text-gray-200 font-medium">{a.title}</p>
                </div>
                <p className="text-gray-500 text-sm line-clamp-1">{a.content}</p>
                <p className="text-gray-600 text-xs mt-1">
                  For: {a.targetRoles?.join(', ')} · Expires: {a.expiresAt ? formatDate(a.expiresAt) : 'Never'}
                </p>
              </div>
              <StatusBadge status={a.isActive ? 'active' : 'inactive'} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
