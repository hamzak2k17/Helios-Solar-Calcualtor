"use client";

import dynamic from "next/dynamic";

const SolarExperience = dynamic(
  () => import("./components/SolarExperience"),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-[#060812] flex flex-col items-center justify-center gap-5">
        <div
          className="w-10 h-10 rounded-full border-2 border-sky-500/20 border-t-sky-400"
          style={{ animation: "spin 1s linear infinite" }}
        />
        <p className="text-[11px] text-white/25 uppercase tracking-[0.35em]">
          Loading Experience
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    ),
  }
);

export default function ClientEntry() {
  return <SolarExperience />;
}
