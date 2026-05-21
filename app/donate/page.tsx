"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import Sidebar from "@/app/Components/Home/sidebar";

export default function DonatePage() {
  const [customAmount, setCustomAmount] = useState<string>("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { data: session } = useSession();

  const handleDonate = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const amount = parseFloat(customAmount);

      if (!amount || amount < 1 || isNaN(amount)) {
        setError("Veuillez entrer un montant valide (minimum 1$)");
        return;
      }

      const response = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount,
          email: session?.user?.email 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        return;
      }

      // Rediriger vers Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError("Erreur de connexion. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white">
      {session && <Sidebar />}
      <div className={`${session ? "pt-24" : "pt-12"} pb-20 px-6`}>
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-[13.5px] text-[rgba(237,234,248,0.70)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] transition-all"
              >
                <ArrowLeft size={16} />
                Tableau de bord
              </Link>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-[13.5px] text-[rgba(237,234,248,0.70)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] transition-all"
              >
                <ArrowLeft size={16} />
                Retour
              </Link>
            )}
          </div>

          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#5B4FE8]/10 border border-[#5B4FE8]/20 mb-6">
              <Heart className="w-8 h-8 text-[#5B4FE8]" />
            </div>
            <h1 className="text-5xl font-light mb-4">
              Soutenir <em className="italic font-normal" style={{
                background: "linear-gradient(110deg,#5B4FE8,#00C8D7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>Choicely</em>
            </h1>
            <p className="text-[rgba(237,234,248,0.60)] text-lg">
              Aidez-nous à continuer le développement en faisant un don. Chaque contribution compte.
            </p>
          </div>

          {/* Alert si succès */}
          {success && (
            <div className="mb-12 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-green-200">Merci pour votre don! Redirection en cours...</p>
            </div>
          )}

          {/* Alert si erreur */}
          {error && (
            <div className="mb-12 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Donation Form */}
          <div className="rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#0F0F17] p-8 mb-12">
            <div className="mb-8">
              <label className="block text-sm font-medium text-[rgba(237,234,248,0.80)] mb-3">
                Montant du don (USD)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xl font-light text-[rgba(237,234,248,0.60)]">$</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Entrez le montant"
                  className="flex-1 bg-[#1A1A25] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white placeholder-[rgba(237,234,248,0.30)] focus:outline-none focus:border-[#00C8D7] focus:ring-1 focus:ring-[#00C8D7]/30"
                />
              </div>
              <p className="text-xs text-[rgba(237,234,248,0.40)] mt-2">
                Minimum: 1$ • Aucune limite maximum
              </p>
            </div>

            {/* Quick Amount Buttons */}
            <div className="mb-8">
              <p className="text-xs font-medium text-[rgba(237,234,248,0.60)] mb-3 uppercase tracking-wider">
                Montants suggérés
              </p>
              <div className="grid grid-cols-4 gap-3">
                {[5, 10, 25, 50].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setCustomAmount(amount.toString())}
                    className={`py-2 rounded-lg text-sm font-normal transition-all ${
                      customAmount === amount.toString()
                        ? "bg-linear-to-r from-[#5B4FE8] to-[#00C8D7] text-white"
                        : "border border-[rgba(255,255,255,0.1)] text-[rgba(237,234,248,0.70)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.05)]"
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleDonate}
              disabled={loading}
              className="w-full py-3 rounded-lg font-normal text-[13.5px] bg-white text-black transition-all duration-200 hover:shadow-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Traitement..." : `Faire un don de $${customAmount}`}
            </button>
          </div>

          {/* FAQ Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-light mb-8 text-center">Questions fréquentes</h2>
            <div className="space-y-6">
              <div className="rounded-xl border border-[rgba(255,255,255,0.1)] p-6 hover:border-[rgba(255,255,255,0.2)] transition-colors">
                <h3 className="font-normal text-[15px] mb-2">Qu'est-ce que mon don finance ?</h3>
                <p className="text-[13.5px] text-[rgba(237,234,248,0.60)]">
                  Vos dons soutiennent le développement continu de Choicely, l'amélioration des analyses IA, et l'infrastructure technique.
                </p>
              </div>
              <div className="rounded-xl border border-[rgba(255,255,255,0.1)] p-6 hover:border-[rgba(255,255,255,0.2)] transition-colors">
                <h3 className="font-normal text-[15px] mb-2">Mon don est-il sécurisé ?</h3>
                <p className="text-[13.5px] text-[rgba(237,234,248,0.60)]">
                  Oui, nous utilisons Stripe pour traiter les paiements de manière sécurisée. Aucun détail bancaire n'est stocké sur nos serveurs.
                </p>
              </div>
              <div className="rounded-xl border border-[rgba(255,255,255,0.1)] p-6 hover:border-[rgba(255,255,255,0.2)] transition-colors">
                <h3 className="font-normal text-[15px] mb-2">Dois-je être connecté pour faire un don ?</h3>
                <p className="text-[13.5px] text-[rgba(237,234,248,0.60)]">
                  Non, vous pouvez faire un don sans compte. Si vous avez un compte Choicely, nous pouvons le noter dans vos records.
                </p>
              </div>
              <div className="rounded-xl border border-[rgba(255,255,255,0.1)] p-6 hover:border-[rgba(255,255,255,0.2)] transition-colors">
                <h3 className="font-normal text-[15px] mb-2">Puis-je faire plusieurs dons ?</h3>
                <p className="text-[13.5px] text-[rgba(237,234,248,0.60)]">
                  Oui, vous pouvez faire autant de dons que vous le souhaitez. Chaque contribution nous aide à améliorer le service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
