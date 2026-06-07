import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <div className="relative mb-8">
          <h1 className="text-8xl md:text-9xl font-extrabold text-white tracking-tight">
            404
          </h1>

          <div className="absolute inset-0 blur-3xl opacity-30 bg-violet-500 rounded-full" />
        </div>

        <h2 className="text-4xl font-bold text-white mb-4">
          Not found
        </h2>

        <div className="w-24 h-1 bg-violet-500 mx-auto rounded-full mb-6" />

        <p className="text-zinc-400 text-lg max-w-md mx-auto mb-10">
          We are so sorry, but the page you're looking for doesn't exist or has
          been moved.
        </p>

        <Link
          href="https://choicely-app.vercel.app"
          className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 px-6 py-3 text-white transition-all hover:border-violet-400 hover:shadow-[0_0_20px_rgba(139,92,246,0.35)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 10.5L12 3l9 7.5M5 9v10h14V9"
            />
          </svg>

          Go back home
        </Link>
      </div>
    </main>
  );
}
