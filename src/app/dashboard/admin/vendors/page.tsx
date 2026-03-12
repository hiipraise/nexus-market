'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { StatusBadge, LoadingSpinner, Pagination, ConfirmDialog, Modal } from '@/components/shared'
import { formatDate } from '@/lib/utils'
import { useDebounce } from '@/hooks'
import { RiSearchLine } from 'react-icons/ri'

export default function AdminVendorsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [actionVendor, setActionVendor] = useState<any>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'ban' | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const deb = useDebounce(search, 400)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vendors', deb, statusFilter, page],
    queryFn:  () => axios.get(`/api/vendors?q=${deb}&status=${statusFilter}&page=${page}&limit=20&admin=true`).then(r => r.data),
  })

  const actionMutation = useMutation({
    mutationFn: () => axios.patch('/api/vendors/verify', {
      vendorId: actionVendor._id,
      action:   actionType,
      reason:   rejectReason || undefined,
    }),
    onSuccess: () => {
      toast.success(`Vendor ${actionType}d`)
      qc.invalidateQueries({ queryKey: ['admin-vendors'] })
      setActionVendor(null); setActionType(null); setRejectReason('')
    },
    onError: () => toast.error('Failed'),
  })

  const vendors = data?.data ?? []
  const meta    = data?.meta

  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <h1 className="font-display font-bold text-2xl text-gray-100 mb-8">Vendors</h1>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="input pl-9 text-sm py-2 w-48" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input text-sm py-2 w-auto">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-500">
                <th className="text-left p-4 font-medium">Vendor</th>
                <th className="text-left p-4 font-medium hidden sm:table-cell">Submitted</th>
                <th className="text-center p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v: any) => (
                <tr key={v._id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="p-4">
                    <p className="text-gray-200 font-medium">{v.businessName}</p>
                    <p className="text-gray-600 text-xs">@{v.userId?.username}</p>
                  </td>
                  <td className="p-4 text-gray-500 text-xs hidden sm:table-cell">
                    {v.verificationSubmittedAt ? formatDate(v.verificationSubmittedAt) : '—'}
                  </td>
                  <td className="p-4 text-center"><StatusBadge status={v.status} /></td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {v.status === 'pending' && (
                        <>
                          <button onClick={() => { setActionVendor(v); setActionType('approve') }} className="text-green-400 text-xs hover:underline">Approve</button>
                          <button onClick={() => { setActionVendor(v); setActionType('reject') }} className="text-red-400 text-xs hover:underline">Reject</button>
                        </>
                      )}
                      {v.status === 'verified' && (
                        <button onClick={() => { setActionVendor(v); setActionType('ban') }} className="text-red-400 text-xs hover:underline">Ban</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />}

      <ConfirmDialog
        isOpen={!!actionVendor && actionType !== 'reject'}
        onClose={() => { setActionVendor(null); setActionType(null) }}
        onConfirm={() => actionMutation.mutate()}
        title={`${actionType === 'approve' ? 'Approve' : 'Ban'} Vendor`}
        message={`Are you sure you want to ${actionType} ${actionVendor?.businessName}?`}
        danger={actionType === 'ban'}
        loading={actionMutation.isPending}
      />

      <Modal isOpen={actionType === 'reject'} onClose={() => { setActionVendor(null); setActionType(null) }} title="Reject Vendor" size="sm">
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">Provide a reason for rejection (sent to vendor):</p>
          <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} className="input resize-none" />
          <button onClick={() => actionMutation.mutate()} disabled={actionMutation.isPending} className="btn-primary w-full justify-center py-3">
            {actionMutation.isPending ? 'Rejecting…' : 'Confirm Rejection'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
