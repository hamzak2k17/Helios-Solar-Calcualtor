"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCalcStore, TOTAL_STEPS } from "@/store/calculatorStore";
import { computeSolarResult } from "@/lib/solarCalculations";
import LivePreviewPanel from "./LivePreviewPanel";
import WizardNav from "./WizardNav";
import ResultsView from "./ResultsView";
import Step1Bill from "./steps/Step1Bill";
import Step2Location from "./steps/Step2Location";
import Step3Roof from "./steps/Step3Roof";
import Step4Behavior from "./steps/Step4Behavior";

const STEP_LABELS = ["Energy Usage", "Location", "Roof Details", "Lifestyle"];

const SLIDE = {
  enter: (dir: number) => ({
    x: dir > 0 ? 64 : -64,
    opacity: 0,
    filter: "blur(6px)",
  }),
  center: { x: 0, opacity: 1, filter: "blur(0px)" },
  exit: (dir: number) => ({
    x: dir < 0 ? 64 : -64,
    opacity: 0,
    filter: "blur(6px)",
  }),
};

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

interface CalculatorWizardProps {
  onExit: () => void;
}

export default function CalculatorWizard({ onExit }: CalculatorWizardProps) {
  const [completed, setCompleted] = useState(false);
  const store = useCalcStore();
  const { currentStep, direction, reset } = store;

  const result = computeSolarResult({
    monthlyBill: store.monthlyBill,
    location: store.location,
    roofSize: store.roofSize,
    electricityRate: store.electricityRate,
    hasEV: store.hasEV,
    hasPool: store.hasPool,
    worksFromHome: store.worksFromHome,
    acUsage: store.acUsage,
  });

  const steps = [
    <Step1Bill key="1" />,
    <Step2Location key="2" />,
    <Step3Roof key="3" />,
    <Step4Behavior key="4" />,
  ];

  const handleReset = () => {
    reset();
    setCompleted(false);
  };

  return (
    <div className="fixed inset-0 bg-[#0b0b0b] flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 md:px-10 h-14 border-b border-white/[0.05] bg-[#0b0b0b]/90 backdrop-blur-sm">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-sky-400">☀</span>
          <span className="text-white/60 text-sm font-medium tracking-[0.15em] uppercase">
            Helios Solar
          </span>
        </div>

        {/* Step breadcrumb — hidden on mobile */}
        {!completed && (
          <div className="hidden md:flex items-center gap-1.5">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-1.5">
                {i > 0 && <div className="w-5 h-px bg-white/10" />}
                <span
                  className={`text-xs transition-colors duration-300 ${
                    i === currentStep
                      ? "text-white/65"
                      : i < currentStep
                      ? "text-sky-500/55"
                      : "text-white/18"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Close */}
        <motion.button
          onClick={onExit}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/30 hover:text-white/65 hover:border-white/22 transition-all duration-200 text-xs"
        >
          ✕
        </motion.button>
      </div>

      {/* Main area */}
      <AnimatePresence mode="wait">
        {completed ? (
          /* ── Results view ── */
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex-1 flex overflow-hidden"
          >
            <ResultsView
              result={result}
              onReset={handleReset}
              onExit={onExit}
            />
            {/* Preview panel on results too */}
            <div className="hidden lg:flex w-80 xl:w-96 flex-shrink-0 flex-col border-l border-white/[0.05] overflow-hidden">
              <LivePreviewPanel result={result} />
            </div>
          </motion.div>
        ) : (
          /* ── Step wizard ── */
          <motion.div
            key="wizard"
            initial={false}
            className="flex-1 flex overflow-hidden"
          >
            {/* Step content */}
            <div className="flex-1 overflow-y-auto">
              <div className="min-h-full flex flex-col justify-center max-w-lg mx-auto px-8 py-12">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={SLIDE}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.36, ease: EASE }}
                    className="w-full"
                  >
                    {steps[currentStep]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Live preview — desktop only */}
            <div className="hidden lg:flex w-80 xl:w-96 flex-shrink-0 flex-col border-l border-white/[0.05] overflow-hidden">
              <LivePreviewPanel result={result} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav — only during wizard steps */}
      {!completed && <WizardNav onComplete={() => setCompleted(true)} />}
    </div>
  );
}
