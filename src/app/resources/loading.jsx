export default function Loading() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
        <div className="max-w-3xl mb-20">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-5 h-[1px] bg-white/20 animate-pulse" />
            <div className="h-3 w-48 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="h-12 md:h-16 w-1/3 bg-white/5 rounded mb-4 animate-pulse" />
          <div className="h-5 w-2/3 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-white/5 p-8 bg-white/[0.02]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 border border-white/10 rounded-sm animate-pulse" />
                <div className="h-5 w-40 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="h-4 w-full bg-white/5 rounded mb-6 animate-pulse" />
              <div className="flex flex-col gap-3">
                <div className="h-16 w-full bg-black/30 border border-white/5 rounded animate-pulse" />
                <div className="h-16 w-full bg-black/30 border border-white/5 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
