"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface SavingsLineChartProps {
  cumulativeCashFlow: number[];
  yearlySavings: number[];
  paybackYears: number;
  netCost: number;
}

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const cf = payload.find((p) => p.dataKey === "cashFlow")?.value ?? 0;
  const savings = payload.find((p) => p.dataKey === "annualSavings")?.value ?? 0;
  const isPositive = cf >= 0;

  return (
    <div className="bg-[#111] border border-white/10 rounded-xl px-4 py-3 shadow-2xl min-w-[160px]">
      <p className="text-[10px] text-white/35 uppercase tracking-widest mb-2">Year {label}</p>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center gap-6">
          <span className="text-[11px] text-white/40">Cumulative</span>
          <span className={`text-sm font-semibold tabular-nums ${isPositive ? "text-sky-400" : "text-white/55"}`}>
            {isPositive ? "+" : ""}${Math.round(cf).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center gap-6">
          <span className="text-[11px] text-white/40">This year</span>
          <span className="text-sm font-semibold text-white/70 tabular-nums">
            +${Math.round(savings).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SavingsLineChart({
  cumulativeCashFlow,
  yearlySavings,
  paybackYears,
  netCost,
}: SavingsLineChartProps) {
  const data = useMemo(
    () =>
      cumulativeCashFlow.map((cf, i) => ({
        year: i + 1,
        cashFlow: Math.round(cf),
        annualSavings: Math.round(yearlySavings[i]),
      })),
    [cumulativeCashFlow, yearlySavings]
  );

  const minVal = Math.min(...cumulativeCashFlow, -netCost);
  const maxVal = Math.max(...cumulativeCashFlow);

  const formatY = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 1000) return `${v < 0 ? "-" : ""}$${Math.round(abs / 1000)}k`;
    return `$${v}`;
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="cfPositive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.03} />
          </linearGradient>
          <linearGradient id="cfNegative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.04} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.08} />
          </linearGradient>

          {/* Clip positive region only */}
          <clipPath id="positiveClip">
            <rect x="0" y="0" width="100%" height="50%" />
          </clipPath>
        </defs>

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
          tickFormatter={(v) => (v === 1 || v % 5 === 0 ? `Yr ${v}` : "")}
          interval={0}
        />

        <YAxis
          tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatY}
          domain={[Math.floor(minVal / 5000) * 5000, Math.ceil(maxVal / 5000) * 5000]}
          width={48}
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: "rgba(255,255,255,0.12)", strokeWidth: 1, strokeDasharray: "4 2" }}
        />

        {/* Break-even reference */}
        <ReferenceLine
          y={0}
          stroke="rgba(255,255,255,0.18)"
          strokeDasharray="4 2"
          label={{
            value: "Break-even",
            fill: "rgba(255,255,255,0.25)",
            fontSize: 9,
            position: "insideTopLeft",
          }}
        />

        {/* Payback year marker */}
        {paybackYears > 0 && paybackYears <= 25 && (
          <ReferenceLine
            x={paybackYears}
            stroke="#38bdf8"
            strokeOpacity={0.4}
            strokeDasharray="3 3"
            label={{
              value: `Payback yr ${paybackYears}`,
              fill: "#38bdf8",
              fillOpacity: 0.7,
              fontSize: 9,
              position: "insideTopRight",
            }}
          />
        )}

        {/* Fill below zero */}
        <Area
          type="monotone"
          dataKey="cashFlow"
          stroke="none"
          fill="url(#cfNegative)"
          activeDot={false}
          animationDuration={1200}
          animationEasing="ease-out"
        />

        {/* Main line + positive fill */}
        <Area
          type="monotone"
          dataKey="cashFlow"
          stroke="#38bdf8"
          strokeWidth={1.5}
          fill="url(#cfPositive)"
          dot={false}
          activeDot={{ r: 4, fill: "#38bdf8", stroke: "#0b0b0b", strokeWidth: 2 }}
          animationDuration={1200}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
