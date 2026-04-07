"use client";

import { motion } from "framer-motion";
import { useCallback } from "react";

interface PremiumSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  formatValue?: (value: number) => string;
  label?: string;
  description?: string;
}

export default function PremiumSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue = (v) => String(v),
  label,
  description,
}: PremiumSliderProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium text-white/80">{label}</p>
            {description && (
              <p className="text-xs text-white/35">{description}</p>
            )}
          </div>

          {/* Animated value badge */}
          <motion.div
            key={value}
            initial={{ opacity: 0.6, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.12 }}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.07] border border-white/10 text-white font-semibold text-sm min-w-[90px] text-right tabular-nums"
          >
            {formatValue(value)}
          </motion.div>
        </div>
      )}

      {/* Track + thumb */}
      <div className="relative flex items-center h-6">
        {/* Track background */}
        <div className="absolute left-0 right-0 h-[3px] rounded-full bg-white/10 overflow-hidden">
          {/* Filled portion */}
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-400"
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.08, ease: "linear" }}
          />
        </div>
        {/* Glow on fill */}
        <div
          className="absolute top-1/2 left-0 h-[3px] -translate-y-1/2 rounded-full blur-[3px] bg-gradient-to-r from-sky-500/60 to-blue-400/60 pointer-events-none"
          style={{ width: `${percentage}%` }}
        />

        {/* Native input — sits on top, fully transparent, handles all events */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="slider-premium relative z-10 w-full h-6"
        />
      </div>

      {/* Min / Max labels */}
      <div className="flex justify-between text-[11px] text-white/22 tabular-nums">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}
