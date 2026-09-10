export default function Loading() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
        <div className="max-w-4xl mb-16">
          <div className="h-3 w-32 bg-white/10 rounded mb-8 animate-pulse" />
          <div className="h-12 md:h-16 w-2/3 bg-white/5 rounded mb-4 animate-pulse" />
          <div className="h-5 w-1/2 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="py-16 border-t border-white/5">
          <div className="h-3 w-32 bg-white/10 rounded mb-6 animate-pulse" />
          <div className="h-8 w-1/2 bg-white/5 rounded mb-10 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 bg-white/[0.02] border border-white/5">
                <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
