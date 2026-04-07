"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Constants ─────────────────────────────────────────────────────────────────

const SPHERE_GEO = new THREE.SphereGeometry(0.04, 7, 7);

// 3 flow paths with distinct colours
const FLOWS = [
  {
    id: "sun-panels",
    color: "#fbbf24",  // amber — sunlight
    count: 14,
    baseSpeed: 0.28,
  },
  {
    id: "panels-house",
    color: "#38bdf8",  // sky blue — DC energy
    count: 11,
    baseSpeed: 0.38,
  },
  {
    id: "house-grid",
    color: "#a855f7",  // violet — AC to grid
    count: 9,
    baseSpeed: 0.32,
  },
] as const;

// Panel cluster centre (world space)
const PANEL_CENTER = new THREE.Vector3(0, 3.3, -0.3);
// House electrical entry
const HOUSE_ENTRY = new THREE.Vector3(-1.2, 1.5, 0.5);
// Grid pole (off-scene)
const GRID_POLE = new THREE.Vector3(-13, 1.5, -1);

// ── Build a Catmull-Rom curve from Vector3 waypoints ──────────────────────────

function makeCurve(points: THREE.Vector3[]): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
}

// ── Single animated particle stream ──────────────────────────────────────────

interface FlowStreamProps {
  curve: THREE.CatmullRomCurve3;
  color: string;
  count: number;
  speed: number;
  visible: boolean;
}

const dummy = new THREE.Object3D();

function FlowStream({ curve, color, count, speed, visible }: FlowStreamProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [color]
  );

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    mesh.visible = visible;
    if (!visible) return;

    const t = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      // Spread particles evenly, staggered around the curve
      const progress = ((t * speed + i / count) % 1 + 1) % 1;

      // Fade in at start, fade out at end — gives leading/trailing glow
      const fade = Math.sin(progress * Math.PI);
      const scale = 0.6 + fade * 0.8;

      try {
        const pos = curve.getPoint(progress);
        dummy.position.copy(pos);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, new THREE.Color(color).multiplyScalar(0.5 + fade * 0.5));
      } catch {
        // curve.getPoint can throw at boundary — skip safely
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[SPHERE_GEO, material, count]}
      frustumCulled={false}
    />
  );
}

// ── Tube path (visible wire) ──────────────────────────────────────────────────

function PathTube({
  curve,
  color,
  visible,
}: {
  curve: THREE.CatmullRomCurve3;
  color: string;
  visible: boolean;
}) {
  const geo = useMemo(
    () => new THREE.TubeGeometry(curve, 64, 0.008, 6, false),
    [curve]
  );

  if (!visible) return null;

  return (
    <mesh geometry={geo} frustumCulled={false}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// ── Main EnergyFlow component ─────────────────────────────────────────────────

interface EnergyFlowProps {
  sunPosition: [number, number, number];
  solarFactor: number;
  visible: boolean;
}

export default function EnergyFlow({
  sunPosition,
  solarFactor,
  visible,
}: EnergyFlowProps) {
  const [sx, sy, sz] = sunPosition;

  // Recompute curves only when sun moves noticeably
  const curves = useMemo(() => {
    const sunVec = new THREE.Vector3(sx, sy, sz);

    // ① Sun → Panels — arcing beam from sky
    const sunToPanels = makeCurve([
      sunVec,
      new THREE.Vector3(sx * 0.55, sy * 0.65, sz * 0.4),
      new THREE.Vector3(sx * 0.15, sy * 0.25 + 1.5, -2.5),
      PANEL_CENTER,
    ]);

    // ② Panels → House — short internal arc
    const panelsToHouse = makeCurve([
      PANEL_CENTER,
      new THREE.Vector3(0.2, 3.0, 0),
      new THREE.Vector3(-0.5, 2.2, 0.3),
      HOUSE_ENTRY,
    ]);

    // ③ House → Grid — horizontal run to the street pole
    const houseToGrid = makeCurve([
      HOUSE_ENTRY,
      new THREE.Vector3(-4.5, 1.5, -0.2),
      new THREE.Vector3(-8.5, 1.5, -0.8),
      GRID_POLE,
    ]);

    return [sunToPanels, panelsToHouse, houseToGrid];
  }, [sx, sy, sz]);

  // Scale particle speed with solar output — faster = more power
  const speeds = useMemo(
    () =>
      FLOWS.map((f) => f.baseSpeed * (0.55 + solarFactor * 0.8)),
    [solarFactor]
  );

  return (
    <group>
      {FLOWS.map((flow, i) => (
        <group key={flow.id}>
          <PathTube curve={curves[i]} color={flow.color} visible={visible} />
          <FlowStream
            curve={curves[i]}
            color={flow.color}
            count={flow.count}
            speed={speeds[i]}
            visible={visible}
          />
        </group>
      ))}
    </group>
  );
}
