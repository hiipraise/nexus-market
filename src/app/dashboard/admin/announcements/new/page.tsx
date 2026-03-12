'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'

const ROLES = ['client', 'vendor', 'admin', 'superadmin', 'support']

export default function NewAnnouncementPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '', content: '', type: 'info', targetRoles: ['client'], expiresAt: '',
  })

  const mutation = useMutation({
    mutationFn: () => axios.post('/api/announcements', form),
    onSuccess:  () => { toast.success('Announcement posted!'); router.push('/dashboard/admin/announcements') },
    onError: (e: any) => toast.error(e.response?.data?.error ?? 'Failed'),
  })

  const toggleRole = (role: string) =>
    setForm(f => ({
      ...f,
      targetRoles: f.targetRoles.includes(role) ? f.targetRoles.filter(r => r !== role) : [...f.targetRoles, role],
    }))

  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <h1 className="font-display font-bold text-2xl text-gray-100 mb-8">New Announcement</h1>
      <div className="card p-8 max-w-xl space-y-5">
        <div>
          <label className="input-label">Title</label>
          <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" />
        </div>
        <div>
          <label className="input-label">Content</label>
          <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4} className="input resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input">
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="promo">Promo</option>
            </select>
          </div>
          <div>
            <label className="input-label">Expires At</label>
            <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="input" />
          </div>
        </div>
        <div>
          <label className="input-label mb-2 block">Target Roles</label>
          <div className="flex flex-wrap gap-3">
            {ROLES.map(role => (
              <label key={role} className="flex items-center gap-1.5 cursor-pointer capitalize">
                <input type="checkbox" checked={form.targetRoles.includes(role)} onChange={() => toggleRole(role)} className="accent-yellow-500" />
                <span className="text-gray-400 text-sm">{role}</span>
              </label>
            ))}
          </div>
        </div>
        <button
          onClick={() => mutation.mutate()}
          disabled={!form.title || !form.content || !form.targetRoles.length || mutation.isPending}
          className="btn-primary py-3 px-8 disabled:opacity-50"
        >
          {mutation.isPending ? 'Posting…' : 'Post Announcement'}
        </button>
      </div>
    </div>
  )
}
