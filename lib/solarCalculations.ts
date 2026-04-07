/**
 * ══════════════════════════════════════════════════════════════════
 *  lib/solarCalculations.ts
 *  Helios Solar Calculator — Core Calculation Engine
 *
 *  Architecture: pure functions, no side effects.
 *  Each stage is independently testable and replaceable.
 *
 *  Pipeline:
 *    CalcInput
 *      → calcEnergyUsage()   → EnergyUsageResult
 *      → calcSystemSize()    → SystemSizeResult
 *      → calcProduction()    → ProductionResult
 *      → calcInvestment()    → InvestmentResult
 *      → calcFinancials()    → FinancialsResult
 *      → calcEnvironmental() → EnvironmentalResult
 *      → computeSolarResult()→ SolarResult (composed output)
 * ══════════════════════════════════════════════════════════════════
 */

// ── TYPE DEFINITIONS ──────────────────────────────────────────────

export type AcUsage = "low" | "medium" | "high";

/** All user-provided inputs to the calculation engine. */
export interface CalcInput {
  /** Average monthly electricity bill in dollars */
  monthlyBill: number;
  /** Electricity rate in $/kWh */
  electricityRate: number;
  /** State name matching IRRADIANCE_DB keys (e.g. "California") */
  location: string;
  /** Usable south-facing roof area in square feet */
  roofSize: number;
  /**
   * Overall system performance ratio (0–1).
   * Accounts for inverter losses, wiring, temperature, soiling.
   * Default: 0.86 (86%).
   */
  systemEfficiency?: number;
  /** AC / heating usage level — scales baseline consumption */
  acUsage: AcUsage;
  /** Whether the household charges an EV at home */
  hasEV: boolean;
  /** Whether the household has a pool or hot tub */
  hasPool: boolean;
  /** Whether the resident works full-time from home */
  worksFromHome: boolean;
}

/** Derived energy consumption profile. */
export interface EnergyUsageResult {
  /** Raw kWh from bill ÷ rate (before behavior adjustments) */
  baseMonthlyKwh: number;
  /** kWh after AC multiplier + appliance add-ons */
  adjustedMonthlyKwh: number;
  annualKwh: number;
  dailyKwh: number;
  /** kWh added by EV, pool, WFH */
  applianceKwh: number;
}

/** Recommended solar system specification. */
export interface SystemSizeResult {
  panels: number;
  /** Total system output capacity in kW */
  systemKw: number;
  /** kW needed to fully cover adjusted demand */
  demandBasedKw: number;
  /** Max kW that fits on the available roof */
  roofConstrainedKw: number;
  /** True if roof limits system below full-coverage size */
  isRoofConstrained: boolean;
  /** % of adjusted annual demand the system covers */
  coveragePercent: number;
}

/** Solar energy production figures. */
export interface ProductionResult {
  /** Year-1 annual kWh (before degradation) */
  annualKwh: number;
  monthlyKwh: number;
  /** Lifetime kWh over PROJECTION_YEARS, accounting for degradation */
  lifetimeKwh: number;
  /** kWh produced each year, index 0 = year 1 */
  yearlyProduction: number[];
  annualDegradationPct: number;
}

/** System installation cost and incentives. */
export interface InvestmentResult {
  /** Pre-incentive installed cost ($) */
  grossCost: number;
  /** 30% Federal ITC ($) */
  federalCredit: number;
  federalCreditRate: number;
  /** Post-ITC out-of-pocket cost ($) */
  netCost: number;
  /** Effective installed $/W */
  costPerWatt: number;
  /** Estimated annual O&M cost ($) */
  annualMaintenance: number;
}

/** 25-year financial projection. */
export interface FinancialsResult {
  /** Year-1 monthly savings ($) */
  monthlySavings: number;
  /** Year-1 gross annual savings ($) */
  annualSavings: number;
  /**
   * Net savings over PROJECTION_YEARS after:
   * - initial net investment
   * - panel degradation
   * - electricity rate escalation
   * - annual O&M costs
   */
  netSavings25yr: number;
  /** Year the cumulative cash flow turns positive */
  paybackYears: number;
  /** Net savings per year (index 0 = year 1), after O&M */
  yearlySavings: number[];
  /** Cumulative cash flow per year including initial outlay */
  cumulativeCashFlow: number[];
  /** Annual electricity rate escalation used (fraction) */
  rateEscalationPct: number;
}

