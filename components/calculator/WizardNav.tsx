"use client";

import { motion } from "framer-motion";
import { useCalcStore, TOTAL_STEPS } from "@/store/calculatorStore";

interface WizardNavProps {
  onComplete: () => void;
}

export default function WizardNav({ onComplete }: WizardNavProps) {
  const { currentStep, goNext, goPrev } = useCalcStore();
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOTAL_STEPS - 1;

  return (
    <div className="flex-shrink-0 border-t border-white/[0.05] px-6 md:px-10 py-4 bg-[#0b0b0b]/80 backdrop-blur-sm">
      <div className="flex items-center justify-between max-w-lg mx-auto lg:max-w-none">
        {/* Back */}
        <motion.button
          onClick={goPrev}
          disabled={isFirst}
          whileHover={!isFirst ? { x: -3 } : {}}
          whileTap={!isFirst ? { scale: 0.95 } : {}}
          className="w-20 flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 disabled:opacity-0 disabled:pointer-events-none transition-colors duration-200"
        >
          <span>←</span> Back
        </motion.button>

        {/* Step dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === currentStep ? 28 : 6,
                backgroundColor:
                  i < currentStep
                    ? "rgba(56,189,248,0.7)"
                    : i === currentStep
                    ? "rgba(255,255,255,0.85)"
                    : "rgba(255,255,255,0.12)",
              }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>

        {/* Next / Calculate */}
        <div className="w-20 flex justify-end">
          <motion.button
            onClick={isLast ? onComplete : goNext}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 ${
              isLast
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_4px_20px_rgba(56,189,248,0.35)]"
                : "bg-white text-[#0b0b0b] shadow-[0_2px_12px_rgba(255,255,255,0.06)]"
            }`}
          >
            {isLast ? (
              <>Calculate <span className="text-base">✦</span></>
            ) : (
              <>Continue <span>→</span></>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
