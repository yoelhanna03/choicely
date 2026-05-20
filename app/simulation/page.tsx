/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useSyncExternalStore, useRef, useCallback } from "react";
import Sidebar from "../Components/Home/sidebar";

function subscribe() { return () => {}; }

// ─── Impact Badge ──────────────────────────────────────────────────────────────
function ImpactBadge({ impact }: { impact: string }) {
  const colors: any = {
    "Élevé": { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", text: "#fca5a5", dot: "#ef4444" },
    "Moyen": { bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.3)", text: "#fdba74", dot: "#f97316" },
    "Faible": { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", text: "#86efac", dot: "#22c55e" },
  };
  const style = colors[impact] || colors["Moyen"];
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border" style={{ background: style.bg, border: `1px solid ${style.border}` }}>
      <div style={{ width: 4, height: 4, borderRadius: "50%", background: style.dot }} />
      <span style={{ fontSize: "11px", fontWeight: 600, color: style.text }}>{impact}</span>
    </div>
  );
}

// ─── Urgency Badge ─────────────────────────────────────────────────────────────
function UrgencyBadge({ urgency }: { urgency: string }) {
  const urgencyMap: any = {
    "Critique": "🔴",
    "Haute": "🟠",
    "Normale": "🟡",
    "Basse": "🟢",
  };
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
      <span>{urgencyMap[urgency] || "◯"}</span>
      <span>{urgency}</span>
    </div>
  );
}

// ─── Score Bar ──────────────────────────────────────────────────────────────────
function ScoreBar({ score, max = 10 }: { score: number; max?: number }) {
  const percentage = (score / max) * 100;
  let color = "#ef4444";
  if (percentage >= 70) color = "#22c55e";
  else if (percentage >= 50) color = "#f97316";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
        <div style={{
          width: `${percentage}%`,
          height: "100%",
          background: color,
          transition: "width 0.3s",
        }} />
      </div>
      <span style={{ fontSize: "11px", fontWeight: 600, color, minWidth: "28px" }}>{score.toFixed(1)}</span>
    </div>
  );
}

// ─── Category Tag ──────────────────────────────────────────────────────────────
function CategoryTag({ category }: { category: string }) {
  const categoryColors: any = {
    "Marché": { bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.4)", text: "#a5b4fc" },
    "Interne": { bg: "rgba(168,85,247,0.15)", border: "rgba(168,85,247,0.4)", text: "#d8b4fe" },
    "Externe": { bg: "rgba(34,211,238,0.15)", border: "rgba(34,211,238,0.4)", text: "#a5f3fc" },
    "Opérationnel": { bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.4)", text: "#bfdbfe" },
    "Financier": { bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.4)", text: "#86efac" },
  };
  const style = categoryColors[category] || categoryColors["Externe"];
  return (
    <div className="px-2 py-1 rounded-md text-[10px] font-semibold" style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}>
      {category}
    </div>
  );
}

