"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

interface HeroSectionProps {
  onStart: () => void;
}

const STATS = [
  { value: "30%", label: "Federal Tax Credit" },
  { value: "25 yr", label: "Panel Warranty" },
  { value: "$1.2k", label: "Avg. Annual Savings" },
];

// Static ambient orbs — defined outside component to avoid re-computation
const ORBS = [
  { w: 260, h: 220, top: "8%",  left: "5%",  duration: 22, dx: [-30, 20, -30], dy: [10, -25, 10] },
  { w: 200, h: 200, top: "60%", left: "75%", duration: 18, dx: [20, -15, 20],  dy: [-20, 15, -20] },
  { w: 180, h: 150, top: "80%", left: "15%", duration: 26, dx: [-10, 30, -10], dy: [20, -10, 20] },
  { w: 140, h: 140, top: "20%", right: "8%", duration: 20, dx: [15, -20, 15],  dy: [-15, 25, -15] },
];

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: EASE },
});

export default function HeroSection({ onStart }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  // Mouse-tracking motion values for the parallax glow
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 18 });
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 18 });

  // Map mouse position (−0.5…+0.5) → small glow offset (−40px…+40px)
  const glowX = useTransform(smoothX, [-0.5, 0.5], [-40, 40]);
  const glowY = useTransform(smoothY, [-0.5, 0.5], [-30, 30]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden"
    >
      {/* Ambient drifting orbs */}
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.w,
            height: orb.h,
            top: orb.top,
            left: "left" in orb ? orb.left : undefined,
            right: "right" in orb ? orb.right : undefined,
            background:
              "radial-gradient(ellipse, rgba(56,189,248,0.045) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
          animate={{ x: orb.dx, y: orb.dy }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "mirror",
          }}
        />
      ))}

      {/* Central glow — follows mouse */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[420px] rounded-full pointer-events-none"
        style={{
          x: glowX,
          y: glowY,
          background:
            "radial-gradient(ellipse, rgba(56,189,248,0.08) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Fine-grain subtle vignette grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-8 max-w-5xl w-full">
        {/* Eyebrow badge */}
        <motion.div {...fadeUp(0)}>
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-xs text-white/50 tracking-[0.2em] uppercase font-medium">
              Helios Solar &amp; Storage
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.1)}
          className="text-[clamp(52px,10vw,96px)] font-bold tracking-[-0.03em] leading-[0.93] text-white"
        >
          Design Your
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-sky-100 to-sky-300">
            Solar Future
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          {...fadeUp(0.2)}
          className="text-lg md:text-xl text-white/38 max-w-lg leading-relaxed font-light"
        >
          Calculate savings, energy independence, and ROI in seconds. Powered
          by real irradiance data and your local utility rates.
        </motion.p>

        {/* Stats */}
        <motion.div
          {...fadeUp(0.3)}
          className="flex items-center gap-10 md:gap-16 my-2"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1.5">
              <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {stat.value}
              </span>
              <span className="text-[10px] text-white/32 uppercase tracking-[0.18em] leading-tight">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          {...fadeUp(0.4)}
          className="flex items-center gap-4 mt-2"
        >
          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="relative px-9 py-4 rounded-full bg-white text-[#0b0b0b] font-semibold text-sm tracking-wide overflow-hidden group shadow-[0_0_40px_rgba(255,255,255,0.07)]"
          >
            <span className="relative z-10">Start Calculation</span>
            <span className="absolute inset-0 bg-sky-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-9 py-4 rounded-full border border-white/12 text-white/45 text-sm tracking-wide hover:border-white/25 hover:text-white/70 transition-all duration-300"
          >
            Learn More
          </motion.button>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-10 flex flex-col items-center gap-3"
      >
        <span className="text-[10px] text-white/22 tracking-[0.25em] uppercase">
          Scroll
        </span>
        <div className="w-px h-10 overflow-hidden">
          <motion.div
            className="w-full h-full bg-gradient-to-b from-white/30 to-transparent"
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
