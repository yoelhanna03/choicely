/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useSyncExternalStore, useRef, useCallback } from "react";
import Sidebar from "../Components/Home/sidebar";

function subscribe() { return () => {}; }

// ─── Visual Map ────────────────────────────────────────────────────────────────
function VisualMap({ nodes }: { nodes: any[] }) {
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

      {nodes.map((node, i) => {
        const isRoot = !node.parent;
        return (
          <div key={node.id} className="absolute group" style={{ top: node.y, left: node.x, width: "240px" }}>
            <div className={`
              px-4 py-3.5 rounded-2xl border backdrop-blur-md transition-all duration-300 cursor-default
              ${isRoot
                ? "shadow-lg shadow-indigo-500/10"
                : "group-hover:border-white/15 group-hover:bg-white/[0.05]"
              }
            `} style={isRoot ? {
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.3)",
            } : {
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] mb-1.5"
                style={{ color: isRoot ? "rgba(165,180,252,0.7)" : "rgba(255,255,255,0.2)" }}>
                {isRoot ? "Situation centrale" : `Facteur ${i}`}
              </p>
              <p className="text-[13px] font-medium leading-snug"
                style={{ color: isRoot ? "#c7d2fe" : "rgba(255,255,255,0.7)" }}>
                {node.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Typing Effect ──────────────────────────────────────────────────────────────
function TypingText({ text }: { text: string }) {
  return (
    <p className="text-[13.5px] text-white/60 leading-relaxed whitespace-pre-wrap">
      {text}
    </p>
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
      setActiveTab("table");
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRows(null); setMap(null); setSituation(""); setCharCount(0); setError(null);
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
          <div className="mb-10 stagger-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="dot-live" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
                Choicely — Module IA
              </p>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="a-serif text-[2.8rem] font-normal text-white leading-tight tracking-tight mb-2">
                  Analyse{" "}
                  <span style={{
                    background: "linear-gradient(135deg, #c7d2fe, #a5f3fc)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>stratégique</span>
                </h1>
                <p className="text-white/30 text-sm max-w-md leading-relaxed">
                  Décrivez une situation — l&apos;IA génère un tableau structuré et une carte de facteurs clés.
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
              <div className="relative mb-4">
                <textarea
                  className="a-textarea"
                  style={{ height: "140px" }}
                  placeholder="Ex: Mon entreprise perd des parts de marché face à un concurrent qui vient de lever 10M€. Dois-je pivoter ou maintenir le cap ?"
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
                  ) : "Analyser cette situation →"}
                </button>
                <span className="text-[11px] text-white/15">⌘ + Entrée pour lancer</span>
              </div>

              {error && (
                <div className="mt-4 px-4 py-3 rounded-xl border border-red-500/20 text-red-400 text-sm fade-in"
                  style={{ background: "rgba(239,68,68,0.06)" }}>
                  ⚠ {error}
                </div>
              )}
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="max-w-3xl mt-6 fade-in">
              <div className="p-10 rounded-3xl border border-white/[0.06] flex flex-col items-center gap-5"
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
                  <p className="text-[12px] text-white/20">Le modèle analyse votre situation...</p>
                </div>
              </div>
            </div>
          )}

          {/* RESULTS */}
          {hasResults && !loading && (
            <div className="stagger-1">

              {/* Recap pill */}
              <div className="flex items-center gap-3 mb-6 p-3 pr-5 rounded-2xl border border-white/[0.06] inline-flex"
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
              <div className="flex items-center gap-2 mb-6 p-1 rounded-xl border border-white/[0.06] w-fit"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <button className={`a-tab ${activeTab === "table" ? "active" : ""}`} onClick={() => setActiveTab("table")}>
                  Tableau d&apos;analyse
                  {rows && <span className="ml-2 text-[10px] opacity-50">{rows.length}</span>}
                </button>
                <button className={`a-tab ${activeTab === "map" ? "active" : ""}`} onClick={() => setActiveTab("map")}>
                  Carte stratégique
                </button>
              </div>

              {/* TABLE */}
              {activeTab === "table" && rows && (
                <div className="fade-in">
                  <div className="rounded-2xl border border-white/[0.07] overflow-hidden backdrop-blur-sm"
                    style={{ background: "rgba(255,255,255,0.02)" }}>

                    {/* Table header */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr" }}
                      className="border-b border-white/[0.06] px-5 py-3"
                      >
                      {[
                        { l: "Condition", c: "#a5b4fc" },
                        { l: "Analyse", c: "rgba(255,255,255,0.25)" },
                        { l: "Conclusion", c: "#6ee7b7" },
                      ].map(h => (
                        <span key={h.l} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: h.c }}>
                          {h.l}
                        </span>
                      ))}
                    </div>

                    {rows.map((r, i) => (
                      <div key={i} className="a-row" style={{
                        display: "grid", gridTemplateColumns: "1fr 2fr 1fr",
                        padding: "18px 20px",
                        borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      }}>
                        <div className="pr-4">
                          <div className="flex items-center gap-2 mb-1">
                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#818cf8", flexShrink: 0 }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(165,180,252,0.85)" }}>{r.condition}</span>
                          </div>
                        </div>
                        <div className="px-4">
                          <TypingText text={r.analyse} />
                        </div>
                        <div className="pl-4">
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            fontSize: 12, fontWeight: 600, color: "rgba(110,231,183,0.8)",
                          }}>
                            <span style={{ fontSize: 10 }}>→</span>
                            {r.conclusion}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Switch to map CTA */}
                  <div className="mt-4 flex items-center gap-2">
                    <button onClick={() => setActiveTab("map")}
                      className="text-[12px] text-white/25 hover:text-white/50 transition-colors flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="2" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                        <circle cx="2" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                        <circle cx="10" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M6 3.5v2M4 8.5l1.5-2M8 8.5L6.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      Voir la carte stratégique →
                    </button>
                  </div>
                </div>
              )}

              {/* MAP */}
              {activeTab === "map" && map && (
                <div className="fade-in">
                  <VisualMap nodes={map} />
                  <div className="mt-4 flex items-center gap-4 text-[11px] text-white/20">
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
                      Connexion
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