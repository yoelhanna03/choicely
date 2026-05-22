"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ListTodo,
  History,
  LogOut,
  User,
  Heart,
  Star,
  Menu,
  X,
  Shield,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const getLinkStyle = (href: string) => {
    const isActive = pathname === href;
    
    return `flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200 text-[13.5px] ${
      isActive 
        ? "bg-white/10 text-white shadow-sm"
        : "text-white/40 hover:text-white/80 hover:bg-white/5"
    }`;
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    // Vérifier et mettre à jour le statut admin
    async function checkAdmin() {
      if (session?.user?.email) {
        try {
          const res = await fetch("/api/auth/check-admin", {
            method: "POST",
          });
          const data = await res.json();
          setIsAdmin(data.isAdmin);
        } catch (error) {
          console.error("Error checking admin status:", error);
        }
      }
    }

    checkAdmin();
  }, [session]);

  return (
    <>
      {/* BOUTON HAMBURGER (Visible uniquement sur mobile/tablette) */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl md:hidden text-white/70 hover:text-white transition-all"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* OVERLAY SOMBRE (Ferme le menu au clic à l'extérieur sur mobile) */}
      {isOpen && (
        <div 
          onClick={closeMenu}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-20 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* SIDEBAR PRINCIPALE */}
      <aside className={`
        fixed top-0 left-0 w-56 h-screen backdrop-blur-xl border-r border-white/10 
        flex flex-col px-5 py-8 z-30 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>

        {/* LOGO */}
        <div className="font-serif text-[1.4rem] tracking-tight mb-10 text-white pt-2 md:pt-0">
          Choicely<span className="text-white/30">.</span>
        </div>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-1 flex-1">
          <Link href="/dashboard" className={getLinkStyle("/dashboard")} onClick={closeMenu}>
            <LayoutDashboard size={16} />
            Vue d’ensemble
          </Link>

          {/* Correction ici : getLinkStyle correspond maintenant bien à /simulation */}
          <Link href="/simulation" className={getLinkStyle("/simulation")} onClick={closeMenu}>
            <ListTodo size={16} />
            Simulations
          </Link>

          <Link href="/historic" className={getLinkStyle("/historic")} onClick={closeMenu}>
            <History size={16} />
            Historique
          </Link>

          <Link href="/donate" className={getLinkStyle("/donate")} onClick={closeMenu}>
            <Heart size={16} />
            Soutenir
          </Link>

          <Link href="/subscription" className={getLinkStyle("/subscription")} onClick={closeMenu}>
            <Star size={16} />
            Changer de plan
          </Link>

          <Link href="/account" className={getLinkStyle("/account")} onClick={closeMenu}>
            <User size={16} />
            Mon compte
          </Link>

          {isAdmin && (
            <Link href="/admin/dashboard" className={getLinkStyle("/admin/dashboard")} onClick={closeMenu}>
              <Shield size={16} />
              <span className="text-purple-300">Admin Dashboard</span>
            </Link>
          )}
        </nav>

        {/* BOUTON DE DÉCONNEXION */}
        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/10 mt-auto 
                     transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/30 text-left"
        >
          <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-red-500/20 transition-colors">
            <LogOut
              size={16}
              className="text-white/40 transition-all duration-300 
                       group-hover:text-red-400 group-hover:translate-x-0.5"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-[13px] font-medium text-white/60 transition-colors duration-300 group-hover:text-white">
              Déconnexion
            </span>
            <span className="text-[10px] text-white/20 group-hover:text-red-400/60 transition-colors">
              Quitter la session
            </span>
          </div>
        </button>
      </aside>
    </>
  );
}