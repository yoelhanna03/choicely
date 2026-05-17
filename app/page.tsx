"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StepProps {
  number: string;
  title: string;
  desc: string;
}

interface FeatureCardProps {
  icon: string;
  title: string;
  desc: string;
}

interface MetricProps {
  value: string;
  label: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS: StepProps[] = [
  {
    number: "01",
    title: "Exposez votre situation",
    desc: "Décrivez librement votre contexte, vos hésitations ou votre choix difficile. Aucune limite de forme.",
  },
  {
    number: "02",
    title: "Analyse stratégique",
    desc: "Choicely identifie les conséquences, opportunités, risques et angles oubliés de votre situation.",
  },
  {
    number: "03",
    title: "Clarté immédiate",
    desc: "Une synthèse limpide, structurée et exploitable, livrée en quelques secondes pour agir avec certitude.",
  },
];

const FEATURES: FeatureCardProps[] = [
  {
    icon: "👁",
    title: "Conséquences visibles",
    desc: "Court, moyen et long terme analysés ensemble pour une vision complète de vos options.",
  },
  {
    icon: "↗",
    title: "Vision élargie",
    desc: "Biais cognitifs détectés et neutralisés. Des perspectives que vous n'aviez pas envisagées.",
  },
  {
    icon: "⚡",
    title: "Synthèse instantanée",
    desc: "Une vue claire, exploitable et fiable. Prête à partager ou à mettre en œuvre immédiatement.",
  },
  {
    icon: "⑂",
    title: "Scénarios comparés",
    desc: "Visualisez vos options côte à côte avec leurs forces, faiblesses et zones d'ombre.",
  },
  {
    icon: "◷",
    title: "Historique décisionnel",
    desc: "Retrouvez toutes vos analyses passées pour mesurer l'évolution de votre prise de décision.",
  },
  {
    icon: "◎",
    title: "Mode collaboratif",
    desc: "Invitez votre équipe à contribuer pour des décisions collectives plus éclairées.",
  },
];

const METRICS: MetricProps[] = [
  { value: "3×", label: "Plus rapide" },
  { value: "94%", label: "Satisfaction" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Step({ number, title, desc }: StepProps) {
  return (
    <div className="step-card group relative overflow-hidden bg-[#0F0F17] p-10 transition-colors duration-300 hover:bg-[#141420]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_100%,rgba(91,79,232,0.10),transparent_55%)] opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
      <span
        className="mb-6 block font-cormorant text-[56px] font-light leading-none tracking-[-0.03em]"
        style={{ color: "rgba(91,79,232,0.18)" }}
      >
        {number}
      </span>
      <p className="mb-2.5 text-[14.5px] font-normal text-[#EDEAF8]">{title}</p>
      <p className="text-[13px] font-light leading-[1.68] text-[rgba(237,234,248,0.50)]">{desc}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <div className="group rounded-[20px] border border-[rgba(255,255,255,0.07)] bg-[#0F0F17] p-[1.8rem_1.6rem] transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(91,79,232,0.28)]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[11px] border border-[rgba(91,79,232,0.20)] bg-[rgba(91,79,232,0.12)] text-lg text-[rgba(180,170,255,0.8)]">
        {icon}
      </div>
      <p className="mb-2 text-sm font-normal text-[#EDEAF8]">{title}</p>
      <p className="text-[12.5px] font-light leading-[1.68] text-[rgba(237,234,248,0.50)]">{desc}</p>
    </div>
  );
}

function Metric({ value, label }: MetricProps) {
  return (
    <div className="flex-1 rounded-2xl border border-[rgba(255,255,255,0.11)] bg-[#0F0F17] px-6 py-5">
      <span
        className="mb-1 block font-cormorant text-[38px] font-light leading-none"
        style={{
          background: "linear-gradient(130deg,#5B4FE8,#00C8D7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {value}
      </span>
      <span className="text-[10.5px] font-light uppercase tracking-[0.1em] text-[rgba(237,234,248,0.32)]">
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div
      className="h-px w-full opacity-20"
      style={{
        background:
          "linear-gradient(90deg,transparent,#5B4FE8 40%,#00C8D7 60%,transparent)",
      }}
    />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-3.5 block text-[10.5px] font-normal uppercase tracking-[0.2em] text-[#5B4FE8]">
      {children}
    </span>
  );
}

// ─── Background 3D canvas hook ────────────────────────────────────────────────

function useBackgroundCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    // Minimal WebGL-free particle field using 2D canvas as fallback
    // For production, swap this for a Three.js import
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = W();
    canvas.height = H();

    type Node = {
      x: number; y: number;
      vx: number; vy: number;
      r: number; color: string;
    };

    const nodes: Node[] = Array.from({ length: 22 }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? "#5B4FE8" : "#00C8D7",
    }));

    let mouse = { x: W() / 2, y: H() / 2 };
    const onMouse = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener("mousemove", onMouse);

    const onResize = () => {
      canvas.width = W();
      canvas.height = H();
    };
    window.addEventListener("resize", onResize);

    const draw = () => {
      ctx.clearRect(0, 0, W(), H());

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(91,79,232,${(1 - dist / 180) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color + "99";
        ctx.fill();

        // Gentle attraction to mouse
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 300) {
          n.vx += (dx / d) * 0.012;
          n.vy += (dy / d) * 0.012;
        }

        n.x += n.vx;
        n.y += n.vy;
        n.vx *= 0.99;
        n.vy *= 0.99;

        if (n.x < 0 || n.x > W()) n.vx *= -1;
        if (n.y < 0 || n.y > H()) n.vy *= -1;
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
    };
  }, [canvasRef]);
}

// ─── Mini crystal canvas hook ─────────────────────────────────────────────────

function useCrystalCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement!;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    const ctx = canvas.getContext("2d")!;
    let animId: number;
    let angle = 0;

    type Orb = { a: number; rad: number; sp: number; y: number; color: string };
    const orbs: Orb[] = Array.from({ length: 6 }, (_, i) => ({
      a: (i / 6) * Math.PI * 2,
      rad: 60 + (i % 2) * 22,
      sp: 0.008 + i * 0.0008,
      y: (i % 3 - 1) * 28,
      color: i % 2 === 0 ? "#00C8D7" : "#5B4FE8",
    }));

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    let mx = 0, my = 0;
    const onMouse = (e: MouseEvent) => {
      const rc = parent.getBoundingClientRect();
      mx = ((e.clientX - rc.left) / rc.width - 0.5) * 30;
      my = ((e.clientY - rc.top) / rc.height - 0.5) * 30;
    };
    parent.addEventListener("mousemove", onMouse);

    const drawIcosahedron = (x: number, y: number, r: number, color: string, alpha: number) => {
      const sides = 6;
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2 + angle;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r * 0.6;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = color + Math.round(alpha * 255).toString(16).padStart(2, "0");
      ctx.lineWidth = 1;
      ctx.stroke();
      // inner
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2 - angle;
        const px = x + Math.cos(a) * r * 0.6;
        const py = y + Math.sin(a) * r * 0.36;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      angle += 0.004;

      const ox = cx + mx * 0.3;
      const oy = cy + my * 0.3;

      // Ring
      ctx.beginPath();
      ctx.ellipse(ox, oy, 100, 38, angle * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,200,215,0.18)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Crystal
      drawIcosahedron(ox, oy, 55, "#5B4FE8", 0.55);
      drawIcosahedron(ox, oy, 35, "#00C8D7", 0.35);

      // Orbiting dots
      orbs.forEach((o) => {
        o.a += o.sp;
        const px = ox + Math.cos(o.a) * o.rad;
        const py = oy + Math.sin(o.a) * o.rad * 0.4 + o.y * 0.3;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = o.color + "BB";
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      parent.removeEventListener("mousemove", onMouse);
    };
  }, [canvasRef]);
}

// ─── Scroll reveal hook ───────────────────────────────────────────────────────

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const bgRef = useRef<HTMLCanvasElement | null>(null);
  const crystalRef = useRef<HTMLCanvasElement | null>(null);

