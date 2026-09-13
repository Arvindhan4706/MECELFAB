export default function Loading() {
  return (
    <div 
      className="fixed top-0 left-0 right-0 h-[2px] z-[99999] pointer-events-none overflow-hidden"
      role="status"
      aria-label="Loading"
    >
      <div className="w-full h-full bg-accent/80 animate-[shimmer_1.2s_infinite]" />
    </div>
  );
}
