/* eslint-disable @next/next/no-img-element */
"use client";

import { Zap, Target, TrendingUp, Sparkles, ArrowRight, Search, NotebookPen, ChartNoAxesCombined } from "lucide-react";

interface WelcomeNewUserProps {
  onStartAnalysis: () => void;
}

export default function WelcomeNewUser({ onStartAnalysis }: WelcomeNewUserProps) {
  const features = [
    {
      icon: Target,
      title: "Analysez vos décisions",
      description: "Soumettez vos situations complexes pour une analyse IA approfondie",
      color: "indigo"
    },
    {
      icon: TrendingUp,
      title: "Suivez votre progression",
      description: "Visualisez l'évolution de vos scores et identifiez vos points forts",
      color: "cyan"
    },
    {
      icon: Sparkles,
      title: "Recevez des insights",
      description: "Obtenez une synthèse personnalisée de vos analyses pour guider vos décisions",
      color: "emerald"
    },
    {
      icon: Zap,
      title: "Optimisez vos choix",
      description: "Apprenez de chaque analyse pour prendre des décisions plus éclairées",
      color: "amber"
    },
  ];

  const colorMap = {
    indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-400", icon: "text-indigo-400" },
    cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", icon: "text-cyan-400" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", icon: "text-emerald-400" },
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", icon: "text-amber-400" },
  };

  return (
    <div className="relative w-full">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* WELCOME SECTION */}
      <div className="relative space-y-12">
        {/* HERO */}
        <div className="text-center space-y-6 pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Bienvenue sur Choicely</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-4xl lg:text-5xl font-light text-white leading-tight">
              Prêt à améliorer <span className="font-semibold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">vos décisions ?</span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Commencez par soumettre votre première situation. Notre IA analysera vos choix et vous proposera des insights personnalisés.
            </p>
          </div>

          <button
            onClick={onStartAnalysis}
            className="inline-flex items-center gap-2 px-7 py-4 mt-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95"
          >
            Commencer votre première analyse
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* FEATURES GRID */}
        <div className="grid md:grid-cols-2 gap-5">
          {features.map((feature, i) => {
            const colors = colorMap[feature.color as keyof typeof colorMap];
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className={`relative p-6 rounded-2xl border ${colors.border} ${colors.bg} backdrop-blur-sm overflow-hidden group transition-all duration-300 hover:border-opacity-60 hover:bg-opacity-15`}
              >
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${feature.color === 'indigo' ? 'rgba(99,102,241,0.05)' : feature.color === 'cyan' ? 'rgba(34,211,238,0.05)' : feature.color === 'emerald' ? 'rgba(52,211,153,0.05)' : 'rgba(251,146,60,0.05)'}, transparent 70%)`
                  }}
                />

                <div className="relative space-y-3">
                  <div className={`w-10 h-10 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                    <Icon size={20} className={colors.icon} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-white/50 mt-1">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* HOW IT WORKS */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-white mb-2">Comment ça marche ?</h3>
            <p className="text-white/50">Trois étapes simples pour optimiser vos décisions</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Décrivez votre situation",
                description: "Expliquez votre dilemme décisionnel ou la situation qui vous préoccupe",
                icon: <NotebookPen size={20} />
              },
              {
                step: "02",
                title: "Recevez une analyse",
                description: "Notre IA génère une analyse détaillée avec un score de qualité",
                icon: <Search size={20} />
              },
              {
                step: "03",
                title: "Consultez votre synthèse",
                description: "Visualisez vos progrès et recevez des recommandations personnalisées",
                icon: <ChartNoAxesCombined size={20} />
              },
            ].map((item, i) => (
              <div key={i} className="relative p-6 rounded-2xl border border-white/5 bg-white/2 backdrop-blur-sm hover:border-white/10 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{item.icon}</div>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-1">Étape {item.step}</p>
                    <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-white/50">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STATS PREVIEW */}
        <div className="relative rounded-2xl border border-white/5 bg-linear-to-br from-white/5 to-transparent p-8 backdrop-blur-sm">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { value: "∞", label: "Analyses illimitées" },
              { value: "IA", label: "Analyse avancée" },
              { value: "📈", label: "Suivi en temps réel" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl font-bold text-indigo-400 mb-1">{stat.value}</p>
                <p className="text-sm text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA FOOTER */}
        <div className="text-center space-y-4 py-6">
          <p className="text-sm text-white/50">
            Vous avez déjà des analyses ?{" "}
            <span className="text-white/70 font-medium">Elles apparaîtront ici</span>
          </p>
          <button
            onClick={onStartAnalysis}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium transition-all duration-300 hover:bg-white/10 hover:border-white/20 active:scale-95"
          >
            Créer ma première analyse
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
