"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

// ── Panel positions on the main roof (world-space, relative to house group) ──
const PANEL_POSITIONS: [number, number, number][] = [
  [-1.65, 3.28, -0.95],
  [-0.35, 3.28, -0.95],
  [0.95, 3.28, -0.95],
  [-1.65, 3.28, 0.30],
  [-0.35, 3.28, 0.30],
  [0.95, 3.28, 0.30],
];

const PANEL_ROTATION: [number, number, number] = [0.18, 0, 0]; // tilt toward sun

interface HouseModelProps {
  solarFactor: number;
  isNight: boolean;
  hoveredPanel: number | null;
  selectedPanel: number | null;
  onPanelHover: (idx: number | null) => void;
  onPanelSelect: (idx: number | null) => void;
}

// ── Reusable sub-components ───────────────────────────────────────────────────

interface BoxProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
  receiveShadow?: boolean;
  castShadow?: boolean;
}

function Box({
  position,
  size,
  color,
  roughness = 0.85,
  metalness = 0,
  emissive = "#000000",
  emissiveIntensity = 0,
  transparent = false,
  opacity = 1,
  receiveShadow = true,
  castShadow = true,
}: BoxProps) {
  return (
    <mesh position={position} receiveShadow={receiveShadow} castShadow={castShadow}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        transparent={transparent}
        opacity={opacity}
      />
    </mesh>
  );
}

// ── Individual Solar Panel ────────────────────────────────────────────────────

interface PanelProps {
  position: [number, number, number];
  index: number;
  isHovered: boolean;
  isSelected: boolean;
  solarFactor: number;
  onHover: (idx: number | null) => void;
  onSelect: (idx: number) => void;
}

function SolarPanel({
  position,
  index,
  isHovered,
  isSelected,
  solarFactor,
  onHover,
  onSelect,
}: PanelProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);

  const baseEmissive = solarFactor * 0.6;
  const targetIntensity = isSelected
    ? 2.2
    : isHovered
    ? 1.8
    : 0.15 + baseEmissive;

  useFrame((_, delta) => {
    if (!matRef.current) return;
    matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      matRef.current.emissiveIntensity,
      targetIntensity,
      delta * 6
    );
  });

  return (
    <group
      position={position}
      rotation={PANEL_ROTATION}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        onHover(index);
      }}
      onPointerOut={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        document.body.style.cursor = "default";
        onHover(null);
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect(index);
      }}
    >
      {/* Main panel body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.12, 0.04, 0.72]} />
        <meshStandardMaterial
          ref={matRef}
          color="#071428"
          roughness={0.12}
          metalness={0.6}
          emissive={isSelected ? "#0044cc" : "#003399"}
          emissiveIntensity={targetIntensity}
        />
      </mesh>

      {/* Panel frame */}
      <mesh castShadow>
        <boxGeometry args={[1.16, 0.02, 0.76]} />
        <meshStandardMaterial color="#1a1e24" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* Cell grid lines (vertical) — thin dark strips */}
      {[-0.3, 0, 0.3].map((x) => (
        <mesh key={x} position={[x, 0.026, 0]}>
          <boxGeometry args={[0.01, 0.001, 0.68]} />
          <meshBasicMaterial color="#000a1a" />
        </mesh>
      ))}
      {/* Cell grid lines (horizontal) */}
      {[-0.22, 0, 0.22].map((z) => (
        <mesh key={z} position={[0, 0.026, z]}>
          <boxGeometry args={[1.08, 0.001, 0.01]} />
          <meshBasicMaterial color="#000a1a" />
        </mesh>
      ))}

      {/* Selection ring indicator */}
      {(isSelected || isHovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
          <ringGeometry args={[0.6, 0.64, 48]} />
          <meshBasicMaterial
            color={isSelected ? "#0066ff" : "#38bdf8"}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}
    </group>
  );
}

// ── Window glass ──────────────────────────────────────────────────────────────

interface WindowProps {
  position: [number, number, number];
  size: [number, number, number];
  isNight: boolean;
}

function Window({ position, size, isNight }: WindowProps) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={isNight ? "#ff9933" : "#0d1e38"}
        roughness={0}
        metalness={0.1}
        emissive={isNight ? "#ff6600" : "#001133"}
        emissiveIntensity={isNight ? 1.4 : 0}
        transparent
        opacity={isNight ? 0.9 : 0.78}
      />
    </mesh>
  );
}

// ── Main HouseModel component ─────────────────────────────────────────────────

