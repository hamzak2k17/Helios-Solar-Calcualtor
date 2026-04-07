"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { computeSolarResult } from "@/lib/solarCalculations";
import { useCalcStore } from "@/store/calculatorStore";
import SolarScene from "./SolarScene";
import UIOverlay from "./UIOverlay";

// Simulate 0.5 simulated hours per real second → full day cycle ≈ 48s
const HOUR_INCREMENT = 0.5 / 10; // per 100 ms tick

function clampedSolarFactor(hour: number): number {
  return Math.max(0, Math.sin((Math.max(0, hour - 6) / 14) * Math.PI));
}

function computeSunPosition(hour: number, factor: number): [number, number, number] {
  const dayProgress = (hour - 6) / 14;
  const angle = (dayProgress - 0.5) * Math.PI;
  return [
    Math.sin(angle) * 13,
    Math.max(0.4, Math.cos(angle) * 12 * (factor > 0 ? 1 : 0.05)),
    -9,
  ];
}

export default function SolarExperience() {
  const [isNight, setIsNight] = useState(false);
  const [showFlow, setShowFlow] = useState(true);
  const [simHour, setSimHour] = useState(10);
  const [selectedPanel, setSelectedPanel] = useState<number | null>(null);

  // Auto-advance simulated time
  useEffect(() => {
    const id = setInterval(() => {
      setSimHour((h) => (h + HOUR_INCREMENT) % 24);
    }, 100);
    return () => clearInterval(id);
  }, []);

  const solarFactor = useMemo(() => clampedSolarFactor(simHour), [simHour]);
  const sunPosition = useMemo(
    () => computeSunPosition(simHour, solarFactor),
    [simHour, solarFactor]
  );

  // Pull data from the shared Zustand store (filled by the main calculator)
  const store = useCalcStore();
  const result = useMemo(() => {
    return computeSolarResult({
      monthlyBill: store.monthlyBill > 0 ? store.monthlyBill : 200,
      location: store.location || "California",
      roofSize: store.roofSize > 0 ? store.roofSize : 900,
      electricityRate: store.electricityRate > 0 ? store.electricityRate : 0.24,
      hasEV: store.hasEV,
      hasPool: store.hasPool,
      worksFromHome: store.worksFromHome,
      acUsage: store.acUsage || "medium",
    });
  }, [
    store.monthlyBill,
    store.location,
    store.roofSize,
    store.electricityRate,
    store.hasEV,
    store.hasPool,
    store.worksFromHome,
    store.acUsage,
  ]);

  const currentKw = isNight ? 0 : result.systemSize * solarFactor;

  const handlePanelSelect = useCallback((idx: number | null) => {
    setSelectedPanel((prev) => (prev === idx ? null : idx));
  }, []);

  return (
    <div className="fixed inset-0 bg-[#060812] overflow-hidden">
      {/* 3-D Canvas */}
      <Canvas
        camera={{ position: [10, 7, 11], fov: 45 }}
        shadows
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <SolarScene
          isNight={isNight}
          showFlow={showFlow}
          sunPosition={sunPosition}
          solarFactor={solarFactor}
          simHour={simHour}
          selectedPanel={selectedPanel}
          onPanelSelect={handlePanelSelect}
        />
      </Canvas>

      {/* HUD overlay — pointer-events disabled except on interactive children */}
      <div className="absolute inset-0 pointer-events-none">
        <UIOverlay
          isNight={isNight}
          showFlow={showFlow}
          simHour={simHour}
          solarFactor={solarFactor}
          currentKw={currentKw}
          result={result}
          selectedPanel={selectedPanel}
          onToggleNight={() => setIsNight((n) => !n)}
          onToggleFlow={() => setShowFlow((f) => !f)}
          onPanelDeselect={() => setSelectedPanel(null)}
        />
      </div>
    </div>
  );
}
