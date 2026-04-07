"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";

interface ProductionBarChartProps {
  yearlyProduction: number[];
  annualUsage: number;
}

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const production = payload.find((p) => p.dataKey === "production")?.value ?? 0;
  const usage = payload.find((p) => p.dataKey === "usage")?.value ?? 0;
  const surplus = production - usage;

  return (
    <div className="bg-[#111] border border-white/10 rounded-xl px-4 py-3 shadow-2xl min-w-[155px]">
      <p className="text-[10px] text-white/35 uppercase tracking-widest mb-2">Year {label}</p>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center gap-6">
          <span className="text-[11px] text-white/40">Solar</span>
          <span className="text-sm font-semibold text-sky-400 tabular-nums">
            {Math.round(production).toLocaleString()} kWh
          </span>
        </div>
        <div className="flex justify-between items-center gap-6">
          <span className="text-[11px] text-white/40">Usage</span>
          <span className="text-sm font-semibold text-white/55 tabular-nums">
            {Math.round(usage).toLocaleString()} kWh
          </span>
        </div>
        <div className="h-px bg-white/8 my-0.5" />
        <div className="flex justify-between items-center gap-6">
          <span className="text-[11px] text-white/40">
            {surplus >= 0 ? "Surplus" : "Shortfall"}
          </span>
          <span
            className={`text-[11px] font-semibold tabular-nums ${
              surplus >= 0 ? "text-emerald-400/80" : "text-amber-400/80"
            }`}
          >
            {surplus >= 0 ? "+" : ""}
            {Math.round(surplus).toLocaleString()} kWh
          </span>
        </div>
      </div>
    </div>
  );
}

// Select representative years to display (avoid 25 crowded bars)
const DISPLAY_YEARS = [1, 3, 5, 8, 10, 13, 15, 18, 20, 23, 25];

export default function ProductionBarChart({
  yearlyProduction,
  annualUsage,
}: ProductionBarChartProps) {
  const data = useMemo(
    () =>
      DISPLAY_YEARS.filter((y) => y <= yearlyProduction.length).map((yr) => ({
        year: yr,
        production: Math.round(yearlyProduction[yr - 1]),
        usage: Math.round(annualUsage),
      })),
    [yearlyProduction, annualUsage]
  );

  const maxVal = Math.max(...data.map((d) => Math.max(d.production, d.usage)));

  const formatY = (v: number) => {
    if (v >= 1000) return `${Math.round(v / 1000)}k`;
    return `${v}`;
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        barCategoryGap="25%"
        barGap={3}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
          vertical={false}
        />

        <XAxis
          dataKey="year"
          tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `Yr ${v}`}
        />

        <YAxis
          tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatY}
          domain={[0, Math.ceil(maxVal / 1000) * 1000]}
          width={40}
          unit=" kWh"
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />

        {/* Usage reference line */}
        <ReferenceLine
          y={annualUsage}
          stroke="rgba(255,255,255,0.18)"
          strokeDasharray="4 2"
          label={{
            value: "Annual usage",
            fill: "rgba(255,255,255,0.25)",
            fontSize: 9,
            position: "insideTopRight",
          }}
        />

        {/* Usage bar (background) */}
        <Bar
          dataKey="usage"
          radius={[3, 3, 0, 0]}
          fill="rgba(255,255,255,0.08)"
          animationDuration={1000}
          animationEasing="ease-out"
        />

        {/* Production bar (foreground) — fades as it degrades */}
        <Bar
          dataKey="production"
          radius={[3, 3, 0, 0]}
          animationDuration={1000}
          animationEasing="ease-out"
        >
          {data.map((entry, index) => {
            // Opacity decreases with degradation
            const opacityFactor = 0.65 + 0.35 * (entry.production / data[0].production);
            return (
              <Cell
                key={`cell-${index}`}
                fill={`rgba(56, 189, 248, ${opacityFactor})`}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