export default function HouseModel({
  solarFactor,
  isNight,
  hoveredPanel,
  selectedPanel,
  onPanelHover,
  onPanelSelect,
}: HouseModelProps) {
  // Wall material — reused
  const wallColor = "#c9cdd8";
  const roofColor = "#101318";

  return (
    <group>
      {/* ── Main body ───────────────────────────────────────────────── */}
      <Box
        position={[0, 1.5, 0]}
        size={[5.2, 3.0, 4.2]}
        color={wallColor}
        roughness={0.88}
      />

      {/* Roof (flat, dark slate overhang) */}
      <Box
        position={[0, 3.11, 0]}
        size={[5.55, 0.22, 4.55]}
        color={roofColor}
        roughness={0.7}
        metalness={0.05}
      />

      {/* ── Wing / Garage ───────────────────────────────────────────── */}
      <Box
        position={[4.1, 1.1, 0.35]}
        size={[3.0, 2.2, 3.6]}
        color={wallColor}
        roughness={0.88}
      />

      {/* Wing roof */}
      <Box
        position={[4.1, 2.31, 0.35]}
        size={[3.2, 0.22, 3.8]}
        color={roofColor}
        roughness={0.7}
        metalness={0.05}
      />

      {/* Garage door panel */}
      <Box
        position={[4.1, 0.9, -1.47]}
        size={[2.6, 1.8, 0.06]}
        color="#1a1c22"
        roughness={0.3}
        metalness={0.6}
      />
      {/* Garage door horizontal strips */}
      {[-0.3, 0, 0.3].map((y) => (
        <mesh key={y} position={[4.1, 0.9 + y, -1.48]} castShadow={false}>
          <boxGeometry args={[2.58, 0.04, 0.01]} />
          <meshStandardMaterial color="#111318" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}

      {/* ── Front facade details ─────────────────────────────────────── */}

      {/* Large living room window */}
      <Window position={[-1.1, 1.65, -2.14]} size={[1.6, 1.75, 0.07]} isNight={isNight} />

      {/* Staircase/vertical window */}
      <Window position={[0.55, 2.1, -2.14]} size={[0.65, 2.6, 0.07]} isNight={isNight} />

      {/* Bedroom window */}
      <Window position={[1.85, 1.9, -2.14]} size={[0.5, 1.0, 0.07]} isNight={isNight} />

      {/* Front door */}
      <Box
        position={[-2.2, 1.0, -2.14]}
        size={[0.9, 2.1, 0.07]}
        color="#0d1117"
        roughness={0.4}
        metalness={0.3}
      />

      {/* Door handle */}
      <mesh position={[-1.78, 1.0, -2.18]} castShadow={false}>
        <cylinderGeometry args={[0.02, 0.02, 0.14, 8]} />
        <meshStandardMaterial color="#888" metalness={1} roughness={0.2} />
      </mesh>

      {/* ── Side windows ───────────────────────────────────────────── */}
      <Window position={[2.64, 1.7, -0.8]} size={[0.07, 1.2, 0.9]} isNight={isNight} />
      <Window position={[2.64, 1.7, 0.8]} size={[0.07, 1.0, 0.7]} isNight={isNight} />

      {/* ── Exterior accent trim on roof edge ───────────────────────── */}
      <Box
        position={[0, 3.2, -2.28]}
        size={[5.55, 0.06, 0.06]}
        color="#0a0c10"
        roughness={0.6}
        metalness={0.4}
        castShadow={false}
      />

      {/* ── Helios Powerwall / inverter box on side ───────────────────── */}
      <Box
        position={[-2.66, 1.4, 0.5]}
        size={[0.08, 0.55, 0.32]}
        color="#111318"
        roughness={0.3}
        metalness={0.8}
      />
      {/* Powerwall status LED */}
      <mesh position={[-2.71, 1.6, 0.5]} castShadow={false}>
        <boxGeometry args={[0.02, 0.04, 0.04]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={solarFactor > 0.05 ? 2 : 0.3}
        />
      </mesh>

      {/* ── Front entry path ─────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[-2.2, 0.004, -3.5]}>
        <planeGeometry args={[1.2, 3.5]} />
        <meshStandardMaterial color="#0e1013" roughness={0.9} />
      </mesh>

      {/* ── Solar panels (6) ─────────────────────────────────────────── */}
      {PANEL_POSITIONS.map((pos, i) => (
        <SolarPanel
          key={i}
          index={i}
          position={pos}
          isHovered={hoveredPanel === i}
          isSelected={selectedPanel === i}
          solarFactor={solarFactor}
          onHover={onPanelHover}
          onSelect={onPanelSelect}
        />
      ))}
    </group>
  );
}