  useBackgroundCanvas(bgRef);
  useCrystalCanvas(crystalRef);
  useScrollReveal();

  return (
    <>
      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        body { font-family: 'DM Sans', sans-serif; }

        /* Scroll reveal */
        .reveal { opacity: 0; transform: translateY(22px); transition: opacity .65s ease, transform .65s ease; }
        .reveal.in { opacity: 1; transform: none; }

        /* Step card grid border trick */
        .steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.07); border-radius: 22px; overflow: hidden; }

        /* Hero animations */
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
        .anim-0 { opacity:0; animation: fadeUp .7s .05s ease forwards; }
        .anim-1 { opacity:0; animation: fadeUp .8s .10s ease forwards; }
        .anim-2 { opacity:0; animation: fadeUp .8s .20s ease forwards; }
        .anim-3 { opacity:0; animation: fadeUp .8s .30s ease forwards; }
        .anim-4 { opacity:0; animation: fadeUp 1s .80s ease forwards; }

        /* Scroll cue */
        @keyframes grow { 0%{transform:scaleY(0);transform-origin:top} 50%{transform:scaleY(1);transform-origin:top} 51%{transform:scaleY(1);transform-origin:bottom} 100%{transform:scaleY(0);transform-origin:bottom} }
        .scroll-bar { width:1px; height:36px; background:linear-gradient(to bottom,transparent,#5B4FE8); animation:grow 1.8s infinite; }

        /* Pulse dot */
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.25} }
        .dot { animation: blink 2.4s infinite; }
      `}</style>

      {/* Background canvas */}
      <canvas
        ref={bgRef}
        className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-30"
      />

      <div className="relative z-10 mx-auto max-w-[1060px] px-10">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative flex min-h-screen flex-col items-center justify-center px-8 pb-20 pt-24 text-center">

          {/* Badge */}
          <div className="anim-0 mb-9 inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.11)] bg-[rgba(91,79,232,0.08)] px-4 py-1.5">
            <span className="dot h-[5px] w-[5px] rounded-full bg-[#00C8D7]" />
            <span className="text-[11px] uppercase tracking-[0.12em] text-[rgba(237,234,248,0.5)]">
              Analyse décisionnelle par IA
            </span>
          </div>

          {/* Title */}
          <h1 className="anim-1 font-cormorant mb-6 text-[clamp(54px,8.5vw,100px)] font-light leading-[1.03] tracking-[-0.025em]">
            Décidez avec{" "}
            <em
              style={{
                fontStyle: "italic",
                background: "linear-gradient(110deg,#5B4FE8,#00C8D7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              clarté absolue.
            </em>
          </h1>

          {/* Subtitle */}
          <p className="anim-2 mb-11 max-w-[480px] text-[15px] font-light leading-[1.75] text-[rgba(237,234,248,0.50)]">
            Choicely décompose vos situations complexes, révèle les scénarios cachés et illumine ce
            qui compte vraiment — en quelques secondes.
          </p>

          {/* CTAs */}
          <div className="anim-3 flex gap-3.5">
            <Link
              href="/auth/signup"
              className="rounded-full px-8 py-3.5 text-[13.5px] font-normal text-white transition-all duration-200 hover:opacity-[0.88] hover:-translate-y-0.5"
              style={{ background: "linear-gradient(130deg,#5B4FE8,#00C8D7)" }}
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/auth/login"
              className="rounded-full border border-[rgba(255,255,255,0.11)] px-8 py-3.5 text-[13.5px] font-light text-[rgba(237,234,248,0.50)] transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)] hover:text-[#EDEAF8]"
            >
              Se connecter
            </Link>
          </div>

          {/* Scroll cue */}
          <div className="anim-4 absolute bottom-10 flex flex-col items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[rgba(237,234,248,0.32)]">
              Découvrir
            </span>
            <div className="scroll-bar" />
          </div>
        </section>

        <Divider />

        {/* ── STEPS ────────────────────────────────────────────────────── */}
        <section className="reveal py-[5.5rem]">
          <div className="mb-14 text-center">
            <SectionLabel>Processus</SectionLabel>
            <h2 className="font-cormorant text-[clamp(30px,4vw,46px)] font-light leading-[1.18] tracking-[-0.02em]">
              Un chemin en trois{" "}
              <em className="font-light italic text-[rgba(237,234,248,0.5)]">instants</em>
            </h2>
          </div>
          <div className="steps-grid">
            {STEPS.map((s) => (
              <Step key={s.number} {...s} />
            ))}
          </div>
        </section>

        <Divider />

        {/* ── SPLIT ────────────────────────────────────────────────────── */}
        <section className="reveal py-[5.5rem]">
          <div className="grid grid-cols-2 items-center gap-20">
            {/* Crystal canvas */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] border border-[rgba(255,255,255,0.11)] bg-[#0F0F17]">
              <canvas ref={crystalRef} className="absolute inset-0 h-full w-full" />
            </div>

            {/* Text */}
            <div>
              <SectionLabel>Méthodologie</SectionLabel>
              <h2 className="font-cormorant mb-5 text-[clamp(28px,3.5vw,40px)] font-light leading-[1.22] tracking-[-0.02em]">
                Une méthode structurée
                <br />
                pour décider{" "}
                <em className="font-light italic text-[rgba(237,234,248,0.5)]">mieux.</em>
              </h2>
              <p className="mb-3.5 text-[13.5px] font-light leading-[1.78] text-[rgba(237,234,248,0.50)]">
                Chaque décision repose sur des conséquences, des zones d'incertitude et des aspects
                que l'on ne perçoit pas immédiatement.
              </p>
              <p className="text-[13.5px] font-light leading-[1.78] text-[rgba(237,234,248,0.50)]">
                Choicely organise ces éléments, clarifie les scénarios possibles et met en évidence
                les leviers essentiels pour agir.
              </p>
              <div className="mt-8 flex gap-5">
                {METRICS.map((m) => (
                  <Metric key={m.label} {...m} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* ── FEATURES ─────────────────────────────────────────────────── */}
        <section className="reveal py-[5.5rem]">
          <div className="mb-14 text-center">
            <SectionLabel>Fonctionnalités</SectionLabel>
            <h2 className="font-cormorant text-[clamp(30px,4vw,46px)] font-light leading-[1.18] tracking-[-0.02em]">
              Conçu pour rendre la clarté{" "}
              <em className="font-light italic text-[rgba(237,234,248,0.5)]">accessible</em>
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </section>

        <Divider />

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section className="reveal pb-24 pt-[5rem]">
          <div className="relative overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.07)] bg-[#0F0F17] px-8 py-[4.5rem] text-center">
            {/* Glow */}
            <div
              className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 -translate-y-16"
              style={{
                background: "radial-gradient(ellipse,rgba(91,79,232,0.18),transparent 70%)",
              }}
            />
            <h2 className="font-cormorant relative mb-3.5 text-[clamp(32px,5vw,52px)] font-light leading-[1.15]">
              Prêt à décider avec
              <br />
              <em
                style={{
                  fontStyle: "italic",
                  background: "linear-gradient(110deg,#5B4FE8,#00C8D7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                plus de certitude ?
              </em>
            </h2>
            <p className="relative mb-8 text-[14px] font-light text-[rgba(237,234,248,0.50)]">
              Une analyse claire et immédiate pour avancer avec confiance.
            </p>
            <Link
              href="/auth/signup"
              className="relative inline-block rounded-full px-10 py-4 text-[13.5px] font-normal text-white transition-all duration-200 hover:opacity-[0.88] hover:-translate-y-0.5"
              style={{ background: "linear-gradient(130deg,#5B4FE8,#00C8D7)" }}
            >
              Commencer maintenant — c'est gratuit
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}