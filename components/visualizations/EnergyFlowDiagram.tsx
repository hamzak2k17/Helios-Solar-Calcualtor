"use client";

import { motion } from "framer-motion";

// ── Node config ──────────────────────────────────────────────────────────────

const R = 26;   // circle radius
const CY = 46;  // centre-y of all nodes
const LABEL_Y = CY + R + 15; // y position of text label

const NODES = [
  { cx: 48,  label: "Solar",  color: "#fbbf24", symbol: "✦" },
  { cx: 176, label: "Panels", color: "#38bdf8", symbol: "≡" },
  { cx: 304, label: "Home",   color: "#4ade80", symbol: "⌂" },
  { cx: 432, label: "Grid",   color: "#a78bfa", symbol: "~" },
];

// Each connection bridges the right edge of the from-node to the left edge of
// the to-node: fromCx + R → toCx − R
const CONNECTIONS = [
  { x1: 74,  x2: 150, color: "#fbbf24" }, // Solar  → Panels
  { x1: 202, x2: 278, color: "#38bdf8" }, // Panels → Home
  { x1: 330, x2: 406, color: "#4ade80" }, // Home   → Grid
];

// ── Sub-components ────────────────────────────────────────────────────────────

interface ConnectionProps {
  x1: number;
  x2: number;
  color: string;
  speed: number; // seconds per cycle
}

function FlowConnection({ x1, x2, color, speed }: ConnectionProps) {
  const dashTotal = 14; // must equal dasharray sum (5 + 9)
  const particleDuration = speed * 2.2;

  return (
    <g>
      {/* Base dim track */}
      <line
        x1={x1} y1={CY} x2={x2} y2={CY}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.12}
      />

      {/* Animated flowing dashes */}
      <motion.path
        d={`M${x1},${CY} L${x2},${CY}`}
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="5 9"
        strokeOpacity={0.45}
        fill="none"
        animate={{ strokeDashoffset: [dashTotal, 0] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      />

      {/* 3 staggered glow particles */}
      {[0, 0.33, 0.66].map((offset, i) => (
        <motion.circle
          key={i}
          r={3.5}
          cy={CY}
          fill={color}
          style={{ filter: `drop-shadow(0 0 5px ${color})` }}
          animate={{
            cx: [x1, x2],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: particleDuration,
            delay: offset * particleDuration,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.08, 0.88, 1],
          }}
        />
      ))}
    </g>
  );
}

interface NodeProps {
  cx: number;
  color: string;
  label: string;
  symbol: string;
  pulseDelay: number;
}

function FlowNode({ cx, color, label, symbol, pulseDelay }: NodeProps) {
  return (
    <g>
      {/* Outer pulsing glow ring */}
      <motion.circle
        cx={cx}
        cy={CY}
        r={R + 10}
        fill={color}
        animate={{ fillOpacity: [0.04, 0.16, 0.04] }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: pulseDelay,
        }}
      />

      {/* Second inner glow ring */}
      <motion.circle
        cx={cx}
        cy={CY}
        r={R + 4}
        fill={color}
        animate={{ fillOpacity: [0.06, 0.18, 0.06] }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: pulseDelay + 0.15,
        }}
      />

      {/* Main node circle */}
      <circle
        cx={cx}
        cy={CY}
        r={R}
        fill={color}
        fillOpacity={0.1}
        stroke={color}
        strokeWidth={1.5}
        strokeOpacity={0.7}
      />

      {/* Symbol inside */}
      <text
        x={cx}
        y={CY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={16}
        fill={color}
        fillOpacity={0.9}
        fontFamily="system-ui, sans-serif"
      >
        {symbol}
      </text>

      {/* Label below */}
      <text
        x={cx}
        y={LABEL_Y}
        textAnchor="middle"
        fontSize={8}
        fill="rgba(255,255,255,0.3)"
        fontFamily="system-ui, sans-serif"
        fontWeight={600}
        letterSpacing={1}
      >
        {label.toUpperCase()}
      </text>
    </g>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface EnergyFlowDiagramProps {
  /** True when Live Mode is active — speeds up the particles */
  isLive?: boolean;
}

export default function EnergyFlowDiagram({ isLive = false }: EnergyFlowDiagramProps) {
  const speed = isLive ? 0.5 : 0.82; // seconds per dash cycle

  return (
    <div className="w-full select-none" style={{ height: 108 }}>
      <svg
        viewBox="0 0 480 108"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        aria-label="Energy flow: Solar panels → Home → Grid"
      >
        {/* Connections (rendered first so nodes sit on top) */}
        {CONNECTIONS.map((conn, i) => (
          <FlowConnection key={i} {...conn} speed={speed} />
        ))}

        {/* Nodes */}
        {NODES.map((node, i) => (
          <FlowNode key={node.label} {...node} pulseDelay={i * 0.45} />
        ))}
      </svg>
    </div>
  );
}
