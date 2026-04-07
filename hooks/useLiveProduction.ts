"use client";

import { useState, useEffect, useRef } from "react";

export interface LiveData {
  /** Current output in watts */
  watts: number;
  /** System peak capacity in watts */
  peak: number;
  /** 0–100 — percentage of peak currently producing */
  efficiency: number;
  /** Last 40 watt readings for the sparkline */
  history: number[];
  /** True outside 6 am – 8 pm */
  isNight: boolean;
  /** Formatted local time, e.g. "2:34 PM" */
  timeLabel: string;
}

/**
 * Simulates real-time solar production based on:
 * - A bell-curve irradiance model peaking at 1 pm
 * - Smooth random noise (±18 %) to mimic cloud cover
 * Updates every second.
 */
export function useLiveProduction(systemKw: number): LiveData {
  const noiseRef = useRef(0.92);
  const historyRef = useRef<number[]>([]);

  const [data, setData] = useState<LiveData>({
    watts: 0,
    peak: Math.round(systemKw * 1000),
    efficiency: 0,
    history: [],
    isNight: false,
    timeLabel: "",
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getHours() + now.getMinutes() / 60;

      // Solar irradiance: sin curve from 6 am (0) to 8 pm (0), peaking at 1 pm
      const solarFactor = Math.max(0, Math.sin((Math.max(0, h - 6) / 14) * Math.PI));

      // Smooth noise drift — random walk clamped to [0.72, 1.08]
      noiseRef.current = Math.max(
        0.72,
        Math.min(1.08, noiseRef.current + (Math.random() - 0.5) * 0.08)
      );

      const watts = Math.round(systemKw * 1000 * solarFactor * noiseRef.current);
      const efficiency = Math.round(solarFactor * noiseRef.current * 100);

      historyRef.current = [...historyRef.current.slice(-39), watts];

      setData({
        watts,
        peak: Math.round(systemKw * 1000),
        efficiency,
        history: [...historyRef.current],
        isNight: solarFactor === 0,
        timeLabel: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [systemKw]);

  return data;
}
