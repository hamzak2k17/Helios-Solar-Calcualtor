"use client";

import { useState } from "react";
import { Sky, Stars, OrbitControls } from "@react-three/drei";
import HouseModel from "./HouseModel";
import EnergyFlow from "./EnergyFlow";

interface SolarSceneProps {
  isNight: boolean;
  showFlow: boolean;
  sunPosition: [number, number, number];
  solarFactor: number;
  simHour: number;
  selectedPanel: number | null;
  onPanelSelect: (idx: number | null) => void;
}

export default function SolarScene({
  isNight,
  showFlow,
  sunPosition,
  solarFactor,
  simHour,
  selectedPanel,
  onPanelSelect,
}: SolarSceneProps) {
  const [hoveredPanel, setHoveredPanel] = useState<number | null>(null);

  // Dynamic sky atmosphere — warm at dawn/dusk, clear at midday
  const isSunrise = simHour >= 5.5 && simHour <= 8.5;
  const isSunset = simHour >= 17.5 && simHour <= 20.5;
  const isGoldenHour = isSunrise || isSunset;

  const turbidity = isGoldenHour ? 10 : 7;
  const rayleigh = isGoldenHour ? 2.5 : 0.4;

  // Light intensities
  const ambientIntensity = isNight ? 0.06 : 0.3 + solarFactor * 0.2;
  const sunIntensity = isNight ? 0 : solarFactor * 2.8;
  const sunColor = isGoldenHour ? "#ff8844" : "#fffbf0";

  // Fog
  const fogColor = isNight ? "#020408" : "#c4d8ea";
  const fogNear = 30;
  const fogFar = isNight ? 50 : 65;

  return (
    <>
      {/* ── Atmosphere ──────────────────────────────────────────────── */}
      {isNight ? (
        <>
          <color attach="background" args={["#020508"]} />
          <Stars
            radius={120}
            depth={60}
            count={4000}
            factor={4}
            saturation={0.1}
            fade
            speed={0.3}
          />
        </>
      ) : (
        <Sky
          distance={450000}
          sunPosition={sunPosition}
          turbidity={turbidity}
          rayleigh={rayleigh}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />
      )}

      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />

      {/* ── Lighting ────────────────────────────────────────────────── */}
      <ambientLight
        intensity={ambientIntensity}
        color={isNight ? "#1a2448" : "#ffffff"}
      />

      {/* Sun / directional light */}
      <directionalLight
        castShadow
        position={sunPosition}
        intensity={sunIntensity}
        color={sunColor}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={40}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.001}
      />

      {/* Night: subtle moonlight */}
      {isNight && (
        <directionalLight
          position={[-6, 9, 4]}
          intensity={0.18}
          color="#3355bb"
        />
      )}

      {/* Hemisphere fill */}
      <hemisphereLight
        args={[
          isNight ? "#0a0f30" : "#ddeeff",
          isNight ? "#000005" : "#112200",
          isNight ? 0.08 : 0.25,
        ]}
      />

      {/* ── Ground ──────────────────────────────────────────────────── */}
      {/* Outer ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#080d08" roughness={1} />
      </mesh>

      {/* Lawn around house */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0.002, 0]}>
        <planeGeometry args={[20, 16]} />
        <meshStandardMaterial color="#0b1a0c" roughness={0.95} />
      </mesh>

      {/* Driveway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[4.2, 0.003, 5]}>
        <planeGeometry args={[4.5, 8]} />
        <meshStandardMaterial color="#0c0f11" roughness={0.9} />
      </mesh>

      {/* ── House ───────────────────────────────────────────────────── */}
      <HouseModel
        solarFactor={isNight ? 0 : solarFactor}
        isNight={isNight}
        hoveredPanel={hoveredPanel}
        selectedPanel={selectedPanel}
        onPanelHover={setHoveredPanel}
        onPanelSelect={onPanelSelect}
      />

      {/* ── Energy particles ────────────────────────────────────────── */}
      <EnergyFlow
        sunPosition={sunPosition}
        solarFactor={solarFactor}
        visible={showFlow && !isNight && solarFactor > 0.04}
      />

      {/* ── Camera ──────────────────────────────────────────────────── */}
      <OrbitControls
        target={[0, 1.8, 0]}
        enablePan={false}
        minDistance={7}
        maxDistance={26}
        maxPolarAngle={Math.PI / 2.05}
        enableDamping
        dampingFactor={0.07}
      />
    </>
  );
}
