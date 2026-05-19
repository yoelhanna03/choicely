"use client";

import { signIn } from "next-auth/react";

export default function GoogleButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="flex items-center justify-center gap-3 w-full max-w-sm px-5 py-3 mx-auto rounded-xl 
                 bg-white/5 border border-white/10 text-white font-medium text-sm
                 transition-all duration-300 hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
    >
      {/* Icône SVG Google officielle */}
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#EA4335"
          d="M12 5.04c1.65 0 3.13.57 4.3 1.69l3.22-3.22C17.58 1.63 15 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3C6.27 7.59 8.93 5.04 12 5.04z"
        />
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.87 3.39-8.48z"
        />
        <path
          fill="#FBBC05"
          d="M5.36 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 6.9c-.83 1.66-1.3 3.53-1.3 5.5s.47 3.84 1.3 5.5l3.86-2.9z"
        />
        <path
          fill="#34A853"
          d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.96 1.09-3.07 0-5.67-2.55-6.6-5.46L1.84 15.8C3.74 19.65 7.69 23 12 23z"
        />
      </svg>
      Continuer avec Google
    </button>
  );
}