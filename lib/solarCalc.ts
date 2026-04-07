export type AcUsage = "low" | "medium" | "high";

export interface CalcInput {
  monthlyBill: number;
  location: string;
  roofSize: number;
  electricityRate: number;
  hasEV: boolean;
  hasPool: boolean;
  worksFromHome: boolean;
  acUsage: AcUsage;
}

export interface SolarEstimate {
  panels: number;
  systemKw: number;
  annualKwhGenerated: number;
  adjustedMonthlyKwh: number;
  monthlySavings: number;
  annualSavings: number;
  coveragePercent: number;
  systemCost: number;
  federalCredit: number;
  netCost: number;
  paybackYears: number;
  co2OffsetTons: number;
  sunHours: number;
}

const SUN_HOURS: Record<string, number> = {
  California: 5.8,
  Texas: 5.4,
  Florida: 5.6,
  "New York": 4.5,
  Arizona: 6.5,
  Nevada: 6.4,
  Colorado: 5.5,
  "North Carolina": 5.1,
  Georgia: 5.2,
  Washington: 4.2,
};

const AC_FACTOR: Record<AcUsage, number> = {
  low: 0.82,
  medium: 1.0,
  high: 1.35,
};

export function computeEstimates(input: CalcInput): SolarEstimate {
  const sunHours = SUN_HOURS[input.location] ?? 5.2;
  const efficiencyFactor = 0.85;

  // System sizing
  const panels = Math.max(1, Math.floor(input.roofSize / 65));
  const systemKw = Math.round(panels * 0.4 * 10) / 10;

  // Generation
  const annualKwhGenerated = Math.round(systemKw * sunHours * 365 * efficiencyFactor);

  // Adjusted usage
  const baseMonthlyKwh = Math.round(input.monthlyBill / Math.max(0.01, input.electricityRate));
  const adjustedMonthlyKwh = Math.round(
    baseMonthlyKwh * AC_FACTOR[input.acUsage] +
      (input.hasEV ? 300 : 0) +
      (input.hasPool ? 200 : 0) +
      (input.worksFromHome ? 150 : 0)
  );

  // Coverage
  const monthlyGenerated = annualKwhGenerated / 12;
  const coveragePercent = Math.min(
    100,
    Math.round((monthlyGenerated / Math.max(1, adjustedMonthlyKwh)) * 100)
  );

  // Savings
  const effectiveBill = adjustedMonthlyKwh * input.electricityRate;
  const monthlySavings = Math.round(effectiveBill * (coveragePercent / 100));
  const annualSavings = monthlySavings * 12;

  // Cost
  const systemCost = Math.round(systemKw * 3200);
  const federalCredit = Math.round(systemCost * 0.3);
  const netCost = systemCost - federalCredit;
  const paybackYears =
    annualSavings > 0 ? Math.round((netCost / annualSavings) * 10) / 10 : 0;

  // CO₂ (US avg: 0.386 kg/kWh → convert to metric tons)
  const co2OffsetTons = Math.round((annualKwhGenerated * 0.386) / 1000 * 10) / 10;

  return {
    panels,
    systemKw,
    annualKwhGenerated,
    adjustedMonthlyKwh,
    monthlySavings,
    annualSavings,
    coveragePercent,
    systemCost,
    federalCredit,
    netCost,
    paybackYears,
    co2OffsetTons,
    sunHours,
  };
}