/** Environmental impact summary. */
export interface EnvironmentalResult {
  /** Metric tons of CO₂ offset in year 1 */
  annualCo2Tons: number;
  /** Total metric tons offset over 25 years */
  lifetimeCo2Tons: number;
  /** Number of trees equivalent (annual) */
  treesPerYear: number;
  /** Number of cars removed from roads equivalent (annual) */
  carsEquivalent: number;
}

/** Irradiance data resolved for the user's location. */
export interface LocationResult {
  name: string;
  peakSunHours: number;
  /** Average local utility rate — may differ from user's entered rate */
  avgUtilityRate: number;
  isDefaultFallback: boolean;
}

/** All physical and financial assumptions used in this run. */
export interface AssumptionsResult {
  panelWattPeak: number;
  panelEfficiencyPct: number;
  systemEfficiencyPct: number;
  annualDegradationPct: number;
  performanceRatio: number;
  rateEscalationPct: number;
  federalItcRate: number;
  projectionYears: number;
  co2KgPerKwh: number;
}

/**
 * Full structured result returned by computeSolarResult().
 * Top-level fields match the required output specification.
 */
export interface SolarResult {
  // ── Required output (specification) ──────────────────────
  /** Recommended system capacity in kW */
  systemSize: number;
  /** Year-1 annual kWh generated */
  annualProduction: number;
  /** Gross installed system cost before incentives ($) */
  cost: number;
  /** 25-year net savings after initial investment ($) */
  savings: number;
  /** Simple payback period in years */
  roi: number;
  /** Year-1 monthly electricity savings ($) */
  monthlySavings: number;

  // ── Detailed breakdown ────────────────────────────────────
  system: SystemSizeResult;
  usage: EnergyUsageResult;
  production: ProductionResult;
  investment: InvestmentResult;
  financials: FinancialsResult;
  environmental: EnvironmentalResult;
  location: LocationResult;
  assumptions: AssumptionsResult;
}

// ── CONSTANTS & ASSUMPTIONS ───────────────────────────────────────
//  Change these values to update every downstream calculation.

/** Output of one modern monocrystalline panel (W) */
const PANEL_WATT_PEAK = 400;

/** Default panel conversion efficiency (20%) */
const DEFAULT_PANEL_EFFICIENCY_PCT = 20;

/**
 * Footprint of one 400 W panel including mounting gap.
 * Approx 3.25 ft × 5.5 ft = ~17.9 ft²
 */
const PANEL_AREA_SQ_FT = 18;

/** Minimum allowed panels */
const MIN_PANELS = 2;

/**
 * Annual performance loss due to cell aging.
 * Industry standard for Tier-1 monocrystalline panels.
 */
const ANNUAL_DEGRADATION_RATE = 0.005; // 0.5 %/yr

/**
 * Electricity rate annual inflation — EIA 10-year historical avg.
 * Used to escalate utility bills in the 25-yr financial model.
 */
const ANNUAL_RATE_ESCALATION = 0.028; // 2.8 %/yr

/** Default system losses (inverter, wiring, temp, soiling, mismatch) */
const DEFAULT_SYSTEM_EFFICIENCY = 0.86;

/** Federal Investment Tax Credit (ITC) — current US rate */
const FEDERAL_ITC_RATE = 0.30;

/** Annual operations & maintenance (inverter wear, cleaning, monitoring) */
const MAINTENANCE_COST_PER_YEAR = 150;

/** Number of years in financial projection */
const PROJECTION_YEARS = 25;

/** US average grid emission factor — EPA eGRID 2023 */
const CO2_KG_PER_KWH = 0.386;

/** Trees needed to sequester 1 metric ton of CO₂/yr */
const TREES_PER_TON_CO2 = 45;

/** Average US passenger car annual CO₂ emissions (EPA) */
const CARS_CO2_TONS_PER_YEAR = 4.6;

/**
 * Installed cost per watt — tiered by system size.
 * Larger systems benefit from economies of scale.
 * Source: NREL Q1 2024 Solar Industry Update
 */
const COST_TIERS: { maxKw: number; dollarsPerWatt: number }[] = [
  { maxKw: 4,        dollarsPerWatt: 3.60 },
  { maxKw: 7,        dollarsPerWatt: 3.30 },
  { maxKw: 10,       dollarsPerWatt: 3.10 },
  { maxKw: 15,       dollarsPerWatt: 2.90 },
  { maxKw: Infinity, dollarsPerWatt: 2.70 },
];

