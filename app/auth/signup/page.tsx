"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import BackHomeButton from "../../Components/returnbutton";
import GoogleButton from "@/components/GoogleButton";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [show, setShow] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!acceptedTerms) {
      setErrorMsg("Veuillez accepter les conditions d'utilisation et la politique de confidentialité.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        window.location.href = "/auth/verify";
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Erreur lors de l'inscription.");
      }
    } catch (err) {
      setErrorMsg("Impossible de contacter le serveur.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl"
      >
        <BackHomeButton />
        <h1 className="text-3xl font-semibold mb-2 text-white text-center">Créer un compte</h1>

        <p className="text-center text-white/60 text-sm mb-8">
          Rejoins Choicely et commence à créer tes choix.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-500/20 border border-red-500/40 text-red-300 text-center animate-in fade-in zoom-in duration-300">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white/80 text-sm">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="exemple@email.com"
              className="bg-black/20 border border-white/10 rounded-lg p-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white/80 text-sm">Mot de passe</label>
            <div className="relative">
              <input
                name="password"
                type={show ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/40 transition hover:text-white"
                aria-label={show ? "Cacher le mot de passe" : "Afficher le mot de passe"}
              >
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 py-4">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border border-white/20 bg-black/20 cursor-pointer accent-white"
            />
            <label htmlFor="terms" className="text-xs text-white/60 leading-relaxed cursor-pointer">
              J'accepte les{" "}
              <Link href="/cgu" target="_blank" className="text-white hover:underline">
                Conditions Générales d'Utilisation
              </Link>
              {" "}et la{" "}
              <Link href="/privacy" target="_blank" className="text-white hover:underline">
                Politique de Confidentialité
              </Link>
            </label>
          </div>

          <div className="pt-1">
            <GoogleButton />
          </div>

          <button
            type="submit"
            disabled={loading || !acceptedTerms}
            className="mt-4 bg-white text-black font-medium p-3 rounded-lg hover:bg-white/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Création..." : "Créer un compte"}
          </button>

          <p className="text-center text-white/60 text-sm mt-4">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="text-white hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
