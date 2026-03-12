'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070212]">
      <div className="text-center px-4">
        <p className="font-display font-black text-[6rem] leading-none text-red-500/20 select-none">500</p>
        <h2 className="font-display font-black text-2xl text-gray-100 -mt-2 mb-2">Something went wrong</h2>
        <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
          An unexpected error occurred. Please try again or go back home.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary">Try Again</button>
          <Link href="/" className="btn-secondary">Go Home</Link>
        </div>
      </div>
    </div>
  )
}
