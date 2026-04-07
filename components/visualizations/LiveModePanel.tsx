"use client";

import { motion } from "framer-motion";
import { useLiveProduction } from "@/hooks/useLiveProduction";
import AnimatedNumber from "@/components/ui/AnimatedNumber";

interface LiveModePanelProps {
  systemKw: number;
  onClose: () => void;
}

// Pure-SVG sparkline — no recharts dependency
function Sparkline({ history, peak }: { history: number[]; peak: number }) {
  if (history.length < 2) return null;
  const w = 100;
  const h = 100;
  const max = Math.max(peak, ...history, 1);

  const toPoint = (val: number, i: number) => {
    const x = (i / (history.length - 1)) * w;
    const y = h - (val / max) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };

  const points = history.map(toPoint).join(" ");

  // Build area path: line + vertical drop + horizontal base + close
  const firstPt = toPoint(history[0], 0);
  const lastPt = toPoint(history[history.length - 1], history.length - 1);
  const areaPath = `M${firstPt} ${history.map((v, i) => (i === 0 ? "" : `L${toPoint(v, i)}`)).join(" ")} L${(100).toFixed(1)},${(100).toFixed(1)} L0,${(100).toFixed(1)} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height: 52 }}
    >
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkGrad)" />
      <polyline
        points={points}
        fill="none"
        stroke="#38bdf8"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LiveModePanel({ systemKw, onClose }: LiveModePanelProps) {
  const { watts, peak, efficiency, history, isNight, timeLabel } =
    useLiveProduction(systemKw);

  return (
    <motion.div
      initial={{ y: 80, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 80, opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed bottom-6 left-1/2 z-50 w-[340px] -translate-x-1/2"
    >
      <div
        className="rounded-3xl border border-sky-500/20 overflow-hidden shadow-2xl"
        style={{
          background: "rgba(10,14,20,0.92)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 0 60px rgba(56,189,248,0.08), 0 24px 48px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: isNight ? "rgba(255,255,255,0.3)" : "#38bdf8" }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: isNight ? "rgba(255,255,255,0.3)" : "#38bdf8" }}
              />
            </span>
            <span className="text-[10px] text-sky-400 uppercase tracking-[0.2em] font-semibold">
              Live Output
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-white/25">{timeLabel}</span>
            <button
              onClick={onClose}
              className="w-5 h-5 flex items-center justify-center rounded-full text-white/25 hover:text-white/60 transition-colors text-xs"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main watt number */}
        <div className="px-5 pb-1">
          {isNight ? (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white/20 tabular-nums">0</span>
              <span className="text-lg text-white/15">W</span>
              <span className="text-[10px] text-white/20 ml-1">Night — no production</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <AnimatedNumber
                value={watts}
                format={(n) => n.toLocaleString()}
                className="text-4xl font-bold text-white tabular-nums"
                stiffness={30}
                damping={12}
              />
              <span className="text-lg text-white/35">W</span>
            </div>
          )}
        </div>

        {/* Efficiency bar */}
        <div className="px-5 pb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] text-white/25 uppercase tracking-widest">
              Efficiency
            </span>
            <span className="text-[9px] text-sky-400/70">
              {isNight ? "0" : efficiency}%
            </span>
          </div>
          <div className="h-1 rounded-full bg-white/6 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, #0ea5e9, #38bdf8)",
              }}
              animate={{ width: `${isNight ? 0 : efficiency}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Sparkline */}
        <div className="px-5 pb-2">
          <Sparkline history={history} peak={peak} />
        </div>

        {/* Stats row */}
        <div className="flex items-stretch border-t border-white/[0.05]">
          <div className="flex-1 px-5 py-3 border-r border-white/[0.05]">
            <p className="text-[8px] text-white/22 uppercase tracking-widest mb-1">Peak</p>
            <p className="text-sm font-semibold text-white/50 tabular-nums">
              {(peak / 1000).toFixed(1)} kW
            </p>
          </div>
          <div className="flex-1 px-5 py-3">
            <p className="text-[8px] text-white/22 uppercase tracking-widest mb-1">
              Right now
            </p>
            <p className="text-sm font-semibold text-white/50 tabular-nums">
              {isNight ? "—" : `${(watts / 1000).toFixed(2)} kW`}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
