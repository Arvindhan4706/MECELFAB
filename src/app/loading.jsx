export default function Loading() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero skeleton */}
      <div className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-white/[0.02] animate-pulse" />
        <div className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-16 py-16">
          <div className="w-20 h-3 bg-white/10 rounded mb-8 animate-pulse" />
          <div className="h-16 md:h-24 w-3/4 bg-white/5 rounded mb-4 animate-pulse" />
          <div className="h-4 w-1/2 bg-white/5 rounded mb-8 animate-pulse" />
          <div className="h-4 w-2/3 bg-white/5 rounded mb-10 animate-pulse" />
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-12 w-full sm:w-48 bg-white/10 rounded animate-pulse" />
            <div className="h-12 w-full sm:w-48 bg-white/5 border border-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