/** AC/heating usage multiplier on baseline consumption */
const AC_MULTIPLIERS: Record<AcUsage, number> = {
  low:    0.82,
  medium: 1.00,
  high:   1.35,
};

/** Additional monthly kWh per appliance type */
const APPLIANCE_KWH: Record<string, number> = {
  ev:           333, // 12 000 mi/yr ÷ 3 mi/kWh = 4 000 kWh/yr ÷ 12
  pool:         200, // pool pump + heater
  workFromHome: 150, // HVAC + devices
};

// ── IRRADIANCE DATABASE ────────────────────────────────────────────
//  Peak sun hours: daily average kWh/m² for a south-facing, fixed tilt panel.
//  Source: NREL NSRDB 1998–2021 averages.
//  avgRate: average residential electricity rate — EIA 2023 state profiles.

interface IrradianceRecord {
  peakSunHours: number;
  avgRate: number; // $/kWh
}

const IRRADIANCE_DB: Record<string, IrradianceRecord> = {
  // Western US — high irradiance
  Arizona:          { peakSunHours: 6.57, avgRate: 0.130 },
  Nevada:           { peakSunHours: 6.41, avgRate: 0.115 },
  "New Mexico":     { peakSunHours: 6.77, avgRate: 0.127 },
  California:       { peakSunHours: 5.82, avgRate: 0.240 },
  Utah:             { peakSunHours: 5.78, avgRate: 0.113 },
  Colorado:         { peakSunHours: 5.50, avgRate: 0.134 },
  Hawaii:           { peakSunHours: 5.59, avgRate: 0.386 },

  // Southern US — good irradiance
  Texas:            { peakSunHours: 5.43, avgRate: 0.122 },
  Florida:          { peakSunHours: 5.62, avgRate: 0.130 },
  Georgia:          { peakSunHours: 5.20, avgRate: 0.122 },
  "North Carolina": { peakSunHours: 5.08, avgRate: 0.121 },
  "South Carolina": { peakSunHours: 5.00, avgRate: 0.131 },
  Louisiana:        { peakSunHours: 5.10, avgRate: 0.109 },
  Alabama:          { peakSunHours: 5.00, avgRate: 0.133 },
  Mississippi:      { peakSunHours: 5.05, avgRate: 0.114 },

  // Midwest — moderate irradiance
  Illinois:         { peakSunHours: 4.50, avgRate: 0.131 },
  Ohio:             { peakSunHours: 4.18, avgRate: 0.133 },
  Michigan:         { peakSunHours: 4.02, avgRate: 0.173 },
  Minnesota:        { peakSunHours: 4.53, avgRate: 0.141 },
  Wisconsin:        { peakSunHours: 4.28, avgRate: 0.163 },
  Indiana:          { peakSunHours: 4.35, avgRate: 0.139 },
  Missouri:         { peakSunHours: 4.73, avgRate: 0.118 },
  Kansas:           { peakSunHours: 5.10, avgRate: 0.117 },

  // Northeast — lower irradiance, high rates → still viable
  "New York":       { peakSunHours: 4.47, avgRate: 0.213 },
  Massachusetts:    { peakSunHours: 4.28, avgRate: 0.240 },
  Connecticut:      { peakSunHours: 4.20, avgRate: 0.262 },
  "New Jersey":     { peakSunHours: 4.55, avgRate: 0.186 },
  Pennsylvania:     { peakSunHours: 4.37, avgRate: 0.157 },
  Maryland:         { peakSunHours: 4.72, avgRate: 0.152 },
  Virginia:         { peakSunHours: 4.80, avgRate: 0.134 },

  // Northwest — lower sun but cheap power
  Washington:       { peakSunHours: 4.17, avgRate: 0.110 },
  Oregon:           { peakSunHours: 4.41, avgRate: 0.112 },
  Idaho:            { peakSunHours: 5.24, avgRate: 0.102 },
  Montana:          { peakSunHours: 4.96, avgRate: 0.118 },
};

/** Fallback when location is not in the database */
const FALLBACK_IRRADIANCE: IrradianceRecord = {
  peakSunHours: 5.00,
  avgRate: 0.140,
};

// ── UTILITY HELPERS ───────────────────────────────────────────────

