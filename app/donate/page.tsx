"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, AlertCircle, CheckCircle } from "lucide-react";
import Sidebar from "@/app/Components/Home/sidebar";

interface DonationTier {
  id: string;
  amount: number;
  credits: number;
  label: string;
  description: string;
  popular?: boolean;
}

const DONATION_TIERS: DonationTier[] = [
  {
    id: "tier-5",
    amount: 5,
    credits: 500,
    label: "Starter",
    description: "Essayez le service"
  },
  {
    id: "tier-15",
    amount: 15,
    credits: 2000,
    label: "Standard",
    description: "Le choix populaire",
    popular: true
  },
  {
    id: "tier-50",
    amount: 50,
    credits: 10000,
    label: "Premium",
    description: "L'accès illimité"
  }
];

export default function DonatePage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDonate = async (amount: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
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
    <div className="min-h-screen bg-[#0F0F17] text-white">
      <Sidebar />
      
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
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
            <p className="text-[rgba(237,234,248,0.60)] text-lg max-w-2xl mx-auto">
              Vos crédits pour analyser vos choix avec l'IA. Chaque don soutient le développement continu de Choicely.
            </p>
          </div>

          {/* Alert si erreur */}
          {error && (
            <div className="mb-12 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {DONATION_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`relative group rounded-2xl border transition-all duration-300 p-8 ${
                  tier.popular
                    ? "border-[#5B4FE8]/60 bg-[#5B4FE8]/5 scale-105 shadow-2xl shadow-[#5B4FE8]/20"
                    : "border-[rgba(255,255,255,0.1)] bg-[#0F0F17] hover:border-[rgba(255,255,255,0.2)] hover:bg-[#1A1A25]"
                }`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-[#5B4FE8] to-[#00C8D7] rounded-full text-[11px] font-medium text-white">
                      ⭐ Populaire
                    </span>
                  </div>
                )}

                {/* Tier Label */}
                <h3 className="text-xl font-light mb-1">{tier.label}</h3>
                <p className="text-sm text-[rgba(237,234,248,0.50)] mb-6">{tier.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-light">${tier.amount}</span>
                    <span className="text-[rgba(237,234,248,0.50)] text-sm">/une fois</span>
                  </div>
                  <div className="text-[#00C8D7] font-light">
                    {tier.credits.toLocaleString()} crédits
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2 text-sm text-[rgba(237,234,248,0.70)]">
                    <CheckCircle className="w-4 h-4 text-[#00C8D7] flex-shrink-0" />
                    <span>Analyse IA illimitée</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[rgba(237,234,248,0.70)]">
                    <CheckCircle className="w-4 h-4 text-[#00C8D7] flex-shrink-0" />
                    <span>Crédits cumulatifs</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[rgba(237,234,248,0.70)]">
                    <CheckCircle className="w-4 h-4 text-[#00C8D7] flex-shrink-0" />
                    <span>Accès prioritaire</span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleDonate(tier.amount)}
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-normal text-[13.5px] transition-all duration-200 ${
                    tier.popular
                      ? "bg-gradient-to-r from-[#5B4FE8] to-[#00C8D7] text-white hover:shadow-lg hover:shadow-[#5B4FE8]/30 disabled:opacity-50"
                      : "border border-[rgba(255,255,255,0.2)] text-white hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-50"
                  }`}
                >
                  {loading && selectedTier === tier.id ? "Traitement..." : "Faire un don"}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-light mb-8 text-center">Questions fréquentes</h2>
            <div className="space-y-6">
              <div className="rounded-xl border border-[rgba(255,255,255,0.1)] p-6 hover:border-[rgba(255,255,255,0.2)] transition-colors">
                <h3 className="font-normal text-[15px] mb-2">Les crédits expirent-ils ?</h3>
                <p className="text-[13.5px] text-[rgba(237,234,248,0.60)]">
                  Non, vos crédits sont cumulatifs et n'expirent jamais. Ils restent dans votre compte indéfiniment.
                </p>
              </div>
              <div className="rounded-xl border border-[rgba(255,255,255,0.1)] p-6 hover:border-[rgba(255,255,255,0.2)] transition-colors">
                <h3 className="font-normal text-[15px] mb-2">Puis-je faire plusieurs dons ?</h3>
                <p className="text-[13.5px] text-[rgba(237,234,248,0.60)]">
                  Oui, vous pouvez faire plusieurs dons. Les crédits s'ajoutent à votre compte existant.
                </p>
              </div>
              <div className="rounded-xl border border-[rgba(255,255,255,0.1)] p-6 hover:border-[rgba(255,255,255,0.2)] transition-colors">
                <h3 className="font-normal text-[15px] mb-2">Ma donation est-elle sécurisée ?</h3>
                <p className="text-[13.5px] text-[rgba(237,234,248,0.60)]">
                  Oui, nous utilisons Stripe pour traiter les paiements de manière sécurisée. Aucun détail bancaire n'est stocké sur nos serveurs.
                </p>
              </div>
              <div className="rounded-xl border border-[rgba(255,255,255,0.1)] p-6 hover:border-[rgba(255,255,255,0.2)] transition-colors">
                <h3 className="font-normal text-[15px] mb-2">Comment puis-je utiliser mes crédits ?</h3>
                <p className="text-[13.5px] text-[rgba(237,234,248,0.60)]">
                  Accédez au dashboard et effectuez une analyse. Les crédits sont déduits automatiquement pour chaque requête IA.
                </p>
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-16 text-center">
            <Link
              href="/dashboard"
              className="text-[13.5px] text-[#00C8D7] hover:text-[#5B4FE8] transition-colors"
            >
              ← Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
