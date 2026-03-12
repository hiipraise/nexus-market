'use client'

import { useState } from 'react'
import { Modal } from '@/components/shared'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { RiAlertLine } from 'react-icons/ri'

const REPORT_REASONS = [
  'Fake / counterfeit product',
  'Wrong description or misleading photos',
  'Price gouging',
  'Spam or duplicate listing',
  'Offensive or inappropriate content',
  'Scam — never delivered',
  'Abusive vendor behaviour',
  'Other',
]

interface Props {
  isOpen:     boolean
  onClose:    () => void
  entityType: 'product' | 'vendor'
  entityId:   string
}

export default function ReportModal({ isOpen, onClose, entityType, entityId }: Props) {
  const [reason,  setReason]  = useState('')
  const [details, setDetails] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      axios.post('/api/reports', { entityType, entityId, reason, details: details || undefined }),
    onSuccess: () => {
      toast.success('Report submitted. Our team will review it.')
      onClose()
      setReason('')
      setDetails('')
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? 'Failed to submit report'),
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Report this ${entityType}`} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <RiAlertLine className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-xs">
            False reports may result in your account being restricted.
          </p>
        </div>

        <div>
          <label className="input-label">Reason <span className="text-red-400">*</span></label>
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="input"
          >
            <option value="">Select a reason…</option>
            {REPORT_REASONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="input-label">Additional details (optional)</label>
          <textarea
            value={details}
            onChange={e => setDetails(e.target.value)}
            rows={3}
            placeholder="Provide any extra context…"
            className="input resize-none"
          />
        </div>

        <button
          onClick={() => mutation.mutate()}
          disabled={!reason || mutation.isPending}
          className="btn-primary w-full justify-center py-3 disabled:opacity-50"
        >
          {mutation.isPending ? 'Submitting…' : 'Submit Report'}
        </button>
      </div>
    </Modal>
  )
}
