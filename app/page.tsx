"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeroSection from "@/components/hero/HeroSection";
import CalculatorWizard from "@/components/calculator/CalculatorWizard";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function Home() {
  const [mode, setMode] = useState<"hero" | "calc">("hero");

  return (
    <div className="relative bg-[#0b0b0b] min-h-screen overflow-hidden">
      {/* Persistent ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[700px] bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.065)_0%,transparent_65%)]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.04)_0%,transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {mode === "hero" ? (
          <motion.div
            key="hero"
            exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <HeroSection onStart={() => setMode("calc")} />
          </motion.div>
        ) : (
          <motion.div
            key="calc"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="fixed inset-0 z-50"
          >
            <CalculatorWizard onExit={() => setMode("hero")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
