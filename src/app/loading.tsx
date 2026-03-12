export default function Loading() {
  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="page-container">
        <div className="skeleton h-8 w-64 rounded-xl mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[4/5] rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
