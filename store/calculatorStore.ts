import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AcUsage } from "@/lib/solarCalc";

export interface CalcData {
  monthlyBill: number;
  location: string;
  roofSize: number;
  electricityRate: number;
  hasEV: boolean;
  hasPool: boolean;
  worksFromHome: boolean;
  acUsage: AcUsage;
}

export interface CalcStore extends CalcData {
  currentStep: number;
  direction: number;
  setField: <K extends keyof CalcData>(key: K, value: CalcData[K]) => void;
  goNext: () => void;
  goPrev: () => void;
  reset: () => void;
}

export const TOTAL_STEPS = 4;

const DEFAULTS: CalcData = {
  monthlyBill: 150,
  location: "",
  roofSize: 800,
  electricityRate: 0.14,
  hasEV: false,
  hasPool: false,
  worksFromHome: false,
  acUsage: "medium",
};

export const useCalcStore = create<CalcStore>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      currentStep: 0,
      direction: 1,

      setField: (key, value) =>
        set((state) => ({ ...state, [key]: value })),

      goNext: () => {
        const { currentStep } = get();
        if (currentStep < TOTAL_STEPS - 1) {
          set({ currentStep: currentStep + 1, direction: 1 });
        }
      },

      goPrev: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1, direction: -1 });
        }
      },

      reset: () =>
        set({ ...DEFAULTS, currentStep: 0, direction: 1 }),
    }),
    {
      name: "helios-solar-v2",
      // Persist input values only — navigation state always starts fresh
      partialize: (state) => ({
        monthlyBill: state.monthlyBill,
        location: state.location,
        roofSize: state.roofSize,
        electricityRate: state.electricityRate,
        hasEV: state.hasEV,
        hasPool: state.hasPool,
        worksFromHome: state.worksFromHome,
        acUsage: state.acUsage,
      }),
    }
  )
);
