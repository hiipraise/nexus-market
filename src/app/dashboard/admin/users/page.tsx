'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks'
import { StatusBadge, LoadingSpinner, Pagination, ConfirmDialog } from '@/components/shared'
import { formatDate } from '@/lib/utils'
import { RiSearchLine } from 'react-icons/ri'

export default function AdminUsersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [actionUser, setActionUser] = useState<any>(null)
  const debSearch = useDebounce(search, 400)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', debSearch, page],
    queryFn:  () => axios.get(`/api/users/export?format=json&q=${debSearch}&page=${page}&limit=25`).then(r => r.data),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isSuspended }: { id: string; isSuspended: boolean }) =>
      axios.patch(`/api/users/${id}`, { isSuspended }),
    onSuccess: () => {
      toast.success('User updated')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setActionUser(null)
    },
    onError: () => toast.error('Failed'),
  })

  const users = data?.data ?? []
  const meta  = data?.meta

  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <h1 className="font-display font-bold text-2xl text-gray-100 mb-8">Users</h1>

      <div className="relative mb-6 max-w-xs">
        <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search username or email…" className="input pl-11 text-sm py-2" />
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-500">
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Role</th>
                <th className="text-left p-4 font-medium hidden sm:table-cell">Joined</th>
                <th className="text-center p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u._id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="p-4">
                    <p className="text-gray-200 font-medium">@{u.username}</p>
                    <p className="text-gray-600 text-xs">{u.email}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell"><StatusBadge status={u.role} /></td>
                  <td className="p-4 text-gray-500 text-xs hidden sm:table-cell">{formatDate(u.createdAt)}</td>
                  <td className="p-4 text-center"><StatusBadge status={u.isSuspended ? 'suspended' : 'active'} /></td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setActionUser(u)}
                      className={`text-xs ${u.isSuspended ? 'text-green-400' : 'text-red-400'} hover:underline`}
                    >
                      {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />}

      <ConfirmDialog
        isOpen={!!actionUser}
        onClose={() => setActionUser(null)}
        onConfirm={() => toggleMutation.mutate({ id: actionUser._id, isSuspended: !actionUser.isSuspended })}
        title={actionUser?.isSuspended ? 'Unsuspend User' : 'Suspend User'}
        message={`Are you sure you want to ${actionUser?.isSuspended ? 'unsuspend' : 'suspend'} @${actionUser?.username}?`}
        danger={!actionUser?.isSuspended}
        loading={toggleMutation.isPending}
      />
    </div>
  )
}
