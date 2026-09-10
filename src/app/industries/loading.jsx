export default function Loading() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
        {/* Header skeleton */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-5 h-[1px] bg-white/20 animate-pulse" />
            <div className="h-3 w-32 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="h-12 md:h-16 w-2/3 bg-white/5 rounded mb-4 animate-pulse" />
          <div className="h-6 w-1/3 bg-white/5 rounded animate-pulse" />
        </div>

        {/* Industry cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-white/5 rounded-lg p-8 bg-white/[0.02]">
              <div className="w-12 h-12 border border-white/10 rounded-sm mb-6 animate-pulse" />
              <div className="h-6 w-2/3 bg-white/5 rounded mb-3 animate-pulse" />
              <div className="h-4 w-full bg-white/5 rounded mb-2 animate-pulse" />
              <div className="h-4 w-3/4 bg-white/5 rounded mb-6 animate-pulse" />
              <div className="h-10 w-32 bg-white/5 border border-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
