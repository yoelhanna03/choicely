/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react"; 
import BackHomeButton from '../../Components/returnbutton';
import GoogleButton from "@/components/GoogleButton";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [show, setShow] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrorMsg("");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    if (!email || !password) {
      setErrorMsg("Veuillez remplir tous les champs.");
      setLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        redirect: false, // On gère la redirection nous-mêmes
        email,
        password,
      });

      console.log("DEBUG NextAuth Res:", res); // Regarde la console du navigateur !

      if (res?.error) {
        /**
         * IMPORTANT : En NextAuth v5, l'erreur personnalisée (TooManyRequestsError) 
         * est souvent transmise dans l'URL de redirection ou via le code "Configuration" 
         * ou "CredentialsSignin".
         */
        
        // 1. On vérifie si l'URL contient le message de notre erreur personnalisée
        if (res.url?.includes("Trop") || res.error.includes("Trop")) {
          setErrorMsg("Trop de tentatives. Patientez 60 secondes.");
        } 
        // 2. Erreur d'email non vérifié
        else if (res.url?.includes("vérifié") || res.error.includes("vérifié")) {
          setErrorMsg("Ton email n'est pas encore vérifié.");
        } 
        // 3. Cas général (identifiants faux ou erreur générique)
        else {
          setErrorMsg("Email ou mot de passe incorrect.");
        }
      } else {
        // Succès : Redirection forcée
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setErrorMsg("Une erreur réseau est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl"
      >
        <BackHomeButton />
        <h1 className="text-3xl font-semibold text-white text-center mb-2">Connexion</h1>
        <p className="text-center text-white/60 text-sm mb-8">Accède à ton espace Choicely</p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-500/20 border border-red-500/40 text-red-300 text-center animate-pulse">
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
              autoComplete="email"
              disabled={loading}
              className="bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30 transition disabled:opacity-50"
              placeholder="ex: jean@dupont.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white/80 text-sm">Mot de passe</label>
            <div className="relative">
              <input
                name="password"
                type={show ? "text" : "password"}
                required
                autoComplete="current-password"
                disabled={loading}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 pr-12 text-white focus:outline-none focus:border-white/30 transition disabled:opacity-50"
                placeholder="ex: ●●●●●●●"
              />
              <div className="pt-4">
                <GoogleButton />
              </div>

              {/* DISCLAIMER LÉGAL / FOOTER ACCUEIL */}
              <p className="text-[10px] text-white/20 max-w-xs mx-auto leading-relaxed">
                En continuant, vous acceptez nos conditions d’utilisation et notre politique de confidentialité.
              </p>
              <button
                type="button"
                onClick={() => setShow(!show)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
              >
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-white text-black font-medium p-3 rounded-lg hover:bg-white/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Vérification..." : "Se connecter"}
          </button>

          <p className="text-center text-white/60 text-sm mt-4">
            Pas encore de compte ?{" "}
            <Link href="/auth/signup" className="text-white hover:underline">S’inscrire</Link>
          </p>
        </div>
      </form>
    </div>
  );
}