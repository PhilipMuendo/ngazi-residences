"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MotionConfig, useReducedMotion } from "motion/react";

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

/**
 * Lenis smooth scrolling. Disabled entirely for prefers-reduced-motion users.
 * Native window scrolling is preserved, so position: sticky and Motion's
 * useScroll keep working.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reduce) return;
    const l = new Lenis({ autoRaf: true, lerp: 0.095, wheelMultiplier: 0.9, anchors: false });
    setLenis(l);
    return () => {
      l.destroy();
      setLenis(null);
    };
  }, [reduce]);

  // reducedMotion="user": Motion skips transform/layout animation for users who ask for less motion
  return (
    <MotionConfig reducedMotion="user">
      <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
    </MotionConfig>
  );
}

/** Smoothly scroll to a hash target, falling back to native scrolling. */
export function useScrollTo() {
  const lenis = useLenis();
  return (target: string | number) => {
    if (lenis) {
      lenis.scrollTo(target as string, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), force: true });
      return;
    }
    if (typeof target === "number") window.scrollTo({ top: target });
    else document.querySelector(target)?.scrollIntoView();
  };
}
