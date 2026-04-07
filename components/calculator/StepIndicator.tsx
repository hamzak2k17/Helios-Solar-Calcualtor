"use client";

import { motion } from "framer-motion";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: Step[];
}

export default function StepIndicator({
  currentStep,
  totalSteps,
  steps,
}: StepIndicatorProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="px-8 md:px-10 pt-8 pb-6 border-b border-white/[0.06]">
      {/* Animated progress line */}
      <div className="relative h-px bg-white/[0.08] mb-6 overflow-visible">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-400 to-blue-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        {/* Glowing tip */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
          animate={{ left: `calc(${progress}% - 4px)` }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>

      {/* Step dots */}
      <div className="flex items-start justify-between">
        {steps.map((step, index) => {
          const isDone = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 flex-1">
              <motion.div
                animate={{
                  backgroundColor: isDone
                    ? "rgba(56,189,248,1)"
                    : isActive
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.05)",
                  borderColor: isDone
                    ? "rgba(56,189,248,0.6)"
                    : isActive
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(255,255,255,0.08)",
                  scale: isActive ? 1.15 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="w-7 h-7 rounded-full border flex items-center justify-center text-[11px] font-bold"
                style={{
                  color: isDone ? "#000" : isActive ? "#fff" : "rgba(255,255,255,0.25)",
                }}
              >
                {isDone ? "✓" : step.id}
              </motion.div>

              <span
                className={`hidden md:block text-[10px] tracking-wide text-center leading-tight transition-colors duration-300 ${
                  isActive ? "text-white/60" : "text-white/20"
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current step label */}
      <div className="mt-5">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-[10px] text-sky-400 uppercase tracking-[0.18em] font-semibold mb-1">
            Step {currentStep + 1} of {totalSteps}
          </p>
          <h3 className="text-lg font-bold text-white leading-tight">
            {steps[currentStep].title}
          </h3>
          <p className="text-xs text-white/35 mt-0.5">
            {steps[currentStep].description}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
