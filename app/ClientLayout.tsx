"use client";

import { SessionProvider } from "next-auth/react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      {/* 🌌 BACKGROUND PLUS CLAIR (MIDNIGHT MIST) */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0f1117]">

        {/* Dégradé principal : On part d'un gris-bleu pour aller vers un gris très foncé, mais jamais noir */}
        <div className="absolute inset-0 bg-linear-to-b from-[#161922] via-[#0f1117] to-[#0d0e12]" />

        {/* Glow Bleu : Plus clair et très diffus */}
        <div className="absolute -top-20 left-[5%] w-240 h-200 rounded-full bg-blue-500/15 blur-[120px]" />

        {/* Glow Cyan/Turquoise : Apporte de la fraîcheur en bas */}
        <div className="absolute -bottom-20 right-[10%] w-180 h-180 rounded-full bg-cyan-400/15 blur-[100px]" />

        {/* Lumière centrale : Un voile blanc/bleu très léger pour "ouvrir" l'espace */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-280 h-160 rounded-full bg-white/5 blur-[180px]" />

        {/* Texture grain : Un peu plus marquée pour un effet papier/premium */}
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-150" />

        {/* Vignette : On la baisse énormément pour ne pas assombrir les bords */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      </div>

      {/* CONTENT */}
      <main className="relative z-10 min-h-screen">
        {children}
      </main>
    </SessionProvider>
  );
}