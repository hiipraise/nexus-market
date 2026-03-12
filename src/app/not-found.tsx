import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-dark" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-700/10 blur-[100px] rounded-full" />

      <div className="relative z-10 text-center px-4">
        <p className="font-display font-black text-[8rem] leading-none text-gradient-gold opacity-20 select-none">404</p>
        <h1 className="font-display font-black text-3xl text-gray-100 -mt-4 mb-3">Page not found</h1>
        <p className="text-gray-400 text-base mb-8 max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="btn-primary">Back to Home</Link>
          <Link href="/products" className="btn-secondary">Browse Products</Link>
        </div>
      </div>
    </div>
  )
}