/** Round a number to N decimal places. */
const round = (value: number, decimals = 0): number =>
  Math.round(value * 10 ** decimals) / 10 ** decimals;

/** Clamp a value between min and max. */
const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** Resolve irradiance record for a location string. */
function resolveIrradiance(location: string): { record: IrradianceRecord; isFallback: boolean } {
  const record = IRRADIANCE_DB[location];
  return record
    ? { record, isFallback: false }
    : { record: FALLBACK_IRRADIANCE, isFallback: true };
}

/** Look up the cost tier for a given system size. */
function resolveCostTier(systemKw: number): number {
  return (
    COST_TIERS.find((t) => systemKw <= t.maxKw)?.dollarsPerWatt ??
    COST_TIERS[COST_TIERS.length - 1].dollarsPerWatt
  );
}

// ── STAGE 1: ENERGY USAGE ─────────────────────────────────────────

/**
 * Derive the household's true monthly kWh consumption from the
 * electricity bill, adjusting for AC usage intensity and
 * high-draw appliances (EV, pool, WFH).
 */
export function calcEnergyUsage(input: CalcInput): EnergyUsageResult {
  const { monthlyBill, electricityRate, acUsage, hasEV, hasPool, worksFromHome } = input;

  // Base usage from bill (inverse of rate)
  const baseMonthlyKwh = monthlyBill / Math.max(0.001, electricityRate);

  // Scale for HVAC intensity
  const adjustedBase = baseMonthlyKwh * AC_MULTIPLIERS[acUsage];

  // Add appliance loads
  const applianceKwh =
    (hasEV ? APPLIANCE_KWH.ev : 0) +
    (hasPool ? APPLIANCE_KWH.pool : 0) +
    (worksFromHome ? APPLIANCE_KWH.workFromHome : 0);

  const adjustedMonthlyKwh = round(adjustedBase + applianceKwh);
  const annualKwh = round(adjustedMonthlyKwh * 12);
  const dailyKwh = round(adjustedMonthlyKwh / 30.4, 1);

  return {
    baseMonthlyKwh: round(baseMonthlyKwh),
    adjustedMonthlyKwh,
    annualKwh,
    dailyKwh,
    applianceKwh,
  };
}

// ── STAGE 2: SYSTEM SIZING ────────────────────────────────────────

/**
 * Determine the optimal system size by taking the smaller of:
 *   (a) demand-based kW  — sized to 100 % cover adjusted annual usage
 *   (b) roof-constrained kW — max panels that physically fit
 *
 * Rounds to the nearest whole panel (0.4 kW increments).
 * Applies the user's system efficiency override if provided.
 */
export function calcSystemSize(
  input: CalcInput,
  usage: EnergyUsageResult,
  irradiance: IrradianceRecord
): SystemSizeResult {
  const efficiency = clamp(input.systemEfficiency ?? DEFAULT_SYSTEM_EFFICIENCY, 0.5, 1.0);
  const { peakSunHours } = irradiance;

  // (a) Demand-based: kW to produce annual_usage kWh at this location
  const demandBasedKw = usage.annualKwh / (peakSunHours * 365 * efficiency);

  // (b) Roof-based: panels × panel-kW, limited by physical space
  const maxPanels = Math.floor(input.roofSize / PANEL_AREA_SQ_FT);
  const roofConstrainedKw = (maxPanels * PANEL_WATT_PEAK) / 1000;

  // Take the minimum (we don't over-provision beyond demand)
  const rawSystemKw = Math.min(demandBasedKw, roofConstrainedKw);

  // Snap to whole panel increments
  const panelKw = PANEL_WATT_PEAK / 1000; // 0.4 kW/panel
  const panels = clamp(Math.round(rawSystemKw / panelKw), MIN_PANELS, maxPanels || MIN_PANELS);
  const systemKw = round(panels * panelKw, 1);

  // Coverage: how much of annual demand does this system cover?
  const annualGeneration = systemKw * peakSunHours * 365 * efficiency;
  const coveragePercent = clamp(
    round((annualGeneration / Math.max(1, usage.annualKwh)) * 100),
    0,
    100
  );

  return {
    panels,
    systemKw,
    demandBasedKw: round(demandBasedKw, 2),
    roofConstrainedKw: round(roofConstrainedKw, 2),
    isRoofConstrained: roofConstrainedKw < demandBasedKw,
    coveragePercent,
  };
}

