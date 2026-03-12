'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { StatusBadge, LoadingSpinner, Pagination, Modal } from '@/components/shared'
import { formatDate } from '@/lib/utils'

export default function AdminReportsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<any>(null)
  const [notes, setNotes] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', page],
    queryFn:  () => axios.get(`/api/reports?page=${page}&limit=20`).then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: (status: string) => axios.patch(`/api/reports/${selected._id}`, { status, notes }),
    onSuccess: () => {
      toast.success('Report updated')
      qc.invalidateQueries({ queryKey: ['admin-reports'] })
      setSelected(null); setNotes('')
    },
    onError: () => toast.error('Failed'),
  })

  const reports = data?.data ?? []
  const meta    = data?.meta

  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <h1 className="font-display font-bold text-2xl text-gray-100 mb-8">Reports</h1>

      {isLoading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-500">
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">Reason</th>
                <th className="text-left p-4 font-medium hidden sm:table-cell">Date</th>
                <th className="text-center p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r: any) => (
                <tr key={r._id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="p-4 capitalize text-gray-400">{r.entityType}</td>
                  <td className="p-4 text-gray-300 max-w-[180px] truncate">{r.reason}</td>
                  <td className="p-4 text-gray-500 text-xs hidden sm:table-cell">{formatDate(r.createdAt)}</td>
                  <td className="p-4 text-center"><StatusBadge status={r.status} /></td>
                  <td className="p-4 text-right">
                    <button onClick={() => { setSelected(r); setNotes(r.adminNotes ?? '') }} className="text-gold-400 text-xs hover:underline">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />}

      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setNotes('') }} title="Review Report" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4 space-y-1 text-sm">
              <p><span className="text-gray-500">Type:</span> <span className="text-gray-200 capitalize">{selected.entityType}</span></p>
              <p><span className="text-gray-500">Reason:</span> <span className="text-gray-200">{selected.reason}</span></p>
              {selected.details && <p><span className="text-gray-500">Details:</span> <span className="text-gray-300">{selected.details}</span></p>}
              <p><span className="text-gray-500">Reporter:</span> <span className="text-gray-200">@{selected.reportedBy?.username ?? 'Unknown'}</span></p>
            </div>
            <div>
              <label className="input-label">Admin Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="input resize-none" placeholder="Internal notes (not shown to users)" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => updateMutation.mutate('under_review')} disabled={updateMutation.isPending} className="btn-secondary flex-1 text-sm">Mark Under Review</button>
              <button onClick={() => updateMutation.mutate('resolved')} disabled={updateMutation.isPending} className="btn-primary flex-1 text-sm">Resolve</button>
              <button onClick={() => updateMutation.mutate('dismissed')} disabled={updateMutation.isPending} className="btn-ghost flex-1 text-sm text-gray-500">Dismiss</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
