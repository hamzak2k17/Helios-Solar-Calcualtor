"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import type { SolarResult } from "@/lib/solarCalculations";

// ── Helper types ──────────────────────────────────────────────────────────────

interface UIOverlayProps {
  isNight: boolean;
  showFlow: boolean;
  simHour: number;
  solarFactor: number;
  currentKw: number;
  result: SolarResult;
  selectedPanel: number | null;
  onToggleNight: () => void;
  onToggleFlow: () => void;
  onPanelDeselect: () => void;
}

// ── Utility helpers ───────────────────────────────────────────────────────────

function formatHour(hour: number): string {
  const h = Math.floor(hour) % 24;
  const m = Math.floor((hour % 1) * 60);
  const ampm = h >= 12 ? "PM" : "AM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:${m.toString().padStart(2, "0")} ${ampm}`;
}

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

// ── Glass card ────────────────────────────────────────────────────────────────

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 ${className}`}
      style={{
        background: "rgba(6, 8, 18, 0.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {children}
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="pointer-events-auto flex items-center justify-between w-full group"
    >
      <span className="text-[11px] text-white/45 group-hover:text-white/65 transition-colors tracking-wide">
        {label}
      </span>
      <div
        className={`relative w-8 h-4 rounded-full transition-colors duration-300 ${
          checked ? "bg-sky-500" : "bg-white/12"
        }`}
      >
        <motion.div
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow"
          animate={{ left: checked ? "calc(100% - 14px)" : "2px" }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      </div>
    </button>
  );
}

// ── Flow node in bottom bar ───────────────────────────────────────────────────

function FlowNode({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xl" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
        {icon}
      </span>
      <span className="text-[9px] text-white/35 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-semibold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function FlowArrow({ color }: { color: string }) {
  return (
    <motion.div
      className="flex items-center gap-0.5 self-center mb-2"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1 h-1 rounded-full"
          style={{ background: color, opacity: 1 - i * 0.25 }}
        />
      ))}
    </motion.div>
  );
}

// ── Main UIOverlay ────────────────────────────────────────────────────────────

export default function UIOverlay({
  isNight,
  showFlow,
  simHour,
  solarFactor,
  currentKw,
  result,
  selectedPanel,
  onToggleNight,
  onToggleFlow,
  onPanelDeselect,
}: UIOverlayProps) {
  const {
    systemSize,
    system: { panels, coveragePercent },
    financials: { monthlySavings },
    investment: { netCost },
    location,
    assumptions: { panelWattPeak },
  } = result;

  const savingsPerHour = (monthlySavings / 30 / 24) * solarFactor;
  const peakKw = systemSize;
  const efficiencyPct = Math.round(solarFactor * 100);

  // Per-panel output
  const perPanelW = (currentKw * 1000) / panels;

  return (
    <div className="absolute inset-0 select-none">
      {/* ── Top-left: production stats ──────────────────────────────── */}
      <motion.div
        className="absolute top-5 left-5 w-64"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <GlassCard className="p-5">
          {/* Live indicator */}
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: isNight ? "rgba(255,255,255,0.2)" : "#38bdf8" }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: isNight ? "rgba(255,255,255,0.2)" : "#38bdf8" }}
              />
            </span>
            <span className="text-[9px] text-sky-400 uppercase tracking-[0.25em] font-semibold">
              Solar Output
            </span>
          </div>

          {/* Main kW reading */}
          <div className="flex items-baseline gap-1.5 mb-1">
            <AnimatedNumber
              value={Math.round(currentKw * 100) / 100}
              format={(n) => (n / 100).toFixed(2)}
              className="text-4xl font-bold text-white tabular-nums"
              stiffness={28}
              damping={12}
            />
            <span className="text-white/35 text-base">kW</span>
            <span className="text-white/20 text-xs ml-1">/ {peakKw.toFixed(1)} pk</span>
          </div>

          {/* Efficiency bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[9px] text-white/25 uppercase tracking-widest">
                Efficiency
              </span>
              <span className="text-[9px] text-sky-400/70">{isNight ? 0 : efficiencyPct}%</span>
            </div>
            <div className="h-1 rounded-full bg-white/6 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #0369a1, #38bdf8)",
                }}
                animate={{ width: `${isNight ? 0 : efficiencyPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Secondary stats */}
          <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-3">
            <div className="flex justify-between text-xs">
              <span className="text-white/30">System</span>
              <span className="text-white/55 font-medium">{systemSize.toFixed(1)} kW · {panels} panels</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/30">Location</span>
              <span className="text-white/55 font-medium">{location.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/30">Coverage</span>
              <span className="text-sky-400/80 font-medium">{coveragePercent}% of bill</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/30">Net cost</span>
              <span className="text-white/55 font-medium">${netCost.toLocaleString()}</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── Top-right: controls ──────────────────────────────────────── */}
      <motion.div
        className="absolute top-5 right-5 w-52"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
      >
        <GlassCard className="p-5">
          {/* Simulated time */}
          <div className="mb-4">
            <p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">
              Simulated Time
            </p>
            <p className="text-2xl font-bold text-white tabular-nums">
              {formatHour(simHour)}
            </p>
            {/* Day arc indicator */}
            <div className="mt-2 h-1 rounded-full bg-white/6 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(simHour / 24) * 100}%`,
                  background: isNight
                    ? "linear-gradient(90deg, #1a1f6e, #4433aa)"
                    : "linear-gradient(90deg, #f97316, #facc15, #38bdf8)",
                }}
              />
            </div>
            <div className="flex justify-between text-[8px] text-white/18 mt-1">
              <span>12 AM</span>
              <span>12 PM</span>
              <span>11 PM</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-3">
            <Toggle
              label="Night Mode"
              checked={isNight}
              onChange={onToggleNight}
            />
            <Toggle
              label="Energy Flow"
              checked={showFlow}
              onChange={onToggleFlow}
            />
          </div>

          {/* Back link */}
          <div className="mt-4 pt-3 border-t border-white/[0.06]">
            <Link
              href="/"
              className="pointer-events-auto flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/55 transition-colors"
            >
              <span>←</span>
              <span>Back to Calculator</span>
            </Link>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── Bottom: energy flow bar ──────────────────────────────────── */}
      <motion.div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 w-full max-w-xl px-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
      >
        <GlassCard className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] text-white/25 uppercase tracking-[0.22em]">
              Energy Flow
            </p>
            <p className="text-[9px] text-white/20">
              {isNight ? "Night — no production" : `${formatHour(simHour)}`}
            </p>
          </div>

          {/* Flow nodes */}
          <div className="flex items-center justify-between">
            <FlowNode
              icon="☀"
              label="Sun"
              color="#fbbf24"
              value={isNight ? "0%" : `${efficiencyPct}%`}
            />
            <FlowArrow color="#fbbf24" />
            <FlowNode
              icon="⚡"
              label="Panels"
              color="#38bdf8"
              value={`${currentKw.toFixed(2)} kW`}
            />
            <FlowArrow color="#38bdf8" />
            <FlowNode
              icon="⌂"
              label="Home"
              color="#4ade80"
              value={`${coveragePercent}% offset`}
            />
            <FlowArrow color="#a855f7" />
            <FlowNode
              icon="⚡"
              label="Grid"
              color="#a855f7"
              value={currentKw > 0 ? "Exporting" : "Drawing"}
            />
          </div>

          {/* Savings strip */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
            <div className="flex items-baseline gap-1">
              <span className="text-[9px] text-white/25">Saving</span>
              <span className="text-sm font-bold text-sky-400">
                ${savingsPerHour.toFixed(3)}
              </span>
              <span className="text-[9px] text-white/25">/hr</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[9px] text-white/25">Monthly est.</span>
              <span className="text-sm font-bold text-white/70">
                ${Math.round(monthlySavings).toLocaleString()}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[9px] text-white/25">Panel output</span>
              <span className="text-sm font-bold text-white/70">
                {isNight ? "—" : `${Math.round(perPanelW)} W`}
              </span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── Panel detail popup (appears when a panel is selected) ──────── */}
      <AnimatePresence>
        {selectedPanel !== null && (
          <motion.div
            key="panel-detail"
            className="absolute top-5 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: -16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.94 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <GlassCard className="px-5 py-3 flex items-center gap-6">
              <div>
                <p className="text-[9px] text-white/28 uppercase tracking-widest mb-0.5">
                  Panel #{selectedPanel + 1}
                </p>
                <p className="text-white/55 text-xs">
                  {panelWattPeak}W monocrystalline
                </p>
              </div>
              <div className="flex gap-5">
                <div>
                  <p className="text-[8px] text-white/22 mb-0.5">Output</p>
                  <p className="text-sm font-bold text-sky-400">
                    {isNight ? "0" : Math.round(perPanelW)} W
                  </p>
                </div>
                <div>
                  <p className="text-[8px] text-white/22 mb-0.5">Efficiency</p>
                  <p className="text-sm font-bold text-white/65">
                    {isNight ? 0 : efficiencyPct}%
                  </p>
                </div>
                <div>
                  <p className="text-[8px] text-white/22 mb-0.5">Annual</p>
                  <p className="text-sm font-bold text-white/65">
                    {Math.round(result.production.annualKwh / panels).toLocaleString()} kWh
                  </p>
                </div>
              </div>
              <button
                onClick={onPanelDeselect}
                className="pointer-events-auto ml-2 w-6 h-6 rounded-full border border-white/10 text-white/30 hover:text-white/60 transition-colors text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
