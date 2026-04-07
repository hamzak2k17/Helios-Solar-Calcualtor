"use client";

import { motion } from "framer-motion";
import PremiumSlider from "@/components/ui/PremiumSlider";
import { useCalcStore } from "@/store/calculatorStore";

const PRESETS = [
  { label: "Condo", value: 300, icon: "🏢", desc: "< 400 ft²" },
  { label: "Average", value: 900, icon: "🏠", desc: "800–1,000 ft²" },
  { label: "Large", value: 1800, icon: "🏡", desc: "1,500–2,000 ft²" },
];

const HINTS = [
  { max: 400, text: "Compact roof — a smaller, optimized system can still cover a significant portion of your bill." },
  { max: 900, text: "Standard roof size — ideal for a mid-range solar installation that covers most households." },
  { max: 1600, text: "Great roof space — enough for a full-coverage system with room for Powerwall storage." },
  { max: Infinity, text: "Large roof — you could run a full solar array and potentially become energy independent." },
];

function getHint(size: number) {
  return HINTS.find((h) => size <= h.max)!.text;
}

export default function Step3Roof() {
  const { roofSize, setField } = useCalcStore();
  const panels = Math.max(1, Math.floor(roofSize / 65));
  const systemKw = (panels * 0.4).toFixed(1);
  const hintKey = HINTS.findIndex((h) => roofSize <= h.max);

  const displaySize =
    roofSize >= 1000
      ? `${(roofSize / 1000).toFixed(1)}k`
      : roofSize.toString();

  return (
    <div className="flex flex-col gap-10">
      {/* Question */}
      <div>
        <p className="text-[11px] text-sky-400 uppercase tracking-[0.2em] font-semibold mb-4">
          Step 3 of 4
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-white leading-[1.08] tracking-tight">
          How much
          <br />
          roof space
          <br />
          do you have?
        </h2>
        <p className="text-white/38 mt-4 text-sm leading-relaxed max-w-sm">
          South-facing area available for solar panels. Don&apos;t worry about being exact.
        </p>
      </div>

      {/* Big value */}
      <div className="flex items-baseline gap-2">
        <motion.span
          key={displaySize}
          initial={{ opacity: 0.7, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-6xl md:text-7xl font-bold text-white tabular-nums"
        >
          {displaySize}
        </motion.span>
        <span className="text-2xl text-white/25">ft²</span>
      </div>

      {/* Slider */}
      <PremiumSlider
        value={roofSize}
        onChange={(v) => setField("roofSize", v)}
        min={100}
        max={3000}
        step={50}
        formatValue={(v) => `${v.toLocaleString()} ft²`}
      />

      {/* Size presets */}
      <div className="flex flex-col gap-2.5">
        <p className="text-[10px] text-white/30 uppercase tracking-[0.18em]">Common sizes</p>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p) => {
            const isNear = Math.abs(roofSize - p.value) <= 150;
            return (
              <motion.button
                key={p.label}
                onClick={() => setField("roofSize", p.value)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3.5 rounded-2xl border text-center transition-all duration-200 ${
                  isNear
                    ? "bg-sky-500/15 border-sky-500/35"
                    : "bg-white/[0.03] border-white/8 hover:border-white/15"
                }`}
              >
                <div className="text-xl mb-1.5">{p.icon}</div>
                <p
                  className={`text-xs font-semibold ${
                    isNear ? "text-sky-300" : "text-white/60"
                  }`}
                >
                  {p.label}
                </p>
                <p className="text-[10px] text-white/25 mt-0.5">{p.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Smart hint */}
      <motion.div
        key={hintKey}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start gap-3 p-4 rounded-2xl bg-sky-500/[0.07] border border-sky-500/[0.15]"
      >
        <span className="text-sky-400 flex-shrink-0">⚡</span>
        <div>
          <p className="text-xs text-sky-300 font-semibold mb-0.5">
            {panels} panels · {systemKw} kW system
          </p>
          <p className="text-xs text-sky-400/70 leading-relaxed">{getHint(roofSize)}</p>
        </div>
      </motion.div>
    </div>
  );
}
