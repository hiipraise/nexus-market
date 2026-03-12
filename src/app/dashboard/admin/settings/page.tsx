'use client'
export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen pt-8 pb-16 px-6">
      <h1 className="font-display font-bold text-2xl text-gray-100 mb-8">Platform Settings</h1>
      <div className="card p-8 max-w-xl">
        <p className="text-gray-500 text-sm">Platform configuration is managed via environment variables. See <code className="text-gold-400">.env.example</code> for all available options.</p>
        <div className="mt-6 space-y-3 text-sm">
          {[
            ['Platform Fee', 'PLATFORM_FEE_PERCENTAGE + PLATFORM_FEE_FLAT'],
            ['Moderation Thresholds', 'REPORT_THRESHOLD_REVIEW + REPORT_THRESHOLD_SUSPEND'],
            ['Payout Minimum', 'PLATFORM_PAYOUT_MINIMUM'],
            ['Paystack Keys', 'PAYSTACK_SECRET_KEY + NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY'],
          ].map(([label, env]) => (
            <div key={label} className="flex items-start justify-between gap-4 border-b border-white/5 pb-3">
              <span className="text-gray-400">{label}</span>
              <code className="text-gold-400 text-xs text-right">{env}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
