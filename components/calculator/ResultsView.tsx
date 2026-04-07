"use client";

import { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
} from "framer-motion";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import SavingsLineChart from "@/components/charts/SavingsLineChart";
import ProductionBarChart from "@/components/charts/ProductionBarChart";
import EnergyFlowDiagram from "@/components/visualizations/EnergyFlowDiagram";
import LiveModePanel from "@/components/visualizations/LiveModePanel";
import type { SolarResult } from "@/lib/solarCalculations";
import { useCalcStore } from "@/store/calculatorStore";

interface ResultsViewProps {
  result: SolarResult;
  onReset: () => void;
  onExit: () => void;
}

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

// ── Reveal on scroll into view ────────────────────────────────────────────────
function RevealSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// ── 3-D mouse-tracking tilt card ──────────────────────────────────────────────
function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 220, damping: 28 });
  const springY = useSpring(my, { stiffness: 220, damping: 28 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);

  return (
    <div style={{ perspective: "900px" }}>
      <motion.div
        ref={cardRef}
        className={className}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={(e) => {
          const rect = cardRef.current?.getBoundingClientRect();
          if (!rect) return;
          mx.set((e.clientX - rect.left) / rect.width - 0.5);
          my.set((e.clientY - rect.top) / rect.height - 0.5);
        }}
        onMouseLeave={() => {
          mx.set(0);
          my.set(0);
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ── Metric card (4-up grid) ───────────────────────────────────────────────────
function MetricCard({
  label,
  value,
  format,
  sub,
  accent = false,
}: {
  label: string;
  value: number;
  format: (n: number) => string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <TiltCard className="relative p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden h-full">
      {accent && (
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/6 to-transparent pointer-events-none" />
      )}
      <p className="text-[9px] text-white/28 uppercase tracking-[0.18em] mb-3">{label}</p>
      <AnimatedNumber
        value={value}
        format={format}
        className={`text-2xl font-bold tabular-nums ${accent ? "text-sky-400" : "text-white"}`}
        stiffness={65}
        damping={15}
      />
      <p className="text-[9px] text-white/20 mt-2 leading-snug">{sub}</p>
    </TiltCard>
  );
}

// ── Chart section wrapper ─────────────────────────────────────────────────────
function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.025] border border-white/[0.06]">
      <div className="flex items-baseline justify-between mb-4">
        <p className="text-[10px] text-white/32 uppercase tracking-widest">{title}</p>
        {subtitle && <p className="text-[9px] text-white/18">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function ChartLegend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block w-2.5 h-2 rounded-sm"
        style={{ background: color }}
      />
      <span className="text-[9px] text-white/28">{label}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ResultsView({ result, onReset }: ResultsViewProps) {
  const { location, roofSize } = useCalcStore();
  const [isLive, setIsLive] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  // Parallax: background glow drifts up as user scrolls
  const glowY = useTransform(scrollYProgress, [0, 1], [0, -90]);

  const { systemKw, panels, coveragePercent } = result.system;
  const {
    monthlySavings,
    annualSavings,
    paybackYears,
    netSavings25yr,
    cumulativeCashFlow,
    yearlySavings,
  } = result.financials;
  const { annualCo2Tons } = result.environmental;
  const { grossCost, federalCredit, netCost } = result.investment;
  const annualKwhGenerated = result.production.annualKwh;
  const yearlyProduction = result.production.yearlyProduction;
  const annualUsage = result.usage.annualKwh;

  return (
    <>
      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative">
        {/* Parallax background glow */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
          style={{
            y: glowY,
            background:
              "radial-gradient(ellipse, rgba(56,189,248,0.055) 0%, transparent 65%)",
          }}
        />

        <div className="relative max-w-2xl mx-auto px-6 md:px-8 py-10 flex flex-col gap-6">
          {/* ── Header ──────────────────────────────────────────────────── */}
          <RevealSection>
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
                  </span>
                  <p className="text-[10px] text-sky-400 uppercase tracking-[0.2em] font-semibold">
                    Your Estimate Is Ready
                  </p>
                </div>
                <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
                  Save{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">
                    ${Math.round(annualSavings).toLocaleString()}/year
                  </span>
                </h2>
                {location && (
                  <p className="text-white/32 text-sm">
                    {location}
                    {roofSize ? (
                      <span className="text-white/18"> · {roofSize.toLocaleString()} ft²</span>
                    ) : null}
                  </p>
                )}
              </div>

              {/* Live mode toggle */}
              <motion.button
                onClick={() => setIsLive((v) => !v)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-[10px] font-semibold uppercase tracking-widest transition-all duration-300 ${
                  isLive
                    ? "border-sky-500/50 text-sky-400 bg-sky-500/8"
                    : "border-white/10 text-white/35 hover:border-white/20 hover:text-white/55"
                }`}
              >
                <span
                  className={`relative flex h-1.5 w-1.5 ${isLive ? "opacity-100" : "opacity-50"}`}
                >
                  {isLive && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                  )}
                  <span
                    className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ backgroundColor: isLive ? "#38bdf8" : "rgba(255,255,255,0.35)" }}
                  />
                </span>
                Live
              </motion.button>
            </div>
          </RevealSection>

          {/* ── Energy Flow Diagram ──────────────────────────────────────── */}
          <RevealSection delay={0.06}>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-[9px] text-white/25 uppercase tracking-widest mb-4">
                Energy Flow
              </p>
              <EnergyFlowDiagram isLive={isLive} />
            </div>
          </RevealSection>

          {/* ── System hero card ─────────────────────────────────────────── */}
          <RevealSection delay={0.1}>
            <TiltCard className="p-6 rounded-3xl bg-gradient-to-br from-sky-500/10 to-blue-600/4 border border-sky-500/18">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-white/28 uppercase tracking-widest mb-2">
                    Recommended System
                  </p>
                  <div className="flex items-baseline gap-2">
                    <AnimatedNumber
                      value={Math.round(systemKw * 10)}
                      format={(n) => (n / 10).toFixed(1)}
                      className="text-5xl font-bold text-white tabular-nums"
                      stiffness={50}
                      damping={14}
                    />
                    <span className="text-2xl text-white/30">kW</span>
                  </div>
                  <p className="text-sm text-white/32 mt-1.5">
                    <span className="text-white/55 font-medium">{panels} panels</span>
                    {" · "}
                    <span className="text-white/55 font-medium">
                      {annualKwhGenerated.toLocaleString()} kWh
                    </span>
                    {" "}/ year
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {/* Pulsing sun icon */}
                  <motion.div
                    className="w-16 h-16 rounded-full bg-sky-500/8 border border-sky-500/14 flex items-center justify-center"
                    animate={{ boxShadow: ["0 0 0px rgba(56,189,248,0)", "0 0 24px rgba(56,189,248,0.2)", "0 0 0px rgba(56,189,248,0)"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <span className="text-2xl">☀️</span>
                  </motion.div>
                  <div className="text-right">
                    <p className="text-[9px] text-white/22 uppercase tracking-widest">
                      Coverage
                    </p>
                    <p className="text-sm font-bold text-sky-400">{coveragePercent}%</p>
                  </div>
                </div>
              </div>
            </TiltCard>
          </RevealSection>

          {/* ── 4 key metrics ────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                label: "Monthly Savings",
                value: Math.round(monthlySavings),
                format: (n: number) => `$${n.toLocaleString()}`,
                sub: "saved per month",
                accent: true,
              },
              {
                label: "Payback Period",
                value: Math.round(paybackYears * 10),
                format: (n: number) => `${(n / 10).toFixed(1)} yrs`,
                sub: "to break even",
                accent: false,
              },
              {
                label: "System Size",
                value: Math.round(systemKw * 10),
                format: (n: number) => `${(n / 10).toFixed(1)} kW`,
                sub: `${panels} panels · ${result.location.peakSunHours}h sun/day`,
                accent: false,
              },
              {
                label: "CO₂ Offset",
                value: Math.round(annualCo2Tons * 10),
                format: (n: number) => `${(n / 10).toFixed(1)} t`,
                sub: `≈ ${result.environmental.carsEquivalent} cars off road/yr`,
                accent: false,
              },
            ].map((card, i) => (
              <RevealSection key={card.label} delay={0.04 * i}>
                <MetricCard {...card} />
              </RevealSection>
            ))}
          </div>

          {/* ── 25-year financial projection ─────────────────────────────── */}
          <RevealSection delay={0.04}>
            <ChartCard
              title="25-Year Financial Projection"
              subtitle="Cumulative cash flow"
            >
              <SavingsLineChart
                cumulativeCashFlow={cumulativeCashFlow}
                yearlySavings={yearlySavings}
                paybackYears={paybackYears}
                netCost={netCost}
              />
              <div className="flex items-center gap-4 mt-3 px-1">
                <ChartLegend color="#38bdf8" label="Cumulative savings" />
                <ChartLegend color="rgba(255,255,255,0.1)" label="Payback zone" />
              </div>
            </ChartCard>
          </RevealSection>

          {/* ── Energy production vs usage ────────────────────────────────── */}
          <RevealSection delay={0.04}>
            <ChartCard
              title="Solar Production vs Usage"
              subtitle="Panel degradation over 25 yrs"
            >
              <ProductionBarChart
                yearlyProduction={yearlyProduction}
                annualUsage={annualUsage}
              />
              <div className="flex items-center gap-4 mt-3 px-1">
                <ChartLegend color="#38bdf8" label="Solar production" />
                <ChartLegend color="rgba(255,255,255,0.1)" label="Annual usage" />
              </div>
            </ChartCard>
          </RevealSection>

          {/* ── 25-yr savings + investment ───────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <RevealSection>
              <TiltCard className="p-5 rounded-2xl bg-gradient-to-br from-sky-500/8 to-blue-600/4 border border-sky-500/14 h-full">
                <p className="text-[9px] text-white/28 uppercase tracking-widest mb-3">
                  25-Year Net Savings
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-white/32 text-sm">$</span>
                  <AnimatedNumber
                    value={Math.max(0, Math.round(netSavings25yr))}
                    format={(n) => n.toLocaleString()}
                    className="text-3xl font-bold text-sky-400 tabular-nums"
                    stiffness={50}
                    damping={14}
                  />
                </div>
                <p className="text-[10px] text-white/20">
                  Profit after full investment recovery
                </p>
              </TiltCard>
            </RevealSection>

            <RevealSection delay={0.05}>
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] h-full">
                <p className="text-[9px] text-white/28 uppercase tracking-widest mb-3">
                  Investment
                </p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/32">System cost</span>
                    <span className="text-white/48">${grossCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/32">Fed. ITC (30%)</span>
                    <span className="text-sky-400/75">−${federalCredit.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-white/6 my-1" />
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-white/52">Net cost</span>
                    <span className="text-white">${netCost.toLocaleString()}</span>
                  </div>
                  <p className="text-[9px] text-white/18 mt-0.5">
                    ${result.investment.costPerWatt.toFixed(2)}/W installed
                  </p>
                </div>
              </div>
            </RevealSection>
          </div>

          {/* ── Environmental impact ─────────────────────────────────────── */}
          <RevealSection>
            <div className="p-5 rounded-2xl bg-white/[0.025] border border-white/[0.06]">
              <p className="text-[9px] text-white/28 uppercase tracking-widest mb-4">
                Environmental Impact
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "CO₂ / year",
                    value: Math.round(annualCo2Tons * 10),
                    format: (n: number) => `${(n / 10).toFixed(1)} t`,
                  },
                  {
                    label: "Lifetime CO₂",
                    value: Math.round(result.environmental.lifetimeCo2Tons * 10),
                    format: (n: number) => `${(n / 10).toFixed(1)} t`,
                  },
                  {
                    label: "Trees equiv.",
                    value: result.environmental.treesPerYear,
                    format: (n: number) => `${n}/yr`,
                  },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-[9px] text-white/22 mb-1.5">{stat.label}</p>
                    <AnimatedNumber
                      value={stat.value}
                      format={stat.format}
                      className="text-lg font-bold text-white tabular-nums"
                      stiffness={60}
                      damping={14}
                    />
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>

          {/* ── CTA ─────────────────────────────────────────────────────── */}
          <RevealSection>
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-4 rounded-full bg-white text-[#0b0b0b] font-semibold text-sm tracking-wide"
              >
                Schedule a Consultation
              </motion.button>
              <motion.button
                onClick={onReset}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-4 rounded-full border border-white/10 text-white/40 text-sm tracking-wide hover:border-white/22 hover:text-white/60 transition-all duration-200"
              >
                Start Over
              </motion.button>
            </div>
          </RevealSection>

          {/* ── Assumptions footnote ─────────────────────────────────────── */}
          <p className="text-[9px] text-white/12 text-center leading-relaxed pb-4">
            Estimates based on NREL irradiance data ·{" "}
            {result.assumptions.panelWattPeak}W panels ·{" "}
            {result.assumptions.systemEfficiencyPct}% system efficiency ·{" "}
            {result.assumptions.annualDegradationPct}% degradation/yr ·{" "}
            {result.assumptions.rateEscalationPct}% rate escalation/yr
          </p>
        </div>
      </div>

      {/* Live mode overlay — fixed, outside scroll */}
      <AnimatePresence>
        {isLive && (
          <LiveModePanel
            systemKw={result.systemSize}
            onClose={() => setIsLive(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
