/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useSyncExternalStore, useCallback } from "react";
import HandleAnalyse from "@/app/Components/Home/situationrequest";
import ResultIA from "./result_ia";

function subscribe() { return () => {}; }

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function ScoreArc({ score }: { score: number }) {
  const color = score >= 75 ? "#34d399" : score >= 50 ? "#60a5fa" : "#f87171";
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
      <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 26 26)"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)" }}
      />
      <text x="26" y="30" textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>{score}</text>
    </svg>
  );
}

function ScoreChart({ scores }: { scores: { id: number; score: number; question: string; createdAt: string }[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; score: number; question: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (scores.length === 0) return null;

  const W = 800;
  const H = 200;
  const PAD = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const points = scores.map((s, i) => ({
    x: PAD.left + (scores.length === 1 ? chartW / 2 : (i / (scores.length - 1)) * chartW),
    y: PAD.top + chartH - (s.score / 100) * chartH,
    score: s.score,
    question: s.question,
  }));

  const pathD = points.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }).join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${PAD.top + chartH} L ${points[0].x} ${PAD.top + chartH} Z`;

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <div className="relative w-full" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {gridLines.map(v => {
          const y = PAD.top + chartH - (v / 100) * chartH;
          return (
            <g key={v}>
              <line x1={PAD.left} y1={y} x2={PAD.left + chartW} y2={y}
                stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray={v === 50 ? "4 3" : "2 4"} />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.2)">{v}</text>
            </g>
          );
        })}

        {/* Zone 75-100 highlight */}
        <rect x={PAD.left} y={PAD.top} width={chartW} height={chartH * 0.25}
          fill="rgba(52,211,153,0.02)" rx="4" />

        {/* Area */}
        <path d={areaD} fill="url(#lineGrad)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="url(#strokeGrad)" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {points.map((p, i) => {
          const color = p.score >= 75 ? "#34d399" : p.score >= 50 ? "#60a5fa" : "#f87171";
          return (
            <g key={i} style={{ cursor: "pointer" }}
              onMouseEnter={() => setTooltip({ x: p.x, y: p.y, score: p.score, question: p.question })}
              onMouseLeave={() => setTooltip(null)}
            >
              <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
              <circle cx={p.x} cy={p.y} r="5" fill={color} stroke="#0f1117" strokeWidth="2" filter="url(#glow)" />
              <circle cx={p.x} cy={p.y} r="8" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
            </g>
          );
        })}

        {/* X axis labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={H - 8} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.2)">
            #{i + 1}
          </text>
        ))}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div className="absolute pointer-events-none z-10 px-3 py-2 rounded-xl border border-white/10 backdrop-blur-md"
          style={{
            background: "rgba(15,17,23,0.95)",
            left: `${(tooltip.x / 800) * 100}%`,
            top: `${(tooltip.y / 200) * 100}%`,
            transform: "translate(-50%, -130%)",
            minWidth: 160, maxWidth: 220,
          }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: tooltip.score >= 75 ? "#34d399" : tooltip.score >= 50 ? "#60a5fa" : "#f87171" }}>
            Score : {tooltip.score}/100
          </p>
          <p className="text-[11px] text-white/50 leading-snug line-clamp-2">{tooltip.question || "Analyse"}</p>
        </div>
      )}
    </div>
  );
}

export default function DashboardMain() {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [showIntro, setShowIntro] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [dataIA, setDataIA] = useState<string | null>(null);
  const [bilanIA, setBilanIA] = useState<string>("");
  const [isProcessingBilan, setIsProcessingBilan] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [lastQuestions, setLastQuestions] = useState<{ id: number; question: string; score: number }[]>([]);
  const [allScores, setAllScores] = useState<{ id: number; score: number; question: string; createdAt: string }[]>([]);
  const mainRef = useRef<HTMLElement>(null);

  const avgScore = lastQuestions.length
    ? Math.round(lastQuestions.reduce((a, q) => a + q.score, 0) / lastQuestions.length)
    : 0;
  const animAvg = useCountUp(avgScore);
  const bestScore = allScores.length ? Math.max(...allScores.map(s => s.score)) : 0;

  const refreshData = useCallback(async () => {
    try {
      const [bilanRes, questRes, scoresRes] = await Promise.all([
        fetch("/api/bilan/last"),
        fetch("/api/analyse"),
        fetch("/api/scores"),
      ]);
      if (bilanRes.ok) {
        const d = await bilanRes.json();
        if (d.bilan) setBilanIA(d.bilan);
      }
      if (questRes.ok) {
        const d = await questRes.json();
        setLastQuestions(d.questions || []);
      }
      if (scoresRes.ok) {
        const d = await scoresRes.json();
        setAllScores(d.scores || []);
      }
    } catch {}
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refreshData(); }, [refreshData]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!mainRef.current) return;
    const r = mainRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  const handleAnalysisSuccess = async (result: any) => {
    setDataIA(result);
    setShowIntro(false);
    setShowResult(true);
    setIsProcessingBilan(true);
    setBilanIA("");
    try {
      const res = await fetch("/api/bilan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analyseData: result }),
      });
      const data = await res.json();
      setBilanIA(data.bilan);
      await refreshData();
    } catch {
      setBilanIA("Erreur de génération du bilan.");
    } finally {
      setIsProcessingBilan(false);
    }
  };

  const handleBack = async () => {
    setShowResult(false);
    await refreshData();
  };

  const emptyCards = [0, 1, 2];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap');

        .d-root { font-family: 'Outfit', sans-serif; }
        .d-serif { font-family: 'DM Serif Display', serif; }

        .d-card {
          position: relative;
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), border-color 0.25s, background 0.25s;
        }
        .d-card:hover { transform: translateY(-5px) scale(1.01); }
        .d-card.hovered { border-color: rgba(99,102,241,0.3) !important; }

        .d-card-glow {
          position: absolute; inset: 0; border-radius: inherit;
          opacity: 0; transition: opacity 0.3s; pointer-events: none;
          background: radial-gradient(280px circle at 50% 50%, rgba(99,102,241,0.07), transparent 70%);
        }
        .d-card:hover .d-card-glow { opacity: 1; }

        .d-btn {
          position: relative; overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .d-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(255,255,255,0.1); }
        .d-btn:active { transform: scale(0.97); }
        .d-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
          transform: translateX(-100%); transition: transform 0.5s;
        }
        .d-btn:hover::after { transform: translateX(100%); }

        .bilan-gradient {
          background: linear-gradient(135deg, #f1f5f9 0%, #c7d2fe 35%, #a5f3fc 65%, #e2e8f0 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .d-tag {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; padding: 3px 10px; border-radius: 100px;
        }

        .stagger-1 { animation: slideUp 0.5s cubic-bezier(0.34,1,0.64,1) 0.05s both; }
        .stagger-2 { animation: slideUp 0.5s cubic-bezier(0.34,1,0.64,1) 0.15s both; }
        .stagger-3 { animation: slideUp 0.5s cubic-bezier(0.34,1,0.64,1) 0.25s both; }
        .stagger-4 { animation: slideUp 0.5s cubic-bezier(0.34,1,0.64,1) 0.35s both; }
        .stagger-5 { animation: slideUp 0.5s cubic-bezier(0.34,1,0.64,1) 0.45s both; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dot-live {
          width: 7px; height: 7px; border-radius: 50%; background: #34d399;
          box-shadow: 0 0 0 0 rgba(52,211,153,0.4); animation: livePulse 2s ease infinite;
        }
        @keyframes livePulse {
          0%  { box-shadow: 0 0 0 0 rgba(52,211,153,0.4); }
          70% { box-shadow: 0 0 0 8px rgba(52,211,153,0); }
          100%{ box-shadow: 0 0 0 0 rgba(52,211,153,0); }
        }

        .wave-bar {
          width: 3px; border-radius: 3px;
          background: linear-gradient(to top, #6366f1, #a5b4fc);
          animation: wave 1s ease-in-out infinite;
        }
        @keyframes wave {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }

        .skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 100%);
          background-size: 200% 100%; animation: skel 2s ease infinite; border-radius: 6px;
        }
        @keyframes skel {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .overlay-modal { animation: overlayIn 0.3s ease both; }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }

        .modal-content { animation: modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .sep {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
        }
      `}</style>

      <main
        ref={mainRef}
        onMouseMove={handleMouseMove}
        className="d-root ml-50 flex-1 min-h-screen p-8 lg:p-12 relative"
        style={{
          background: `radial-gradient(ellipse 70% 45% at ${mousePos.x}px ${mousePos.y}px, rgba(99,102,241,0.04) 0%, transparent 60%)`,
        }}
      >
        {mounted && (
          <>
            {/* HEADER */}
            <header className="flex items-start justify-between mb-12 stagger-1">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="dot-live" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/25">
                    Espace décision
                  </span>
                </div>
                <h1 className="d-serif text-[2.8rem] font-normal text-white leading-[1.05] tracking-tight">
                  Tableau de <span className="bilan-gradient italic">bord</span>
                </h1>
              </div>

              <div className="flex items-center gap-4 pt-1">
                {lastQuestions.length > 0 && (
                  <div className="text-right px-4 py-2 rounded-2xl border border-white/6 bg-white/2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/20 mb-0.5">Score moyen</p>
                    <p className="text-[1.8rem] font-bold text-white/85 leading-none tabular-nums">
                      {animAvg}<span className="text-sm font-normal text-white/25 ml-0.5">/100</span>
                    </p>
                  </div>
                )}
                <button
                  onClick={() => { setShowResult(false); setShowIntro(true); }}
                  className="d-btn px-5 py-3 rounded-2xl bg-white text-[#0f1117] text-[13px] font-bold tracking-wide"
                >
                  + Nouvelle analyse
                </button>
                <div className="h-11 w-11 rounded-2xl border border-white/8 bg-white/4 overflow-hidden">
                  <img src="/favicon.ico" alt="avatar" className="h-full w-full object-cover opacity-60" />
                </div>
              </div>
            </header>

            {!showResult && !showIntro && (
              <>
                {/* MINI STAT PILLS */}
                <div className="flex items-center gap-3 mb-8 stagger-1">
                  {[
                    { label: "Analyses", value: allScores.length, color: "#a5b4fc" },
                    { label: "Meilleur score", value: bestScore ? `${bestScore}/100` : "—", color: "#34d399" },
                    { label: "Tendance", value: avgScore >= 75 ? "↑ Positive" : avgScore >= 50 ? "→ Stable" : avgScore > 0 ? "↓ À revoir" : "—", color: avgScore >= 75 ? "#34d399" : avgScore >= 50 ? "#60a5fa" : "#f87171" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25">{s.label}</span>
                      <span className="text-[13px] font-bold" style={{ color: s.color }}>{s.value}</span>
                    </div>
                  ))}
                </div>

                {/* QUESTION CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 stagger-2">
                  {(lastQuestions.length === 0 ? emptyCards : lastQuestions).map((item, i) => {
                    const q = typeof item === "object" ? item : null;
                    const isHovered = hoveredCard === i;
                    return (
                      <div
                        key={q?.id ?? i}
                        className={`d-card p-6 rounded-2xl border bg-white/2.5 backdrop-blur-sm ${isHovered ? "hovered" : "border-white/[0.07]"}`}
                        onMouseEnter={() => setHoveredCard(i)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <div className="d-card-glow" />
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/20 mb-1.5">
                              Analyse {String(i + 1).padStart(2, "0")}
                            </p>
                            {q && (
                              <span className="d-tag" style={{
                                background: q.score >= 75 ? "rgba(52,211,153,0.1)" : q.score >= 50 ? "rgba(96,165,250,0.1)" : "rgba(248,113,113,0.1)",
                                color: q.score >= 75 ? "#34d399" : q.score >= 50 ? "#60a5fa" : "#f87171",
                                border: `0.5px solid ${q.score >= 75 ? "rgba(52,211,153,0.2)" : q.score >= 50 ? "rgba(96,165,250,0.2)" : "rgba(248,113,113,0.2)"}`,
                              }}>
                                {q.score >= 75 ? "✓ Fort" : q.score >= 50 ? "~ Moyen" : "↓ Faible"}
                              </span>
                            )}
                          </div>
                          {q ? <ScoreArc score={q.score} /> : (
                            <div className="w-12 h-12 rounded-full border-2 border-white/5 flex items-center justify-center">
                              <span className="text-white/10 text-xs">—</span>
                            </div>
                          )}
                        </div>
                        {q ? (
                          <p className="text-[13px] text-white/65 leading-relaxed font-medium line-clamp-2">{q.question}</p>
                        ) : (
                          <div className="space-y-2">
                            <div className="skeleton h-3 w-full" />
                            <div className="skeleton h-3 w-2/3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* SEPARATOR */}
                <div className="flex items-center gap-4 mb-6 stagger-3">
                  <div className="sep flex-1" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 px-2">Progression des scores</p>
                  <div className="sep flex-1" />
                </div>

                {/* GRAPH */}
                <div className="stagger-3 mb-8">
                  <div className="relative rounded-3xl border border-white/[0.07] overflow-hidden p-6 lg:p-8 backdrop-blur-sm"
                    style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(255,255,255,0.015) 50%, rgba(34,211,238,0.03) 100%)" }}
                  >
                    <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-[0.06]"
                      style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }}
                    />
                    <div className="absolute top-0 left-1/4 right-1/4 h-px"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.25), rgba(34,211,238,0.25), transparent)" }}
                    />

                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/25 mb-1">
                          Évolution des scores
                        </p>
                        <p className="text-sm text-white/40">
                          {allScores.length > 0 ? `${allScores.length} analyse${allScores.length > 1 ? "s" : ""} enregistrée${allScores.length > 1 ? "s" : ""}` : "Aucune analyse pour l'instant"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-white/25">
                        {[{ c: "#34d399", l: "Fort (75+)" }, { c: "#60a5fa", l: "Moyen (50+)" }, { c: "#f87171", l: "Faible" }].map(leg => (
                          <div key={leg.l} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: leg.c }} />
                            {leg.l}
                          </div>
                        ))}
                      </div>
                    </div>

                    {allScores.length > 0 ? (
                      <ScoreChart scores={allScores} />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="flex items-end gap-1.5">
                          {[0,1,2,3,4].map(j => (
                            <div key={j} className="skeleton rounded-full" style={{ width: 3, height: `${12 + j * 6}px` }} />
                          ))}
                        </div>
                        <p className="text-[11px] text-white/20 uppercase tracking-widest">Lancez votre première analyse</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* SEPARATOR */}
                <div className="flex items-center gap-4 mb-6 stagger-4">
                  <div className="sep flex-1" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 px-2">Synthèse IA</p>
                  <div className="sep flex-1" />
                </div>

                {/* BILAN */}
                <div className="stagger-5">
                  <div className="relative rounded-3xl border border-white/[0.07] overflow-hidden p-8 lg:p-10 backdrop-blur-sm"
                    style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(255,255,255,0.02) 50%, rgba(34,211,238,0.04) 100%)" }}
                  >
                    <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-[0.05]"
                      style={{ background: "radial-gradient(circle, #67e8f9, transparent 70%)" }}
                    />
                    <div className="absolute top-0 left-1/4 right-1/4 h-px"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), rgba(34,211,238,0.3), transparent)" }}
                    />

                    <div className="relative">
                      {isProcessingBilan ? (
                        <div className="flex flex-col items-center gap-5 py-6">
                          <div className="flex items-end gap-1.5 h-10">
                            {[0,1,2,3,4].map(j => (
                              <div key={j} className="wave-bar" style={{ height: `${20 + j * 6}px`, animationDelay: `${j * 0.12}s` }} />
                            ))}
                          </div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-indigo-400/60">
                            Génération du bilan...
                          </p>
                        </div>
                      ) : (
                        <>
                          {bilanIA && (
                            <div className="flex items-center gap-2.5 mb-5">
                              <div className="dot-live" />
                              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-400/60">
                                Bilan à jour
                              </span>
                            </div>
                          )}
                          <p className="d-serif bilan-gradient text-[1.4rem] lg:text-[1.65rem] leading-[1.65] font-normal max-w-4xl">
                            {bilanIA || (
                              <span style={{ WebkitTextFillColor: "rgba(255,255,255,0.2)" }}>
                                Vos décisions méritent la clarté. Soumettez une première situation pour générer votre synthèse personnalisée.
                              </span>
                            )}
                          </p>
                          {lastQuestions.length > 0 && (
                            <div className="flex items-center gap-5 mt-7 pt-6 border-t border-white/[0.06]">
                              {[
                                { l: "Analyses", v: lastQuestions.length },
                                { l: "Score moyen", v: `${animAvg}/100` },
                                { l: "Meilleur", v: bestScore ? `${bestScore}/100` : "—" },
                              ].map((s, i, arr) => (
                                <div key={s.l} className="flex items-center gap-5">
                                  <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-0.5">{s.l}</p>
                                    <p className="text-lg font-bold text-white/55">{s.v}</p>
                                  </div>
                                  {i < arr.length - 1 && <div className="h-7 w-px bg-white/[0.06]" />}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* MODAL RESULT */}
        {showResult && (
          <div className="overlay-modal fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(13,14,18,0.96)", backdropFilter: "blur(24px)" }}
          >
            <div className="modal-content w-full max-w-5xl max-h-[88vh] overflow-y-auto rounded-3xl border border-white/[0.08]"
              style={{ background: "#0f1117" }}
            >
              <ResultIA data={dataIA} onBack={handleBack} />
            </div>
          </div>
        )}

        {/* MODAL ANALYSE */}
        {showIntro && (
          <div className="overlay-modal fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(13,14,18,0.94)", backdropFilter: "blur(20px)" }}
          >
            <div className="modal-content w-full max-w-2xl">
              <HandleAnalyse onCancel={() => setShowIntro(false)} onSuccess={handleAnalysisSuccess} />
            </div>
          </div>
        )}
      </main>
    </>
  );
}