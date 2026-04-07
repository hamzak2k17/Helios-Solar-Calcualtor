"use client";

import { motion } from "framer-motion";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import type { SolarResult } from "@/lib/solarCalculations";

interface LivePreviewPanelProps {
  result: SolarResult;
}

export default function LivePreviewPanel({ result }: LivePreviewPanelProps) {
  const { system, financials, investment, environmental, production, location } = result;

  const {
    systemKw, panels, coveragePercent, isRoofConstrained,
  } = system;

  const { monthlySavings, annualSavings, paybackYears, netSavings25yr } = financials;
  const { grossCost, federalCredit, netCost } = investment;
  const { annualCo2Tons } = environmental;
  const sunHours = location.peakSunHours;

  return (
    <div className="flex flex-col h-full overflow-y-auto p-5 gap-3.5">
      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-0.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
        </span>
        <p className="text-[10px] text-sky-400 uppercase tracking-[0.2em] font-semibold">
          Live Estimate
        </p>
      </div>

      {/* Hero metric — System Size */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-500/10 to-blue-600/5 border border-sky-500/15">
        <p className="text-[10px] text-white/35 uppercase tracking-widest mb-3">System Size</p>
        <div className="flex items-baseline gap-2">
          <AnimatedNumber
            value={Math.round(systemKw * 10)}
            format={(n) => (n / 10).toFixed(1)}
            className="text-5xl font-bold text-white tabular-nums"
            stiffness={55}
            damping={14}
          />
          <span className="text-xl text-white/40 mb-1">kW</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <p className="text-xs text-white/30">
            <AnimatedNumber value={panels} className="text-white/50 font-medium" stiffness={60} damping={15} />
            {" panels"}
          </p>
          {isRoofConstrained && (
            <span className="text-[9px] text-amber-400/70 bg-amber-400/8 border border-amber-400/15 px-1.5 py-0.5 rounded-full">
              Roof-limited
            </span>
          )}
        </div>
      </div>

      {/* Monthly + Annual savings */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
          <p className="text-[9px] text-white/35 uppercase tracking-widest mb-2">Monthly</p>
          <div className="flex items-baseline gap-0.5">
            <span className="text-white/40 text-sm">$</span>
            <AnimatedNumber value={monthlySavings} className="text-2xl font-bold text-white tabular-nums" stiffness={70} damping={16} />
          </div>
          <p className="text-[10px] text-white/22 mt-0.5">saved/month</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
          <p className="text-[9px] text-white/35 uppercase tracking-widest mb-2">Annual</p>
          <div className="flex items-baseline gap-0.5">
            <span className="text-white/40 text-sm">$</span>
            <AnimatedNumber value={annualSavings} className="text-2xl font-bold text-white tabular-nums" stiffness={70} damping={16} />
          </div>
          <p className="text-[10px] text-white/22 mt-0.5">saved/year</p>
        </div>
      </div>

      {/* Coverage bar */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-white/35 uppercase tracking-widest">Bill Coverage</p>
          <div className="flex items-baseline gap-0.5">
            <AnimatedNumber
              value={coveragePercent}
              className="text-sm font-bold text-sky-400 tabular-nums"
              stiffness={60}
              damping={14}
            />
            <span className="text-sky-500/60 text-xs">%</span>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-400"
            animate={{ width: `${coveragePercent}%` }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[9px] text-white/18">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Secondary metrics: payback + CO₂ */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
          <p className="text-[9px] text-white/35 uppercase tracking-widest mb-2">Payback</p>
          <div className="flex items-baseline gap-1">
            <AnimatedNumber
              value={paybackYears}
              className="text-xl font-bold text-white tabular-nums"
              stiffness={55}
              damping={14}
            />
            <span className="text-white/35 text-xs">yrs</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
          <p className="text-[9px] text-white/35 uppercase tracking-widest mb-2">CO₂ / yr</p>
          <div className="flex items-baseline gap-1">
            <AnimatedNumber
              value={Math.round(annualCo2Tons * 10)}
              format={(n) => (n / 10).toFixed(1)}
              className="text-xl font-bold text-white tabular-nums"
              stiffness={55}
              damping={14}
            />
            <span className="text-white/35 text-xs">t</span>
          </div>
        </div>
      </div>

      {/* 25-year projection */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
        <p className="text-[10px] text-white/35 uppercase tracking-widest mb-2.5">
          25-Year Net Savings
        </p>
        <div className="flex items-baseline gap-0.5 mb-1">
          <span className="text-white/40 text-base">$</span>
          <AnimatedNumber
            value={Math.max(0, netSavings25yr)}
            format={(n) => n.toLocaleString()}
            className="text-2xl font-bold text-sky-400 tabular-nums"
            stiffness={50}
            damping={14}
          />
        </div>
        <p className="text-[10px] text-white/22">
          After investment · {location.peakSunHours}h sun/day
        </p>
      </div>

      {/* Cost breakdown */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
        <p className="text-[10px] text-white/35 uppercase tracking-widest mb-3">Investment</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-white/40">System cost</span>
            <AnimatedNumber
              value={grossCost}
              format={(n) => `$${n.toLocaleString()}`}
              className="text-white/55 tabular-nums"
              stiffness={65}
              damping={15}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/40">Fed. ITC (30%)</span>
            <div className="flex items-center gap-0.5">
              <span className="text-sky-400">−</span>
              <AnimatedNumber
                value={federalCredit}
                format={(n) => `$${n.toLocaleString()}`}
                className="text-sky-400 tabular-nums"
                stiffness={65}
                damping={15}
              />
            </div>
          </div>
          <div className="h-px bg-white/8 my-0.5" />
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-white/60">Net cost</span>
            <AnimatedNumber
              value={netCost}
              format={(n) => `$${n.toLocaleString()}`}
              className="text-white tabular-nums"
              stiffness={65}
              damping={15}
            />
          </div>
        </div>
      </div>

      {/* Assumptions footnote */}
      <div className="px-1 pb-2">
        <p className="text-[9px] text-white/15 leading-relaxed">
          {result.assumptions.panelWattPeak}W panels · {result.assumptions.systemEfficiencyPct}% system efficiency ·{" "}
          {result.assumptions.annualDegradationPct}% annual degradation · {result.assumptions.rateEscalationPct}% rate escalation/yr
        </p>
      </div>
    </div>
  );
}