// ── STAGE 3: ENERGY PRODUCTION ────────────────────────────────────

/**
 * Model year-by-year solar energy generation over PROJECTION_YEARS.
 * Applies compound annual degradation (0.5 %/yr) starting year 2.
 */
export function calcProduction(
  system: SystemSizeResult,
  irradiance: IrradianceRecord,
  efficiency: number = DEFAULT_SYSTEM_EFFICIENCY
): ProductionResult {
  const { systemKw } = system;
  const { peakSunHours } = irradiance;

  // Year-1 gross production
  const annualKwh = round(systemKw * peakSunHours * 365 * efficiency);
  const monthlyKwh = round(annualKwh / 12);

  // Build degradation curve: year[i] = year1 × (1 − rate)^i
  const yearlyProduction: number[] = Array.from({ length: PROJECTION_YEARS }, (_, i) =>
    round(annualKwh * (1 - ANNUAL_DEGRADATION_RATE) ** i)
  );

  const lifetimeKwh = round(yearlyProduction.reduce((acc, y) => acc + y, 0));

  return {
    annualKwh,
    monthlyKwh,
    lifetimeKwh,
    yearlyProduction,
    annualDegradationPct: ANNUAL_DEGRADATION_RATE * 100,
  };
}

// ── STAGE 4: INVESTMENT COST ──────────────────────────────────────

/**
 * Calculate installed system cost using tiered $/W pricing,
 * then apply the 30% Federal Investment Tax Credit (ITC).
 */
export function calcInvestment(system: SystemSizeResult): InvestmentResult {
  const dollarsPerWatt = resolveCostTier(system.systemKw);
  const grossCost = round(system.systemKw * 1000 * dollarsPerWatt);
  const federalCredit = round(grossCost * FEDERAL_ITC_RATE);
  const netCost = grossCost - federalCredit;

  return {
    grossCost,
    federalCredit,
    federalCreditRate: FEDERAL_ITC_RATE,
    netCost,
    costPerWatt: dollarsPerWatt,
    annualMaintenance: MAINTENANCE_COST_PER_YEAR,
  };
}

// ── STAGE 5: FINANCIAL RETURNS ────────────────────────────────────

/**
 * Project net cash flows over 25 years, accounting for:
 *   • Year-by-year panel degradation (production declines)
 *   • Electricity rate escalation (utility bills increase 2.8 %/yr)
 *   • Annual O&M costs ($150/yr)
 *   • Initial net investment (negative at year 0)
 *
 * Conservatively caps offset at 100 % of usage (no net-metering export).
 */
export function calcFinancials(
  production: ProductionResult,
  investment: InvestmentResult,
  input: CalcInput,
  usage: EnergyUsageResult
): FinancialsResult {
  const { electricityRate } = input;
  const { netCost, annualMaintenance } = investment;

  const yearlySavings: number[] = [];
  const cumulativeCashFlow: number[] = [];
  let cumulative = -netCost; // start with negative investment
  let paybackYear = 0;

  for (let i = 0; i < PROJECTION_YEARS; i++) {
    // Rate escalates each year
    const escalatedRate = electricityRate * (1 + ANNUAL_RATE_ESCALATION) ** i;

    // Production this year (already degraded in production array)
    const productionKwh = production.yearlyProduction[i];

    // We offset up to 100% of annual usage
    const offsetKwh = Math.min(productionKwh, usage.annualKwh);
    const grossSavings = round(offsetKwh * escalatedRate);
    const netYearlySavings = grossSavings - annualMaintenance;

    yearlySavings.push(netYearlySavings);
    cumulative += netYearlySavings;
    cumulativeCashFlow.push(round(cumulative));

    // First year cumulative goes positive = payback achieved
    if (paybackYear === 0 && cumulative >= 0) {
      paybackYear = i + 1;
    }
  }

  // Year-1 figures (unescalated, for display)
  const year1OffsetKwh = Math.min(production.annualKwh, usage.annualKwh);
  const annualSavings = round(year1OffsetKwh * electricityRate);
  const monthlySavings = round(annualSavings / 12);

  // 25-year net after total O&M (does NOT subtract the initial investment —
  // that's already embedded in cumulativeCashFlow)
  const grossSavings25yr = yearlySavings.reduce((acc, y) => acc + y + annualMaintenance, 0);
  const netSavings25yr = round(grossSavings25yr - netCost);

  return {
    monthlySavings,
    annualSavings,
    netSavings25yr,
    paybackYears: paybackYear > 0 ? paybackYear : PROJECTION_YEARS,
    yearlySavings,
    cumulativeCashFlow,
    rateEscalationPct: ANNUAL_RATE_ESCALATION * 100,
  };
}

