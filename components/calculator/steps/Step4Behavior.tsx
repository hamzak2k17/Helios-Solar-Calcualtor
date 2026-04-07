"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCalcStore } from "@/store/calculatorStore";
import type { AcUsage } from "@/lib/solarCalc";

const BEHAVIORS = [
  {
    key: "hasEV" as const,
    label: "Electric Vehicle",
    sub: "Charging at home nightly",
    kwhAdd: 300,
    icon: "🚗",
  },
  {
    key: "hasPool" as const,
    label: "Pool or Hot Tub",
    sub: "Running pump + heater",
    kwhAdd: 200,
    icon: "🏊",
  },
  {
    key: "worksFromHome" as const,
    label: "Work From Home",
    sub: "Full-time remote work",
    kwhAdd: 150,
    icon: "💻",
  },
] as const;

const AC_OPTIONS: { value: AcUsage; label: string; desc: string; icon: string }[] = [
  { value: "low", label: "Minimal", desc: "Rarely run AC or heat", icon: "🌿" },
  { value: "medium", label: "Moderate", desc: "Normal seasonal use", icon: "🌤" },
  { value: "high", label: "Heavy", desc: "Always on or extreme climate", icon: "🔥" },
];

export default function Step4Behavior() {
  const { hasEV, hasPool, worksFromHome, acUsage, setField } = useCalcStore();
  const boolValues = { hasEV, hasPool, worksFromHome };

  const totalExtra =
    (hasEV ? 300 : 0) + (hasPool ? 200 : 0) + (worksFromHome ? 150 : 0);

  return (
    <div className="flex flex-col gap-10">
      {/* Question */}
      <div>
        <p className="text-[11px] text-sky-400 uppercase tracking-[0.2em] font-semibold mb-4">
          Step 4 of 4
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-white leading-[1.08] tracking-tight">
          Tell us about
          <br />
          your energy
          <br />
          lifestyle
        </h2>
        <p className="text-white/38 mt-4 text-sm leading-relaxed max-w-sm">
          These details let us size your system more accurately.
        </p>
      </div>

      {/* Toggleable behaviors */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] text-white/30 uppercase tracking-[0.18em]">
          Do any of these apply?
        </p>
        <div className="flex flex-col gap-2.5">
          {BEHAVIORS.map((b) => {
            const isOn = boolValues[b.key];
            return (
              <motion.button
                key={b.key}
                onClick={() => setField(b.key, !isOn)}
                whileTap={{ scale: 0.985 }}
                className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-250 ${
                  isOn
                    ? "bg-sky-500/10 border-sky-500/28"
                    : "bg-white/[0.03] border-white/8 hover:border-white/15"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-xl w-7 text-center">{b.icon}</span>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isOn ? "text-sky-200" : "text-white/65"
                      }`}
                    >
                      {b.label}
                    </p>
                    <p className="text-xs text-white/32">{b.sub}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <motion.span
                    animate={{ opacity: isOn ? 1 : 0.3 }}
                    className="text-xs text-sky-400"
                  >
                    +{b.kwhAdd} kWh
                  </motion.span>

                  {/* Toggle pill */}
                  <div
                    className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
                      isOn ? "bg-sky-500" : "bg-white/10"
                    }`}
                  >
                    <motion.div
                      animate={{ x: isOn ? 21 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                    />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Extra usage indicator */}
        <AnimatePresence>
          {totalExtra > 0 && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-white/35 px-1"
            >
              Adding{" "}
              <strong className="text-white/55">+{totalExtra} kWh/mo</strong> to
              your baseline usage
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* AC intensity selector */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] text-white/30 uppercase tracking-[0.18em]">
          AC &amp; Heating intensity
        </p>
        <div className="grid grid-cols-3 gap-2">
          {AC_OPTIONS.map((opt) => {
            const isSelected = acUsage === opt.value;
            return (
              <motion.button
                key={opt.value}
                onClick={() => setField("acUsage", opt.value)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-2xl border text-center transition-all duration-200 ${
                  isSelected
                    ? "bg-sky-500/15 border-sky-500/35"
                    : "bg-white/[0.03] border-white/8 hover:border-white/15"
                }`}
              >
                <div className="text-xl mb-1.5">{opt.icon}</div>
                <p
                  className={`text-xs font-semibold ${
                    isSelected ? "text-sky-300" : "text-white/55"
                  }`}
                >
                  {opt.label}
                </p>
                <p className="text-[10px] text-white/25 mt-0.5 leading-tight">
                  {opt.desc}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Completion */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-sky-500/[0.07] border border-sky-500/[0.15]">
        <span className="text-sky-400 flex-shrink-0">✅</span>
        <div>
          <p className="text-sm text-sky-300 font-semibold mb-0.5">
            All set — check the live panel!
          </p>
          <p className="text-xs text-white/38 leading-relaxed">
            Your estimate is updating in real-time on the right. Hit{" "}
            <strong className="text-white/55">Calculate</strong> to see your full
            personalized results.
          </p>
        </div>
      </div>
    </div>
  );
}
