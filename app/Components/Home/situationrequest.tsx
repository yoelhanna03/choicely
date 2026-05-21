"use client";

import { useState } from "react";

// Ajout de onSuccess dans les types des props
interface IntroCardProps {
  onCancel: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (result: any) => void;
}

export default function IntroCard({ onCancel, onSuccess }: IntroCardProps) {
  const [situation, setSituation] = useState("");
  const [choice, setChoice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAnalyse() {
    if (!situation.trim()) return alert("Veuillez décrire votre situation");
    
    setLoading(true);
    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, choice }),
      });

      const data = await res.json();
      
      // On envoie le résultat complet au parent (avec score et summary)
      onSuccess(data);
    } catch (error) {
      console.error("Erreur lors de l'analyse:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 shadow-xl w-full max-w-xl text-white">
      <h2 className="text-xl font-semibold mb-3 text-white/90">Analyse intelligente</h2>
      <p className="text-white/60 text-sm leading-relaxed mb-6">
        Entrez votre situation, et optionnellement un choix que vous souhaitez faire.
      </p>

      <label className="block text-sm text-white/70 mb-2">Votre situation</label>
      <textarea
        value={situation}
        onChange={(e) => setSituation(e.target.value)}
        placeholder="Décrivez votre situation..."
        className="w-full h-28 p-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition mb-5"
      />

      <label className="block text-sm text-white/70 mb-2">Choix (optionnel)</label>
      <input
        value={choice}
        onChange={(e) => setChoice(e.target.value)}
        placeholder="Le choix que vous envisagez..."
        className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition mb-6"
      />

      <button
        onClick={handleAnalyse}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Analyse en cours..." : "Lancer l’analyse"}
      </button>

      <button
        onClick={onCancel}
        className="w-full mt-3 py-3 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition text-sm"
      >
        Annuler
      </button>
    </div>
  );
}