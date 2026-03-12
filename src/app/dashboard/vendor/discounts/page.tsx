'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { RiAddLine } from 'react-icons/ri'
import { Modal, LoadingSpinner, StatusBadge } from '@/components/shared'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function VendorDiscountsPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    code: '', type: 'percentage', value: 0, minOrder: '', maxUses: '', startsAt: '', endsAt: '',
  })

  const { data: discounts, isLoading } = useQuery({
    queryKey: ['vendor-discounts'],
    queryFn:  () => axios.get('/api/discounts').then(r => r.data.data),
  })

  const createMutation = useMutation({
    mutationFn: () => axios.post('/api/discounts', {
      ...form,
      value:    Number(form.value),
      minOrder: form.minOrder ? Number(form.minOrder) : undefined,
      maxUses:  form.maxUses  ? Number(form.maxUses)  : undefined,
    }),
    onSuccess: () => {
      toast.success('Discount created!')
      qc.invalidateQueries({ queryKey: ['vendor-discounts'] })
      setOpen(false)
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? 'Failed'),
  })

  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-2xl text-gray-100">Discount Codes</h1>
        <button onClick={() => setOpen(true)} className="btn-primary text-sm">
          <RiAddLine className="w-4 h-4" /> Create Code
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="card overflow-hidden">
          {(discounts ?? []).length === 0 ? (
            <div className="p-16 text-center text-gray-500">No discount codes yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500">
                  <th className="text-left p-4 font-medium">Code</th>
                  <th className="text-left p-4 font-medium">Value</th>
                  <th className="text-left p-4 font-medium hidden sm:table-cell">Validity</th>
                  <th className="text-center p-4 font-medium">Uses</th>
                  <th className="text-center p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((d: any) => (
                  <tr key={d._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="p-4 font-mono font-bold text-gold-400">{d.code}</td>
                    <td className="p-4 text-gray-300">
                      {d.type === 'percentage' ? `${d.value}% off` : `₦${d.value.toLocaleString()} off`}
                    </td>
                    <td className="p-4 text-gray-500 text-xs hidden sm:table-cell">
                      {formatDate(d.startsAt)} – {formatDate(d.endsAt)}
                    </td>
                    <td className="p-4 text-center text-gray-400">
                      {d.usedCount}/{d.maxUses ?? '∞'}
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge status={d.isActive ? 'active' : 'inactive'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Create Discount Code" size="sm">
        <div className="space-y-4">
          <div>
            <label className="input-label">Code</label>
            <input
              type="text"
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, '') }))}
              placeholder="SUMMER20"
              className="input font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="input-label">Value {form.type === 'percentage' ? '(%)' : '(₦)'}</label>
              <input type="number" min="1" value={form.value} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Min Order (₦)</label>
              <input type="number" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} className="input" placeholder="Optional" />
            </div>
            <div>
              <label className="input-label">Max Uses</label>
              <input type="number" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} className="input" placeholder="Unlimited" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Starts At</label>
              <input type="datetime-local" value={form.startsAt} onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="input-label">Ends At</label>
              <input type="datetime-local" value={form.endsAt} onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))} className="input" />
            </div>
          </div>
          <button
            onClick={() => createMutation.mutate()}
            disabled={!form.code || !form.value || !form.startsAt || !form.endsAt || createMutation.isPending}
            className="btn-primary w-full justify-center py-3 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creating…' : 'Create Discount'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
