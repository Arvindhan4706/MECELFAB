export default function Loading() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
        <div className="max-w-3xl mb-20">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-5 h-[1px] bg-white/20 animate-pulse" />
            <div className="h-3 w-40 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="h-12 md:h-16 w-1/3 bg-white/5 rounded mb-4 animate-pulse" />
          <div className="h-5 w-1/2 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="flex flex-col gap-16">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border-t border-white/10 pt-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 border border-white/10 rounded-sm animate-pulse" />
                <div className="h-6 w-48 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j}>
                    <div className="h-3 w-24 bg-white/10 rounded mb-4 animate-pulse" />
                    <div className="flex flex-col gap-2">
                      {Array.from({ length: 3 }).map((_, k) => (
                        <div key={k} className="h-3 w-full bg-white/5 rounded animate-pulse" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
