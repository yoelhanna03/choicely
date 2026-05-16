"use client";

import { useSession } from "next-auth/react";
import { User, Mail, Shield, Calendar, KeyRound } from "lucide-react";
import Sidebar from "../Components/Home/sidebar";

export default function AccountPage() {
  const { data: session, status } = useSession();

  const memberSince = "Mai 2026"; 
  const isLoading = status === "loading";

  return (
    <>
      <Sidebar />
      <main className="ml-0 md:ml-56 flex-1 min-h-screen bg-transparent text-slate-200 p-6 md:p-12 transition-all duration-300">
        <div className="max-w-4xl mx-auto space-y-10 pt-12 md:pt-0">
          
          {/* HEADER DE LA PAGE */}
          <div>
            <h1 className="text-3xl font-light tracking-tight text-white">
              Mon <span className="font-semibold text-indigo-400">compte</span>
            </h1>
            <p className="text-white/40 text-xs mt-2">
              Gerez vos informations personnelles et vos acces.
            </p>
          </div>

          {/* GRILLE PRINCIPALE */}
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* CARTE PROFIL / AVATAR */}
            <div className="md:col-span-1 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-4">
              <div className={`w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)] ${isLoading ? "animate-pulse" : ""}`}>
                {!isLoading && session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={session.user.image} 
                    alt="Avatar" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={36} className="stroke-[1.5]" />
                )}
              </div>
              <div className="w-full flex flex-col items-center">
                {isLoading ? (
                  <div className="h-4 bg-white/10 rounded w-2/3 animate-pulse mt-1" />
                ) : (
                  <h2 className="text-base font-medium text-white">
                    {session?.user?.name || "Utilisateur"}
                  </h2>
                )}
                <p className="text-xs text-white/40 mt-1">Membre actif</p>
              </div>
            </div>

            {/* DETAILS DU COMPTE */}
            <div className="md:col-span-2 p-6 md:p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-6">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400/80">
                Informations personnelles
              </h3>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Champ Nom */}
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-white/30 flex items-center gap-1.5">
                    <User size={12} /> Nom complet
                  </label>
                  <div className="w-full h-[42px] flex items-center px-4 rounded-xl border border-white/5 bg-white/5 text-sm text-white/80">
                    {isLoading ? (
                      <div className="h-3 bg-white/10 rounded w-1/2 animate-pulse" />
                    ) : (
                      session?.user?.name || "Non renseigne"
                    )}
                  </div>
                </div>

                {/* Champ Email */}
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-white/30 flex items-center gap-1.5">
                    <Mail size={12} /> Adresse email
                  </label>
                  <div className="w-full h-[42px] flex items-center px-4 rounded-xl border border-white/5 bg-white/5 text-sm text-white/80 overflow-x-auto whitespace-nowrap scrollbar-none">
                    {isLoading ? (
                      <div className="h-3 bg-white/10 rounded w-3/4 animate-pulse" />
                    ) : (
                      session?.user?.email || "Non renseigne"
                    )}
                  </div>
                </div>

                {/* Champ Role */}
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-white/30 flex items-center gap-1.5">
                    <Shield size={12} /> Type de compte
                  </label>
                  <div className="w-full h-[42px] flex items-center px-4 rounded-xl border border-white/5 bg-white/5 text-sm text-white/80">
                    Standard (Free)
                  </div>
                </div>

                {/* Champ Date d'inscription */}
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-white/30 flex items-center gap-1.5">
                    <Calendar size={12} /> Membre depuis
                  </label>
                  <div className="w-full h-[42px] flex items-center px-4 rounded-xl border border-white/5 bg-white/5 text-sm text-white/80">
                    {memberSince}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* SECTION SECURITE */}
          <div className="pt-4">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-3 items-center">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">Securite du compte</h4>
                  <p className="text-xs text-white/30 mt-0.5">Votre authentification est geree de maniere securisee.</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Protege via OAuth
              </span>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}