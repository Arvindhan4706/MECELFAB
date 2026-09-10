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

        {/* Filter buttons skeleton */}
        <div className="flex gap-3 mb-12">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-white/5 border border-white/10 rounded animate-pulse" />
          ))}
        </div>

        {/* Project grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-white/5 rounded-lg overflow-hidden bg-white/[0.02]">
              <div className="h-48 bg-white/5 animate-pulse" />
              <div className="p-6">
                <div className="h-6 w-3/4 bg-white/5 rounded mb-3 animate-pulse" />
                <div className="h-4 w-full bg-white/5 rounded mb-2 animate-pulse" />
                <div className="h-4 w-2/3 bg-white/5 rounded mb-4 animate-pulse" />
                <div className="flex gap-4">
                  <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
