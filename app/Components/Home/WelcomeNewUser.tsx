/* eslint-disable @next/next/no-img-element */
"use client";

import { Zap, Target, TrendingUp, Sparkles, ArrowRight } from "lucide-react";

interface WelcomeNewUserProps {
  onStartAnalysis: () => void;
}

export default function WelcomeNewUser({ onStartAnalysis }: WelcomeNewUserProps) {
  const features = [
    {
      icon: Target,
      title: "Analysez vos décisions",
      description: "Soumettez vos situations complexes pour une analyse IA approfondie",
    },
    {
      icon: TrendingUp,
      title: "Suivez votre progression",
      description: "Visualisez l'évolution de vos scores et identifiez vos points forts",
    },
    {
      icon: Sparkles,
      title: "Recevez des insights",
      description: "Obtenez une synthèse personnalisée de vos analyses pour guider vos décisions",
    },
    {
      icon: Zap,
      title: "Optimisez vos choix",
      description: "Apprenez de chaque analyse pour prendre des décisions plus éclairées",
    },
  ];

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-center py-12 px-4">
      {/* Subtle background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto space-y-16">
        {/* HERO SECTION */}
        <div className="space-y-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mx-auto">
            <Sparkles size={14} className="text-white/60" />
            <span className="text-xs font-medium tracking-wide text-white/70">Bienvenue sur Choicely</span>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-light text-white leading-tight tracking-tight">
              Prenez les <span className="font-semibold text-white">meilleures</span> décisions
            </h1>
            <p className="text-lg text-white/60 max-w-3xl mx-auto leading-relaxed">
              Analysez vos situations complexes avec notre IA. Recevez des insights précis, suivez votre progression et optimisez vos choix.
            </p>
          </div>

          {/* Primary CTA */}
          <div className="pt-4">
            <button
              onClick={onStartAnalysis}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
            >
              Commencer maintenant
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="relative p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 group overflow-hidden"
              >
                <div className="relative space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                    <Icon size={18} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                    <p className="text-xs text-white/50 mt-2 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* HOW IT WORKS */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">Comment ça marche</h2>
            <p className="text-white/50 text-sm">Trois étapes pour débuter</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                num: "01",
                title: "Décrivez votre situation",
                desc: "Soumettez votre dilemme ou situation complexe",
              },
              {
                num: "02",
                title: "Recevez une analyse",
                desc: "Notre IA génère une analyse détaillée et un score",
              },
              {
                num: "03",
                title: "Consultez vos insights",
                desc: "Visualisez votre progression et optimisez vos décisions",
              },
            ].map((item, i) => (
              <div key={i} className="relative p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-light text-indigo-400">{item.num}</span>
                    <div className="w-full h-px bg-linear-to-r from-indigo-500/30 to-transparent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                    <p className="text-xs text-white/50 mt-1">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECONDARY CTA */}
        <div className="text-center space-y-3 pt-4">
          <p className="text-sm text-white/50">
            Prêt à commencer ?
          </p>
          <button
            onClick={onStartAnalysis}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium transition-all duration-300 hover:bg-white/10 hover:border-white/20 active:scale-95"
          >
            Créer ma première analyse
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
