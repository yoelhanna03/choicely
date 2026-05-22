"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, Check, ArrowLeft } from "lucide-react";
import Sidebar from "@/app/Components/Home/sidebar";
import { TIER_PRICES, SUBSCRIPTION_TIERS } from "@/lib/subscription-constants";

interface SubscriptionData {
  subscription: {
    tier: string;
    createdAt: string;
    expiresAt: string | null;
  };
  credits: {
    balance: number;
    lastResetAt: string;
  };
  nextTier: string;
  nextPrice: number;
}

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [subData, setSubData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  async function fetchSubscription() {
    try {
      const res = await fetch("/api/subscription/current");
      if (res.ok) {
        const data = await res.json();
        setSubData(data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchSubscription();
    }
  }, [session]);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (payment === "success" && sessionId && session?.user) {
      async function confirmSubscription() {
        setConfirming(true);
        try {
          const encodedSessionId = encodeURIComponent(sessionId as string);
          const res = await fetch(`/api/subscription/confirm?session_id=${encodedSessionId}`);
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Erreur lors de la confirmation de l'abonnement");
          }

          setSuccessMessage(`Abonnement ${data.tier} activé !`);
          await fetchSubscription();
          router.replace("/subscription", { scroll: false });
        } catch (error) {
          console.error("Subscription confirmation error:", error);
          const message = error instanceof Error ? error.message : String(error);
          setCheckoutError(message);
        } finally {
          setConfirming(false);
        }
      }

      confirmSubscription();
    }
  }, [searchParams, session, router]);

  async function handleUpgrade(tier: string) {
    setCheckoutError(null);
    setUpgrading(true);

    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création de la session de paiement");
      }

      if (!data.url) {
        throw new Error("Aucune URL de paiement retournée");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Subscription checkout error:", error);
      const message = error instanceof Error ? error.message : String(error);
      setCheckoutError(message);
    } finally {
      setUpgrading(false);
    }
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[#0F0F17] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-light mb-4">Abonnements</h1>
          <p className="text-[rgba(237,234,248,0.60)] mb-8">
            Veuillez vous connecter pour voir vos options d'abonnement
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-8 py-3 bg-linear-to-r from-[#5B4FE8] to-[#00C8D7] rounded-full text-white hover:opacity-90 transition"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F17] text-white">
      <Sidebar />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-[13.5px] text-[rgba(237,234,248,0.70)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] transition-all mb-12"
          >
            <ArrowLeft size={16} />
            Tableau de bord
          </Link>

          {/* Header */}
          <div className="mb-16">
            <h1 className="text-5xl font-light mb-4">
              Choisir votre <em className="italic" style={{
                background: "linear-gradient(110deg,#5B4FE8,#00C8D7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>abonnement</em>
            </h1>
            <p className="text-[rgba(237,234,248,0.60)] text-lg">
              Débloquez plus de crédits pour analyser vos choix avec l'IA
            </p>
          </div>

          {/* Current Plan Info */}
          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : subData ? (
            <>
              {successMessage && (
                <div className="mb-6 rounded-xl border border-[#15b7ff] bg-[#15b7ff]/10 p-4 text-sm text-[#c7f3ff]">
                  {successMessage}
                </div>
              )}

              <div className="mb-16 p-6 rounded-xl border border-[rgba(0,200,215,0.2)] bg-[rgba(0,200,215,0.5)]">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-[rgba(237,234,248,0.60)] mb-1">Abonnement actuel</p>
                    <h2 className="text-2xl font-light capitalize">
                      {subData.subscription.tier === "free" ? "Gratuit" : subData.subscription.tier}
                    </h2>
                    <p className="text-sm text-[rgba(237,234,248,0.60)] mt-2">
                      Crédits restants : <span className="text-white font-medium">{subData.credits.balance}</span>
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Free Plan */}
            <div className={`relative rounded-2xl border p-8 transition-all ${
              subData?.subscription.tier === "free"
                ? "border-[#5B4FE8] bg-[#5B4FE8]/5"
                : "border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
            }`}>
              <h3 className="text-2xl font-light mb-2">Gratuit</h3>
              <p className="text-sm text-[rgba(237,234,248,0.60)] mb-6">Actuel</p>

              <div className="mb-8">
                <div className="text-3xl font-light mb-1">50 crédits</div>
                <p className="text-sm text-[rgba(237,234,248,0.60)]">par semaine</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-[#00C8D7]" />
                  <span>50 crédits/semaine</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-[#00C8D7]" />
                  <span>Reset automatique</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-[#00C8D7]" />
                  <span>Parfait pour essayer</span>
                </div>
              </div>

              <button disabled className="w-full py-3 rounded-lg border border-[rgba(255,255,255,0.2)] text-white transition opacity-50">
                Plan actuel
              </button>
            </div>

            {/* Pro Plan */}
            <div className={`relative rounded-2xl border p-8 transition-all transform hover:scale-105 ${
              subData?.subscription.tier === "pro"
                ? "border-[#5B4FE8] bg-[#5B4FE8]/5 scale-105"
                : "border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
            }`}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="px-4 py-1 bg-linear-to-r from-[#5B4FE8] to-[#00C8D7] rounded-full text-[11px] font-medium text-white">
                  Populaire
                </span>
              </div>

              <h3 className="text-2xl font-light mb-2">Pro</h3>
              <p className="text-sm text-[rgba(237,234,248,0.60)] mb-6">Recommandé</p>

              <div className="mb-8">
                <div className="text-3xl font-light mb-1">${TIER_PRICES.pro}</div>
                <p className="text-sm text-[rgba(237,234,248,0.60)]">par mois</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-[#00C8D7]" />
                  <span>500 crédits/semaine</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-[#00C8D7]" />
                  <span>Export PDF des analyses</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-[#00C8D7]" />
                  <span>Historique détaillé (30 jours)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-[#00C8D7]" />
                  <span>Recommandations prioritaires</span>
                </div>
              </div>

              <button
                className="w-full py-3 rounded-lg bg-linear-to-r from-[#5B4FE8] to-[#00C8D7] text-white hover:opacity-90 transition disabled:opacity-50"
                disabled={loading || subData?.subscription.tier === "pro" || upgrading}
                onClick={() => handleUpgrade("pro")}
              >
                {subData?.subscription.tier === "pro" ? "Plan actuel" : upgrading ? "Redirection..." : "Upgrader"}
              </button>
            </div>

            {/* Premium Plan */}
            <div className={`relative rounded-2xl border p-8 transition-all ${
              subData?.subscription.tier === "premium"
                ? "border-[#5B4FE8] bg-[#5B4FE8]/5"
                : "border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
            }`}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="px-4 py-1 bg-linear-to-r from-[#00C8D7] to-[#5B4FE8] rounded-full text-[11px] font-medium text-white">
                   Meilleur choix
                </span>
              </div>

              <h3 className="text-2xl font-light mb-2">Premium</h3>
              <p className="text-sm text-[rgba(237,234,248,0.60)] mb-6">Accès illimité</p>

              <div className="mb-8">
                <div className="text-3xl font-light mb-1">${TIER_PRICES.premium}</div>
                <p className="text-sm text-[rgba(237,234,248,0.60)]">par mois</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-[#00C8D7]" />
                  <span>2000 crédits/semaine</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-[#00C8D7]" />
                  <span>📜 Historique illimité</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-[#00C8D7]" />
                  <span>📊 Analyses comparatives</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-[#00C8D7]" />
                  <span>📄 Export PDF avancé</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-[#00C8D7]" />
                  <span>🎯 Insights personnalisés</span>
                </div>
              </div>

              <button
                className="w-full py-3 rounded-lg bg-linear-to-r from-[#5B4FE8] to-[#00C8D7] text-white hover:opacity-90 transition disabled:opacity-50"
                disabled={loading || subData?.subscription.tier === "premium" || upgrading}
                onClick={() => handleUpgrade("premium")}
              >
                {subData?.subscription.tier === "premium" ? "Plan actuel" : upgrading ? "Redirection..." : "Upgrader"}
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-[rgba(91,79,232,0.1)] border border-[rgba(91,79,232,0.2)] rounded-xl p-8">
            <h3 className="text-xl font-light mb-4">Comment marchent les crédits ?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-[rgba(237,234,248,0.70)]">
              <div>
                <p className="font-medium text-white mb-2">Analyse (5 crédits)</p>
                <p>Analyser un choix ou une décision</p>
              </div>
              <div>
                <p className="font-medium text-white mb-2">Simulation (7 crédits)</p>
                <p>Tester différents scénarios</p>
              </div>
              <div>
                <p className="font-medium text-white mb-2">Bilan (3 crédits)</p>
                <p>Générer une synthèse complète</p>
              </div>
            </div>
            {checkoutError && (
              <div className="mt-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                {checkoutError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