// ─── Visual Map ────────────────────────────────────────────────────────────────
function VisualMap({ nodes }: { nodes: any[] }) {
  const categoryColors: any = {
    "Marché": "rgba(99,102,241,0.3)",
    "Interne": "rgba(168,85,247,0.3)",
    "Externe": "rgba(34,211,238,0.3)",
    "Opérationnel": "rgba(59,130,246,0.3)",
    "Financier": "rgba(34,197,94,0.3)",
    "Situation": "rgba(99,102,241,0.12)",
  };
  return (
    <div className="relative w-full border border-white/[0.07] rounded-3xl overflow-hidden backdrop-blur-sm"
      style={{
        height: "480px",
        background: "linear-gradient(135deg, rgba(99,102,241,0.03) 0%, rgba(255,255,255,0.01) 50%, rgba(34,211,238,0.02) 100%)",
      }}
    >
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      {/* Top border glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-px" style={{
        background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), rgba(34,211,238,0.3), transparent)",
      }} />

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <circle cx="4" cy="4" r="2" fill="rgba(99,102,241,0.5)" />
          </marker>
          <filter id="mapglow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {nodes.map((node) => {
          if (!node.parent) return null;
          const parent = nodes.find((n) => n.id === node.parent);
          if (!parent) return null;
          const x1 = parent.x + 120; const y1 = parent.y + 32;
          const x2 = node.x + 120;   const y2 = node.y + 32;
          const mx = (x1 + x2) / 2;
          return (
            <path key={node.id}
              d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
              stroke="rgba(99,102,241,0.2)" strokeWidth="1.5" fill="none"
              strokeDasharray="5 4" markerEnd="url(#arrowhead)"
            />
          );
        })}
      </svg>

      {nodes.map((node) => {
        const isRoot = !node.parent;
        const categoryColor = categoryColors[node.category] || categoryColors["Situation"];
        return (
          <div key={node.id} className="absolute group" style={{ top: node.y, left: node.x, width: "240px" }}>
            <div className={`
              px-4 py-3.5 rounded-2xl border backdrop-blur-md transition-all duration-300 cursor-default
              ${isRoot
                ? "shadow-lg shadow-indigo-500/10"
                : "group-hover:border-white/15 group-hover:bg-white/5"
              }
            `} style={isRoot ? {
              background: categoryColor,
              border: "1px solid rgba(99,102,241,0.5)",
            } : {
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] mb-1.5"
                style={{ color: isRoot ? "rgba(165,180,252,0.7)" : "rgba(255,255,255,0.2)" }}>
                {node.category || (isRoot ? "Situation centrale" : "Facteur")}
              </p>
              <p className="text-[13px] font-medium leading-snug"
                style={{ color: isRoot ? "#c7d2fe" : "rgba(255,255,255,0.7)" }}>
                {node.label}
              </p>
              {node.impact && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Impact</p>
                  <ImpactBadge impact={node.impact} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Summary Card ──────────────────────────────────────────────────────────────
function SummaryCard({ title, summary, overallScore }: { title?: string; summary?: string; overallScore?: number }) {
  const scoreValue = overallScore || 0;
  const scorePercent = (scoreValue / 10) * 100;
  let scoreColor = "#ef4444";
  let scoreBg = "rgba(239,68,68,0.15)";
  if (scorePercent >= 70) { scoreColor = "#22c55e"; scoreBg = "rgba(34,197,94,0.15)"; }
  else if (scorePercent >= 50) { scoreColor = "#f97316"; scoreBg = "rgba(249,115,22,0.15)"; }
  
  return (
    <div className="grid md:grid-cols-3 gap-4 mb-8">
      <div className="md:col-span-2 p-6 rounded-2xl border border-white/8 backdrop-blur-sm" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.02) 100%)" }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400/60 mb-3">📊 Contexte de l&apos;analyse</p>
        <h3 className="text-[18px] font-bold text-white leading-tight mb-3">{title || "Analyse stratégique"}</h3>
        <p className="text-[13px] text-white/60 leading-relaxed">{summary || "Analyse détaillée de votre situation décisionnelle"}</p>
      </div>
      
      <div className="p-6 rounded-2xl border border-white/8 backdrop-blur-sm flex flex-col justify-between" style={{ background: scoreBg }}>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: scoreColor + "cc" }}>🏆 Score global</p>
          <div className="flex items-baseline gap-2">
            <p className="text-[32px] font-bold" style={{ color: scoreColor }}>{scoreValue.toFixed(1)}</p>
            <p className="text-[13px] text-white/40">/10</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div style={{ width: `${Math.min(scorePercent, 100)}%`, height: "100%", background: scoreColor, transition: "width 0.5s ease-out" }} />
          </div>
          <p className="text-[10px] text-white/40 mt-2">{Math.round(scorePercent)}% optimal</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function AnalysePage() {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [situation, setSituation] = useState("");
  const [rows, setRows] = useState<any[] | null>(null);
  const [map, setMap] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"table" | "map">("table");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [analysisData, setAnalysisData] = useState<any>(null);
  const mainRef = useRef<HTMLElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!mainRef.current) return;
    const r = mainRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  const handleAnalyse = async () => {
    if (!situation.trim()) return;
    setLoading(true);
    setError(null);
    setRows(null);
    setMap(null);
    setAnalysisData(null);

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Erreur lors de l'analyse."); return; }
      const parsedTable = JSON.parse(json.table);
      const parsedMap = JSON.parse(json.map);
      setRows(parsedTable.rows);
      setMap(parsedMap.nodes);
      setAnalysisData({
        title: json.title || parsedTable.title,
        summary: json.summary || parsedTable.summary,
        overallScore: json.overallScore || parsedTable.overallScore,
        rows: parsedTable.rows
      });
      setActiveTab("table");
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRows(null); setMap(null); setSituation(""); setCharCount(0); setError(null); setAnalysisData(null);
  };

  if (!mounted) return null;

  const hasResults = rows || map;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap');
        .a-root { font-family: 'Outfit', sans-serif; }
        .a-serif { font-family: 'DM Serif Display', serif; }

        .a-textarea {
          resize: none; width: 100%;
          font-family: 'Outfit', sans-serif; font-size: 14px;
          color: rgba(255,255,255,0.8); line-height: 1.7;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 20px 24px;
          transition: border-color 0.2s, background 0.2s;
          placeholder-color: rgba(255,255,255,0.2);
        }
        .a-textarea::placeholder { color: rgba(255,255,255,0.2); }
        .a-textarea:focus {
          outline: none;
          border-color: rgba(99,102,241,0.35);
          background: rgba(99,102,241,0.03);
          box-shadow: 0 0 0 4px rgba(99,102,241,0.05);
        }

        .a-btn-primary {
          position: relative; overflow: hidden;
          background: #fff; color: #0f1117;
          font-family: 'Outfit', sans-serif;
          font-weight: 700; font-size: 13px; letter-spacing: 0.04em;
          padding: 13px 28px; border-radius: 14px; border: none; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .a-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(255,255,255,0.14); }
        .a-btn-primary:active:not(:disabled) { transform: scale(0.97); }
        .a-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .a-btn-primary::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
          transform: translateX(-100%); transition: transform 0.5s;
        }
        .a-btn-primary:hover:not(:disabled)::after { transform: translateX(100%); }

        .a-btn-ghost {
          font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 500;
          padding: 13px 20px; border-radius: 14px; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.35); background: transparent;
          transition: color 0.2s, border-color 0.2s;
        }
        .a-btn-ghost:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.15); }

        .a-tab {
          font-family: 'Outfit', sans-serif;
          font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
          padding: 8px 18px; border-radius: 10px; cursor: pointer; border: none;
          transition: background 0.2s, color 0.2s;
        }
        .a-tab.active { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.9); }
        .a-tab:not(.active) { background: transparent; color: rgba(255,255,255,0.3); }
        .a-tab:not(.active):hover { color: rgba(255,255,255,0.6); }

        .a-row { transition: background 0.15s; }
        .a-row:hover { background: rgba(255,255,255,0.02); }

        .fade-in { animation: fadeIn 0.5s cubic-bezier(0.34,1,0.64,1) both; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .stagger-1 { animation: fadeIn 0.5s cubic-bezier(0.34,1,0.64,1) 0.05s both; }
        .stagger-2 { animation: fadeIn 0.5s cubic-bezier(0.34,1,0.64,1) 0.15s both; }
        .stagger-3 { animation: fadeIn 0.5s cubic-bezier(0.34,1,0.64,1) 0.25s both; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .wave-bar { animation: wavePulse 1.2s ease-in-out infinite; }
        @keyframes wavePulse {
          0%, 100% { opacity: 0.3; transform: scaleY(0.4); }
          50% { opacity: 1; transform: scaleY(1); }
        }

        .dot-live {
          width: 6px; height: 6px; border-radius: 50%; background: #34d399;
          animation: dotPulse 2s ease infinite;
          box-shadow: 0 0 0 0 rgba(52,211,153,0.4);
        }
        @keyframes dotPulse {
          0%  { box-shadow: 0 0 0 0 rgba(52,211,153,0.4); }
          70% { box-shadow: 0 0 0 7px rgba(52,211,153,0); }
          100%{ box-shadow: 0 0 0 0 rgba(52,211,153,0); }
        }

        .char-counter {
          position: absolute; bottom: 14px; right: 18px;
          font-size: 11px; color: rgba(255,255,255,0.15);
          font-family: 'Outfit', sans-serif; pointer-events: none;
        }
        .char-counter.warn { color: rgba(251,191,36,0.5); }
      `}</style>

      <div className="a-root flex min-h-screen">
        <Sidebar />

        <main
          ref={mainRef}
          onMouseMove={handleMouseMove}
          className="ml-50 flex-1 p-8 lg:p-12 relative"
          style={{
            background: `radial-gradient(ellipse 60% 40% at ${mousePos.x}px ${mousePos.y}px, rgba(99,102,241,0.035) 0%, transparent 60%)`,
          }}
        >

          {/* HEADER */}
          <div className="mb-12 stagger-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="dot-live" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                📊 Choicely — Analyse décisionnelle
              </p>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="a-serif text-[2.8rem] font-normal text-white leading-tight tracking-tight mb-3">
                  Analysez vos{" "}
                  <span style={{
                    background: "linear-gradient(135deg, #c7d2fe, #a5f3fc)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>décisions complexes</span>
                </h1>
                <p className="text-white/50 text-[13px] max-w-2xl leading-relaxed">
                  Décomposez vos dilemmes stratégiques en facteurs clés, évaluez les impacts et recevez des recommandations actionnables. Score & recommandations AI en temps réel.
                </p>
              </div>
              {hasResults && (
                <button onClick={handleReset} className="a-btn-ghost">
                  ← Nouvelle analyse
                </button>
              )}
            </div>
          </div>

          {/* INPUT ZONE */}
          {!hasResults && (
            <div className="max-w-3xl stagger-2">
              <div className="mb-6 p-5 rounded-xl border border-white/8 backdrop-blur-sm" style={{ background: "rgba(99,102,241,0.06)" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400/60 mb-3">💡 Conseil</p>
                <p className="text-[12px] text-white/60">Décrivez votre situation de manière concrète. Mentionnez les éléments clés, les enjeux, les contraintes et les alternatives envisagées.</p>
              </div>
              
              <div className="relative mb-6">
                <textarea
                  className="a-textarea"
                  style={{ height: "160px" }}
                  placeholder="Exemple: Mon startup B2B a 3 options: (1) Lever 2M€ pour accélérer la croissance, (2) Rester bootstrap et croître lentement, (3) Rejoindre un concurrent comme CTO. J'hésite sur la stratégie long-terme et l'impact sur mon équipe..."
                  value={situation}
                  maxLength={1000}
                  onChange={(e) => { setSituation(e.target.value); setCharCount(e.target.value.length); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAnalyse(); }}
                />
                <span className={`char-counter ${charCount > 800 ? "warn" : ""}`}>{charCount}/1000</span>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={handleAnalyse} disabled={loading || !situation.trim()} className="a-btn-primary">
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="55" strokeDashoffset="18" strokeLinecap="round" />
                      </svg>
                      Analyse en cours...
                    </span>
                  ) : "🚀 Analyser cette situation"}
                </button>
                <span className="text-[11px] text-white/35">Ou ⌘ + Entrée</span>
              </div>

              {error && (
                <div className="mt-5 px-5 py-3 rounded-xl border border-red-500/25 text-red-300 text-[12px] fade-in"
                  style={{ background: "rgba(239,68,68,0.08)" }}>
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="max-w-3xl mt-6 fade-in">
              <div className="p-10 rounded-3xl border border-white/6 flex flex-col items-center gap-5"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 44 }}>
                  {[0,1,2,3,4].map(j => (
                    <div key={j} className="wave-bar rounded-full"
                      style={{ width: 3, height: `${18 + j * 7}px`, background: "linear-gradient(to top, #6366f1, #a5b4fc)", animationDelay: `${j * 0.15}s` }}
                    />
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-400/50 mb-1">
                    Génération de l&apos;analyse
                  </p>
                  <p className="text-[12px] text-white/20">Le modèle analyse votre situation avec rigueur...</p>
                </div>
              </div>
            </div>
          )}

          {/* RESULTS */}
          {hasResults && !loading && (
            <div className="stagger-1">

              {/* Summary Card */}
              {analysisData && (
                <SummaryCard 
                  title={analysisData.title} 
                  summary={analysisData.summary} 
                  overallScore={analysisData.overallScore}
                />
              )}

              {/* Recap pill */}
              <div className="flex items-center gap-3 mb-6 p-3 pr-5 rounded-2xl border border-white/6"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="dot-live" />
                <p className="text-[12px] text-white/40 font-medium">
                  Analyse générée pour :{" "}
                  <span className="text-white/70 font-semibold">
                    &ldquo;{situation.length > 80 ? situation.slice(0, 80) + "…" : situation}&rdquo;
                  </span>
                </p>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 mb-6 p-1 rounded-xl border border-white/6 w-fit"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <button className={`a-tab ${activeTab === "table" ? "active" : ""}`} onClick={() => setActiveTab("table")}>
                  Tableau analytique
                  {rows && <span className="ml-2 text-[10px] opacity-50">{rows.length}</span>}
                </button>
                <button className={`a-tab ${activeTab === "map" ? "active" : ""}`} onClick={() => setActiveTab("map")}>
                  Carte des facteurs
                </button>
              </div>

              {/* TABLE */}
              {activeTab === "table" && rows && (
                <div className="fade-in">
                  <div className="rounded-2xl border border-white/[0.07] overflow-hidden backdrop-blur-sm"
                    style={{ background: "rgba(255,255,255,0.02)" }}>

                    {/* Table header */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 0.9fr 0.9fr 1fr 1.2fr 1fr" }}
                      className="border-b border-white/6 px-6 py-4 bg-white/2"
                    >
                      {[
                        { l: "Catégorie", c: "#a5b4fc", icon: "📂" },
                        { l: "Facteur clé", c: "rgba(255,255,255,0.6)", icon: "🎯" },
                        { l: "Impact", c: "#fca5a5", icon: "⚡" },
                        { l: "Urgence", c: "#fdba74", icon: "⏱️" },
                        { l: "Probabilité", c: "#86efac", icon: "📊" },
                        { l: "Score", c: "#a5f3fc", icon: "💎" },
                        { l: "Action", c: "#c084fc", icon: "✨" },
                      ].map(h => (
                        <span key={h.l} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: h.c }} className="flex items-center gap-1">
                          <span>{h.icon}</span>{h.l}
                        </span>
                      ))}
                    </div>

                    {rows.map((r, i) => {
                      const scoreNum = r.score || 5;
                      const isCritical = r.urgency === "Critique" || r.impact === "Élevé";
                      return (
                        <div key={i} className="a-row group" style={{
                          display: "grid", gridTemplateColumns: "1fr 1.5fr 0.9fr 0.9fr 1fr 1.2fr 1fr",
                          padding: "16px 20px",
                          borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                          alignItems: "center",
                          background: isCritical ? "rgba(239,68,68,0.05)" : "transparent",
                        }}>
                          {/* Catégorie */}
                          <div>
                            <CategoryTag category={r.category || "Externe"} />
                          </div>

                          {/* Facteur clé */}
                          <div className="pr-4">
                            <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: "1.5" }} className="group-hover:text-white transition">
                              {r.factor}
                            </p>
                            {isCritical && <p style={{ fontSize: "9px", color: "#ef4444", marginTop: "4px" }}>🔴 À traiter en priorité</p>}
                          </div>

                          {/* Impact */}
                          <div>
                            <ImpactBadge impact={r.impact || "Moyen"} />
                          </div>

                          {/* Urgence */}
                          <div>
                            <UrgencyBadge urgency={r.urgency || "Normale"} />
                          </div>

                          {/* Probabilité */}
                          <div>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>
                              {Math.round((r.probability || 0) * 100)}%
                            </div>
                            <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>probable</div>
                          </div>

                          {/* Score */}
                          <div>
                            <ScoreBar score={scoreNum} max={10} />
                          </div>

                          {/* Action rapide */}
                          <div>
                            <div className="px-2 py-1 rounded-md text-[9px] font-semibold cursor-pointer hover:opacity-80 transition" style={{
                              background: "rgba(168,85,247,0.2)",
                              border: "1px solid rgba(168,85,247,0.3)",
                              color: "#d8b4fe"
                            }}>
                              Détail →
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Details expandable */}
                  <div className="mt-8 space-y-3 border-t border-white/6 pt-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-6">🔍 Analyses détaillées par facteur</p>
                    {rows.map((r, i) => {
                      const isCritical = r.urgency === "Critique" || r.impact === "Élevé";
                      return (
                        <div key={i} className="p-5 rounded-xl border transition-all" style={{
                          background: isCritical ? "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.02) 100%)" : "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(99,102,241,0.02) 100%)",
                          borderColor: isCritical ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.08)",
                        }}>
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="text-[12px] font-bold text-white mb-1">▸ {r.factor}</p>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: isCritical ? "#fca5a5" : "#a5b4fc" }}>
                                {r.category || "Externe"} • Impact {r.impact || "Moyen"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p style={{ fontSize: "13px", fontWeight: 700, color: "#a5f3fc" }}>{(r.score || 5).toFixed(1)}</p>
                              <p className="text-[9px] text-white/40">/10</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Contexte</p>
                              <p className="text-[13px] text-white/70 leading-relaxed">{r.analysis}</p>
                            </div>
                            <div className="pt-3 border-t border-white/8">
                              <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: "#c084fc" }}>→ Action recommandée</p>
                              <p className="text-[12px] text-white/80 font-medium leading-relaxed">{r.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Switch to map CTA */}
                  <div className="mt-6 flex items-center gap-2">
                    <button onClick={() => setActiveTab("map")}
                      className="text-[12px] text-white/25 hover:text-white/50 transition-colors flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="2" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                        <circle cx="2" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                        <circle cx="10" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M6 3.5v2M4 8.5l1.5-2M8 8.5L6.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      Voir la carte des facteurs →
                    </button>
                  </div>
                </div>
              )}

              {/* MAP */}
              {activeTab === "map" && map && (
                <div className="fade-in">
                  <VisualMap nodes={map} />
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] text-white/40">
                    <div className="flex items-center gap-1.5">
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(99,102,241,0.3)", border: "1px solid rgba(99,102,241,0.5)" }} />
                      Situation centrale
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
                      Facteurs clés
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div style={{ width: 16, height: 1, background: "rgba(99,102,241,0.4)", borderTop: "1px dashed rgba(99,102,241,0.4)" }} />
                      Dépendance
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div style={{ fontSize: "12px" }}>🔴</div>
                      Priorité critique
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </main>
      </div>
    </>
  );
}