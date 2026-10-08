"use client";
import { useEffect, useState, useSyncExternalStore } from "react";

/** SSR-safe media query hook. `fallback` is used on the server and first paint. */
export function useMedia(query: string, fallback = false) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

export const useFinePointer = () => useMedia("(hover: hover) and (pointer: fine)", false);
export const useDesktop = () => useMedia("(min-width: 768px)", true);
/** Hydration-safe reduced-motion flag (false on the server, real value after mount). */
export const usePrefersReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)", false);

/** Viewport size in px, updated on resize. Returns null before mount. */
export function useViewport() {
  const [vp, setVp] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    // only react to width changes: mobile URL-bar resizes must not reflow pinned sections
    const on = () => setVp((v) => (v && v.w === window.innerWidth ? v : { w: window.innerWidth, h: window.innerHeight }));
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return vp;
}