// ── STAGE 6: ENVIRONMENTAL IMPACT ────────────────────────────────

/**
 * Quantify the CO₂ avoided by substituting solar for grid power.
 * Uses EPA eGRID 2023 national average emission factor.
 */
export function calcEnvironmental(production: ProductionResult): EnvironmentalResult {
  const { annualKwh, lifetimeKwh } = production;

  const annualCo2Tons = round((annualKwh * CO2_KG_PER_KWH) / 1000, 1);
  const lifetimeCo2Tons = round((lifetimeKwh * CO2_KG_PER_KWH) / 1000, 1);
  const treesPerYear = Math.round(annualCo2Tons * TREES_PER_TON_CO2);
  const carsEquivalent = round(annualCo2Tons / CARS_CO2_TONS_PER_YEAR, 1);

  return {
    annualCo2Tons,
    lifetimeCo2Tons,
    treesPerYear,
    carsEquivalent,
  };
}

// ── MASTER FUNCTION ───────────────────────────────────────────────

/**
 * Compose all six calculation stages into a single structured result.
 *
 * @example
 * const result = computeSolarResult({
 *   monthlyBill: 180,
 *   electricityRate: 0.24,
 *   location: "California",
 *   roofSize: 900,
 *   acUsage: "medium",
 *   hasEV: true,
 *   hasPool: false,
 *   worksFromHome: false,
 * });
 * console.log(result.systemSize);     // e.g. 8.4
 * console.log(result.monthlySavings); // e.g. 180
 * console.log(result.savings);        // e.g. 52000
 */
export function computeSolarResult(input: CalcInput): SolarResult {
  const efficiency = clamp(
    input.systemEfficiency ?? DEFAULT_SYSTEM_EFFICIENCY,
    0.5,
    1.0
  );

  // Resolve location irradiance
  const { record: irradianceRecord, isFallback } = resolveIrradiance(input.location);

  // Run each stage
  const usage        = calcEnergyUsage(input);
  const system       = calcSystemSize(input, usage, irradianceRecord);
  const production   = calcProduction(system, irradianceRecord, efficiency);
  const investment   = calcInvestment(system);
  const financials   = calcFinancials(production, investment, input, usage);
  const environmental = calcEnvironmental(production);

  // Compose structured output
  const location: LocationResult = {
    name:             input.location || "Unknown",
    peakSunHours:     irradianceRecord.peakSunHours,
    avgUtilityRate:   irradianceRecord.avgRate,
    isDefaultFallback: isFallback,
  };

  const assumptions: AssumptionsResult = {
    panelWattPeak:         PANEL_WATT_PEAK,
    panelEfficiencyPct:    DEFAULT_PANEL_EFFICIENCY_PCT,
    systemEfficiencyPct:   round(efficiency * 100, 1),
    annualDegradationPct:  ANNUAL_DEGRADATION_RATE * 100,
    performanceRatio:      efficiency,
    rateEscalationPct:     ANNUAL_RATE_ESCALATION * 100,
    federalItcRate:        FEDERAL_ITC_RATE,
    projectionYears:       PROJECTION_YEARS,
    co2KgPerKwh:           CO2_KG_PER_KWH,
  };

  return {
    // ── Required specification output ──
    systemSize:      system.systemKw,
    annualProduction: production.annualKwh,
    cost:            investment.grossCost,
    savings:         financials.netSavings25yr,
    roi:             financials.paybackYears,
    monthlySavings:  financials.monthlySavings,

    // ── Detailed breakdown ──
    system,
    usage,
    production,
    investment,
    financials,
    environmental,
    location,
    assumptions,
  };
}

// ── UTILITY EXPORTS ───────────────────────────────────────────────

/** Expose the irradiance database for location pickers / UI hints. */
export { IRRADIANCE_DB, PROJECTION_YEARS, FEDERAL_ITC_RATE };

/** Return irradiance record for a location, or the fallback. */
export function getLocationData(location: string): IrradianceRecord & { isFallback: boolean } {
  const { record, isFallback } = resolveIrradiance(location);
  return { ...record, isFallback };
}
