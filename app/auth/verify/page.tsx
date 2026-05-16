"use client";

import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import Link from "next/link";

function subscribe() { return () => {}; }
function getServerSnapshot() { return false; }

export default function VerifyPage() {
  const params = useSearchParams();
  const success = params.get("success");
  const error = params.get("error");
  const mounted = useSyncExternalStore(subscribe, () => true, getServerSnapshot);

  const state: "success" | "expired" | "invalid" | "pending" = success
    ? "success"
    : error === "expired"
    ? "expired"
    : error === "invalid"
    ? "invalid"
    : "pending";

  const content = {
    success: {
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8.5 14.5L12 18L19.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      accent: "#16a37f",
      label: "Vérifié",
      title: "Email confirmé",
      body: "Ton adresse a été vérifiée avec succès. Tu peux maintenant accéder à ton compte Choicely.",
      action: { href: "/auth/login", label: "Accéder à mon compte" },
    },
    expired: {
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 8v6.5l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      accent: "#d97706",
      label: "Expiré",
      title: "Lien expiré",
      body: "Ce lien de vérification n'est plus valide. Les liens expirent après 24 heures. Inscris-toi à nouveau pour en recevoir un nouveau.",
      action: { href: "/auth/signup", label: "Nouvelle inscription" },
    },
    invalid: {
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9.5 9.5L18.5 18.5M18.5 9.5L9.5 18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      accent: "#e24b4a",
      label: "Invalide",
      title: "Lien invalide",
      body: "Ce lien de vérification est invalide ou a déjà été utilisé. Si tu penses qu'il s'agit d'une erreur, contacte-nous.",
      action: { href: "/auth/signup", label: "Retour à l'inscription" },
    },
    pending: {
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 8v6h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      accent: "#378add",
      label: "En attente",
      title: "Vérifie ta boîte mail",
      body: "Un lien de vérification a été envoyé à ton adresse email. Clique dessus pour activer ton compte. Pense à vérifier tes spams.",
      action: null,
    },
  }[state];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        .verify-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
          font-family: 'DM Sans', sans-serif;
          padding: 2rem;
        }

        .verify-card {
          width: 100%;
          max-width: 420px;
          background: #111;
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 3rem 2.5rem;
          position: relative;
          overflow: hidden;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .verify-card.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .verify-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 60%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .verify-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          opacity: 0.06;
          filter: blur(60px);
          top: -80px;
          right: -80px;
          pointer-events: none;
        }

        .verify-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 100px;
          margin-bottom: 2rem;
          border: 0.5px solid;
        }

        .verify-title {
          font-family: 'Instrument Serif', serif;
          font-size: 2rem;
          font-weight: 400;
          color: #fff;
          line-height: 1.15;
          margin: 0 0 1rem;
          letter-spacing: -0.02em;
        }

        .verify-body {
          font-size: 14px;
          line-height: 1.75;
          color: rgba(255,255,255,0.45);
          margin: 0 0 2rem;
        }

        .verify-action {
          display: block;
          width: 100%;
          padding: 0.875rem;
          text-align: center;
          font-size: 14px;
          font-weight: 500;
          color: #0a0a0a;
          background: #fff;
          border-radius: 12px;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s;
        }

        .verify-action:hover {
          background: rgba(255,255,255,0.9);
          transform: translateY(-1px);
        }

        .verify-footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 12px;
          color: rgba(255,255,255,0.2);
        }

        .verify-footer a {
          color: rgba(255,255,255,0.35);
          text-decoration: none;
        }

        .verify-footer a:hover {
          color: rgba(255,255,255,0.6);
        }

        .verify-dots {
          display: flex;
          gap: 6px;
          margin-top: 1.5rem;
        }

        .verify-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
        }

        .verify-dot.active {
          background: rgba(255,255,255,0.6);
        }
      `}</style>

      <div className="verify-root">
        <div className={`verify-card ${mounted ? "mounted" : ""}`}>

          <div
            className="verify-glow"
            style={{ background: content.accent }}
          />

          <div
            className="verify-label"
            style={{
              color: content.accent,
              borderColor: `${content.accent}40`,
              background: `${content.accent}10`,
            }}
          >
            <span style={{ color: content.accent }}>{content.icon}</span>
            {content.label}
          </div>

          <h1 className="verify-title">{content.title}</h1>
          <p className="verify-body">{content.body}</p>

          {content.action && (
            <Link href={content.action.href} className="verify-action">
              {content.action.label}
            </Link>
          )}

          {state === "pending" && (
            <div className="verify-dots">
              <div className="verify-dot active" />
              <div className="verify-dot" />
              <div className="verify-dot" />
            </div>
          )}

          <p className="verify-footer">
            Choicely - Tous droits réservés
          </p>

        </div>
      </div>
    </>
  );
}
