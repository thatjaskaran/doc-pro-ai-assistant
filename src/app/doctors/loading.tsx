export default function Loading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/30 via-stone-50/40 to-white px-4 py-10 text-slate-900 animate-pulse sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Universal Page Header Skeleton */}
        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2.5">
            {/* Pill Badge Skeleton */}
            <div className="h-5 w-28 rounded-full bg-teal-100/60" />
            
            {/* Page Title Skeleton */}
            <div className="h-8 w-64 rounded-xl bg-slate-200/80 sm:h-9 sm:w-80" />
            
            {/* Subtitle / Description Skeleton */}
            <div className="h-4 w-72 rounded-lg bg-slate-200/50 sm:w-96" />
          </div>

          {/* Action Button / Secondary Action Skeleton */}
          <div className="h-10 w-36 rounded-xl bg-slate-200/80 shrink-0" />
        </div>

        {/* Dynamic Filters & Controls Bar Skeleton */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-11 rounded-2xl bg-slate-100/80" />
            <div className="h-11 rounded-2xl bg-slate-100/80" />
            <div className="h-11 rounded-2xl bg-slate-100/80" />
          </div>
        </div>

        {/* Content Section Skeleton */}
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="h-5 w-36 rounded-lg bg-slate-200/70" />
            <div className="h-4 w-20 rounded-lg bg-slate-200/40" />
          </div>

          {/* Universal Skeleton Grid Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6"
              >
                {/* Card Top: Avatar/Icon + Title */}
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-100 shrink-0" />
                  
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-200/80" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>

                {/* Card Middle: Content Lines */}
                <div className="space-y-2.5 rounded-2xl bg-slate-50/60 p-4 border border-slate-100">
                  <div className="h-3.5 w-full rounded bg-slate-200/50" />
                  <div className="h-3.5 w-4/5 rounded bg-slate-200/50" />
                </div>

                {/* Card Bottom: Metadata & Action */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="h-4 w-20 rounded bg-slate-200/60" />
                  <div className="h-8 w-24 rounded-xl bg-teal-100/50" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}