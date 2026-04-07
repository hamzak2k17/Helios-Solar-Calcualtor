"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCalcStore } from "@/store/calculatorStore";

const REGIONS = [
  { name: "California", sun: 5.8, tag: "Excellent" },
  { name: "Texas", sun: 5.4, tag: "Great" },
  { name: "Florida", sun: 5.6, tag: "Great" },
  { name: "New York", sun: 4.5, tag: "Good" },
  { name: "Arizona", sun: 6.5, tag: "Exceptional" },
  { name: "Nevada", sun: 6.4, tag: "Exceptional" },
  { name: "Colorado", sun: 5.5, tag: "Great" },
  { name: "Georgia", sun: 5.2, tag: "Good" },
];

const TAG_COLORS: Record<string, string> = {
  Exceptional: "text-amber-400",
  Excellent: "text-sky-400",
  Great: "text-emerald-400",
  Good: "text-white/50",
};

export default function Step2Location() {
  const { location, setField } = useCalcStore();
  const matched = REGIONS.find((r) => r.name === location);

  return (
    <div className="flex flex-col gap-10">
      {/* Question */}
      <div>
        <p className="text-[11px] text-sky-400 uppercase tracking-[0.2em] font-semibold mb-4">
          Step 2 of 4
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-white leading-[1.08] tracking-tight">
          Where is
          <br />
          your home?
        </h2>
        <p className="text-white/38 mt-4 text-sm leading-relaxed max-w-sm">
          Solar output varies by location. We use local irradiance data to
          calculate your system&apos;s production.
        </p>
      </div>

      {/* Input */}
      <div className="relative flex items-center bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-4 focus-within:border-sky-500/40 transition-colors duration-200 group">
        <span className="text-white/30 mr-3 text-base flex-shrink-0">📍</span>
        <input
          type="text"
          value={location}
          onChange={(e) => setField("location", e.target.value)}
          className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-white/20"
          placeholder="City, state, or ZIP code"
        />
        <AnimatePresence>
          {location && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setField("location", "")}
              className="text-white/25 hover:text-white/55 transition-colors ml-2 text-sm"
            >
              ✕
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Region chips */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] text-white/30 uppercase tracking-[0.18em]">
          Popular states
        </p>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((r) => {
            const isSelected = location === r.name;
            return (
              <motion.button
                key={r.name}
                onClick={() => setField("location", r.name)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-sky-500/18 border border-sky-500/38 text-sky-200"
                    : "bg-white/[0.04] border border-white/10 text-white/45 hover:border-white/20 hover:text-white/65"
                }`}
              >
                {r.name}
                <span
                  className={`text-[9px] ${
                    isSelected ? "text-sky-400/70" : (TAG_COLORS[r.tag] ?? "text-white/25") + "/50"
                  }`}
                >
                  {r.sun}h
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Sun data insight */}
      <AnimatePresence>
        {location && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-sky-500/[0.07] border border-sky-500/[0.15]">
              <span className="text-sky-400 text-base mt-0.5 flex-shrink-0">☀️</span>
              <div>
                {matched ? (
                  <>
                    <p className="text-sm font-semibold text-sky-300 mb-0.5">
                      {matched.sun} peak sun hours/day —{" "}
                      <span className={TAG_COLORS[matched.tag]}>{matched.tag}</span>
                    </p>
                    <p className="text-xs text-sky-400/65 leading-relaxed">
                      {matched.sun >= 6
                        ? "Outstanding solar potential. Your system will perform at maximum efficiency."
                        : matched.sun >= 5.5
                        ? "Excellent solar resource. Above-average annual production."
                        : "Good solar resource. Well-suited for a standard home solar installation."}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-sky-400/80">
                    We&apos;ll use local irradiance data for{" "}
                    <strong className="text-sky-300">{location}</strong> to calculate
                    your system output.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
