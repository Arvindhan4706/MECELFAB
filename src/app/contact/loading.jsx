export default function Loading() {
  return (
    <div className="min-h-screen bg-primary-light pt-32 pb-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
        {/* Header skeleton */}
        <div className="max-w-3xl mb-16">
          <div className="h-3 w-48 bg-white/10 rounded mb-6 animate-pulse" />
          <div className="h-12 md:h-16 w-2/3 bg-white/5 rounded mb-4 animate-pulse" />
          <div className="h-5 w-1/2 bg-white/5 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Contact details skeleton */}
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-5 h-5 bg-white/10 rounded animate-pulse mt-1" />
                  <div className="flex-1">
                    <div className="h-2 w-24 bg-white/10 rounded mb-2 animate-pulse" />
                    <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full h-64 bg-white/5 border border-white/5 rounded animate-pulse" />
          </div>

          {/* Form skeleton */}
          <div className="flex flex-col gap-6">
            <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="h-2 w-20 bg-white/10 rounded mb-2 animate-pulse" />
                <div className="h-12 w-full bg-white/5 border border-white/10 rounded animate-pulse" />
              </div>
              <div>
                <div className="h-2 w-16 bg-white/10 rounded mb-2 animate-pulse" />
                <div className="h-12 w-full bg-white/5 border border-white/10 rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="h-2 w-24 bg-white/10 rounded mb-2 animate-pulse" />
                <div className="h-12 w-full bg-white/5 border border-white/10 rounded animate-pulse" />
              </div>
              <div>
                <div className="h-2 w-12 bg-white/10 rounded mb-2 animate-pulse" />
                <div className="h-12 w-full bg-white/5 border border-white/10 rounded animate-pulse" />
              </div>
            </div>
            <div>
              <div className="h-2 w-32 bg-white/10 rounded mb-2 animate-pulse" />
              <div className="h-32 w-full bg-white/5 border border-white/10 rounded animate-pulse" />
            </div>
            <div className="h-14 w-full bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
