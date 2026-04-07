"use client";

import { useEffect } from "react";
import { useSpring, useTransform, motion } from "framer-motion";

interface AnimatedNumberProps {
  /** The target value. For decimals, multiply by 10 and use format to divide back. */
  value: number;
  /** Called with Math.round(springValue). Default: toLocaleString */
  format?: (n: number) => string;
  className?: string;
  stiffness?: number;
  damping?: number;
}

export default function AnimatedNumber({
  value,
  format = (n) => n.toLocaleString(),
  className,
  stiffness = 80,
  damping = 18,
}: AnimatedNumberProps) {
  const spring = useSpring(value, { stiffness, damping });
  const display = useTransform(spring, (v) => format(Math.round(v)));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{display}</motion.span>;
}
