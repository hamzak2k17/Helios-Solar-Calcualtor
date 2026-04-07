"use client";

import { motion } from "framer-motion";
import PremiumSlider from "@/components/ui/PremiumSlider";
import { useCalcStore } from "@/store/calculatorStore";

const HINTS = [
  {
    max: 80,
    text: "You're a light energy user — a compact 4–6 panel system could cover most of your bill.",
  },
  {
    max: 150,
    text: "Most homes your size spend $80–$150/month. You're right in the average range for solar.",
  },
  {
    max: 250,
    text: "Your bill is above average — solar could eliminate the majority of this cost.",
  },
  {
    max: Infinity,
    text: "High usage! A larger solar array paired with Powerwall could offset most of your electricity cost.",
  },
];

function getHint(bill: number) {
  return HINTS.find((h) => bill <= h.max)!.text;
}

const QUICK_VALUES = [75, 125, 175, 250, 350];

export default function Step1Bill() {
  const { monthlyBill, electricityRate, setField } = useCalcStore();
  const estimatedKwh = Math.round(monthlyBill / Math.max(0.01, electricityRate));
  const hintKey = HINTS.findIndex((h) => monthlyBill <= h.max);

  return (
    <div className="flex flex-col gap-10">
      {/* Question */}
      <div>
        <p className="text-[11px] text-sky-400 uppercase tracking-[0.2em] font-semibold mb-4">
          Step 1 of 4
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-white leading-[1.08] tracking-tight">
          What&apos;s your
          <br />
          monthly electricity
          <br />
          bill?
        </h2>
      </div>

      {/* Big value display */}
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-light text-white/25">$</span>
        <input
          type="number"
          value={monthlyBill}
          onChange={(e) =>
            setField("monthlyBill", Math.max(50, Math.min(600, Number(e.target.value) || 50)))
          }
          className="text-6xl md:text-7xl font-bold text-white bg-transparent outline-none w-44 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="text-xl text-white/25 self-end mb-2">/mo</span>
      </div>

      {/* Slider */}
      <PremiumSlider
        value={monthlyBill}
        onChange={(v) => setField("monthlyBill", v)}
        min={50}
        max={600}
        step={5}
        formatValue={(v) => `$${v}`}
      />

      {/* Quick select */}
      <div className="flex flex-col gap-2.5">
        <p className="text-[10px] text-white/30 uppercase tracking-[0.18em]">Common bills</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_VALUES.map((v) => (
            <motion.button
              key={v}
              onClick={() => setField("monthlyBill", v)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                Math.abs(monthlyBill - v) <= 10
                  ? "bg-sky-500/20 border border-sky-500/40 text-sky-300"
                  : "bg-white/[0.04] border border-white/10 text-white/45 hover:border-white/20 hover:text-white/65"
              }`}
            >
              ${v}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Smart hints */}
      <div className="flex flex-col gap-3">
        <motion.div
          key={hintKey}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-start gap-3 p-4 rounded-2xl bg-sky-500/[0.07] border border-sky-500/[0.15]"
        >
          <span className="text-sky-400 text-base flex-shrink-0">💡</span>
          <p className="text-sm text-sky-400/80 leading-relaxed">{getHint(monthlyBill)}</p>
        </motion.div>

        <div className="flex items-center gap-2 text-xs text-white/30 px-1">
          <span>⚡</span>
          <span>
            Est. usage:{" "}
            <strong className="text-white/50">{estimatedKwh.toLocaleString()} kWh/mo</strong>
            {" · "}
            <strong className="text-white/50">{Math.round(estimatedKwh / 30)} kWh/day</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
