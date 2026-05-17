function SkeletonBlock({
  className = "",
  delay = "0s",
}: {
  className?: string;
  delay?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white/[0.055] ${className}`}
      style={{ animationDelay: delay }}
    >
      <div
        className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/[0.075] to-transparent"
        style={{ animation: "skeleton-shimmer 1.55s ease-in-out infinite" }}
      />
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-20 h-screen w-56 flex-col border-r border-white/10 px-5 py-8 backdrop-blur-xl">
      <div className="mb-10 h-7 w-28 rounded-lg bg-white/10" />

      <nav className="flex flex-1 flex-col gap-3">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-xl px-2.5 py-2">
            <SkeletonBlock className="h-4 w-4 rounded-md" delay={`${item * 0.1}s`} />
            <SkeletonBlock className="h-3 w-24" delay={`${item * 0.12}s`} />
          </div>
        ))}
      </nav>

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-8 w-8 rounded-xl" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-2.5 w-24" />
            <SkeletonBlock className="h-2 w-16" delay="0.1s" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function StatCardSkeleton({ delay = "0s" }: { delay?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-sm">
      <div className="mb-5 flex items-start justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-2.5 w-20" delay={delay} />
          <SkeletonBlock className="h-5 w-28" delay={delay} />
        </div>
        <SkeletonBlock className="h-12 w-12 rounded-full" delay={delay} />
      </div>
      <div className="space-y-2">
        <SkeletonBlock className="h-2.5 w-full" delay={delay} />
        <SkeletonBlock className="h-2.5 w-3/4" delay={delay} />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 lg:p-8 backdrop-blur-sm">
      <div className="mb-8 flex items-center justify-between gap-6">
        <div className="space-y-3">
          <SkeletonBlock className="h-3 w-36" />
          <SkeletonBlock className="h-3 w-52" delay="0.1s" />
        </div>
        <div className="hidden sm:flex gap-3">
          <SkeletonBlock className="h-6 w-20 rounded-full" />
          <SkeletonBlock className="h-6 w-20 rounded-full" delay="0.12s" />
          <SkeletonBlock className="h-6 w-20 rounded-full" delay="0.24s" />
        </div>
      </div>

      <div className="relative h-56 overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.012]">
        <div className="absolute inset-x-6 top-8 h-px bg-white/[0.04]" />
        <div className="absolute inset-x-6 top-1/2 h-px bg-white/[0.04]" />
        <div className="absolute inset-x-6 bottom-10 h-px bg-white/[0.04]" />

        <div className="absolute bottom-10 left-[8%] h-14 w-2 rounded-full bg-indigo-300/15" />
        <div className="absolute bottom-10 left-[22%] h-24 w-2 rounded-full bg-cyan-300/15" />
        <div className="absolute bottom-10 left-[36%] h-16 w-2 rounded-full bg-indigo-300/15" />
        <div className="absolute bottom-10 left-[50%] h-32 w-2 rounded-full bg-emerald-300/15" />
        <div className="absolute bottom-10 left-[64%] h-24 w-2 rounded-full bg-cyan-300/15" />
        <div className="absolute bottom-10 left-[78%] h-36 w-2 rounded-full bg-emerald-300/15" />

        <div
          className="absolute left-8 right-8 top-20 h-24 opacity-60"
          style={{
            background:
              "linear-gradient(135deg, transparent 8%, rgba(129,140,248,0.22) 8% 10%, transparent 10% 26%, rgba(96,165,250,0.2) 26% 28%, transparent 28% 45%, rgba(52,211,153,0.2) 45% 47%, transparent 47%)",
          }}
        />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes loading-fade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <SidebarSkeleton />

      <main
        className="min-h-screen px-5 py-7 md:ml-56 md:px-8 lg:px-12"
        style={{ animation: "loading-fade 0.28s ease-out both" }}
      >
        <div className="mx-auto max-w-6xl space-y-8">
          <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-2 w-2 rounded-full bg-emerald-300/25" />
                <SkeletonBlock className="h-2.5 w-36" />
              </div>
              <SkeletonBlock className="h-10 w-64 max-w-full rounded-2xl" delay="0.1s" />
              <SkeletonBlock className="h-3 w-72 max-w-full" delay="0.2s" />
            </div>

            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-12 w-28 rounded-2xl" />
              <SkeletonBlock className="h-12 w-12 rounded-2xl" delay="0.1s" />
            </div>
          </header>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCardSkeleton />
            <StatCardSkeleton delay="0.12s" />
            <StatCardSkeleton delay="0.24s" />
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/[0.08] to-transparent" />
              <SkeletonBlock className="h-3 w-32" />
              <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/[0.08] to-transparent" />
            </div>
            <ChartSkeleton />
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <div className="space-y-2">
                  <SkeletonBlock className="h-3 w-28" />
                  <SkeletonBlock className="h-3 w-44" delay="0.1s" />
                </div>
                <SkeletonBlock className="h-8 w-24 rounded-full" />
              </div>

              <div className="space-y-4">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="grid grid-cols-[44px_1fr] gap-4 rounded-2xl border border-white/[0.045] bg-white/[0.015] p-4">
                    <SkeletonBlock className="h-11 w-11 rounded-full" delay={`${row * 0.1}s`} />
                    <div className="space-y-3">
                      <SkeletonBlock className="h-3 w-1/2" delay={`${row * 0.12}s`} />
                      <SkeletonBlock className="h-2.5 w-full" delay={`${row * 0.12}s`} />
                      <SkeletonBlock className="h-2.5 w-2/3" delay={`${row * 0.12}s`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/[0.07] bg-linear-to-br from-indigo-400/[0.055] via-white/[0.02] to-cyan-300/[0.045] p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center gap-2">
                <SkeletonBlock className="h-2 w-2 rounded-full bg-emerald-300/25" />
                <SkeletonBlock className="h-3 w-24" />
              </div>
              <div className="space-y-4">
                <SkeletonBlock className="h-5 w-full rounded-lg" />
                <SkeletonBlock className="h-5 w-11/12 rounded-lg" delay="0.1s" />
                <SkeletonBlock className="h-5 w-4/5 rounded-lg" delay="0.2s" />
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-6">
                <SkeletonBlock className="h-12 rounded-2xl" />
                <SkeletonBlock className="h-12 rounded-2xl" delay="0.12s" />
                <SkeletonBlock className="h-12 rounded-2xl" delay="0.24s" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
