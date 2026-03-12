'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { RiMoneyDollarCircleLine, RiArrowRightLine } from 'react-icons/ri'
import { Modal, LoadingSpinner, StatusBadge, Pagination } from '@/components/shared'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useVendorProfile } from '@/hooks'

export default function VendorPayoutsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ amount: '', bankCode: '', accountNumber: '', accountName: '' })

  const { data: vendor } = useVendorProfile()
  const balance = (vendor as any)?.data?.balance ?? 0

  const { data, isLoading } = useQuery({
    queryKey: ['payouts', page],
    queryFn:  () => axios.get(`/api/payouts?page=${page}`).then(r => r.data),
  })

  const payoutMutation = useMutation({
    mutationFn: () => axios.post('/api/payouts', { ...form, amount: Math.round(Number(form.amount) * 100) }),
    onSuccess:  () => {
      toast.success('Payout initiated!')
      qc.invalidateQueries({ queryKey: ['payouts'] })
      qc.invalidateQueries({ queryKey: ['vendor-profile'] })
      setOpen(false)
      setForm({ amount: '', bankCode: '', accountNumber: '', accountName: '' })
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? 'Payout failed'),
  })

  const payouts = data?.data ?? []
  const meta    = data?.meta

  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <h1 className="font-display font-bold text-2xl text-gray-100 mb-8">Payouts</h1>

      {/* Balance card */}
      <div className="card p-6 mb-8 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">Available Balance</p>
          <p className="font-display font-black text-3xl text-gold-400 mt-1">{formatCurrency(balance)}</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary" disabled={balance < 50000}>
          <RiMoneyDollarCircleLine className="w-4 h-4" /> Request Payout
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="card overflow-hidden">
            {payouts.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No payouts yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500">
                    <th className="text-left p-4 font-medium">Reference</th>
                    <th className="text-left p-4 font-medium hidden sm:table-cell">Date</th>
                    <th className="text-right p-4 font-medium">Amount</th>
                    <th className="text-center p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p: any) => (
                    <tr key={p._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="p-4 font-mono text-xs text-gray-400">{p.reference}</td>
                      <td className="p-4 text-gray-500 text-xs hidden sm:table-cell">{formatDate(p.createdAt)}</td>
                      <td className="p-4 text-right font-display font-bold text-gold-400">{formatCurrency(p.amount)}</td>
                      <td className="p-4 text-center"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {meta && meta.totalPages > 1 && (
            <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Request Payout" size="sm">
        <div className="space-y-4">
          <div className="bg-gold-500/10 border border-gold-500/20 rounded-xl p-3 text-sm text-gold-300">
            Available: <strong>{formatCurrency(balance)}</strong> · Min payout: ₦5,000
          </div>
          <div>
            <label className="input-label">Amount (₦)</label>
            <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="input" placeholder="e.g. 10000" />
          </div>
          <div>
            <label className="input-label">Bank Code</label>
            <input type="text" value={form.bankCode} onChange={e => setForm(f => ({ ...f, bankCode: e.target.value }))} className="input font-mono" placeholder="058 (GTBank)" />
          </div>
          <div>
            <label className="input-label">Account Number</label>
            <input type="text" value={form.accountNumber} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} className="input font-mono" maxLength={10} placeholder="10 digits" />
          </div>
          <div>
            <label className="input-label">Account Name</label>
            <input type="text" value={form.accountName} onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))} className="input" />
          </div>
          <button
            onClick={() => payoutMutation.mutate()}
            disabled={!form.amount || !form.bankCode || !form.accountNumber || !form.accountName || payoutMutation.isPending}
            className="btn-primary w-full justify-center py-3 disabled:opacity-50"
          >
            {payoutMutation.isPending ? 'Processing…' : <>Initiate Payout <RiArrowRightLine className="w-4 h-4" /></>}
          </button>
        </div>
      </Modal>
    </div>
  )
}
