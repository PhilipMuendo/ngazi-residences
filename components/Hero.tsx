"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { site, UNITS, TOWER, PRICING, formatKES, formatUSD } from "@/config/site";
import { heroCamera, levelForHeight } from "@/lib/towerGeometry";
import { useScrollTo } from "@/lib/smooth-scroll";
import { useSelection } from "@/lib/selection";
import { usePrefersReducedMotion } from "@/lib/useMedia";
import viewDusk from "@/assets/images/view-dusk.jpg";

const Tower3D = dynamic(() => import("./Tower3D"), { ssr: false });

/*
 * LOBBY → ROOF. The tower at dusk, seen from the pavement on Riverside Drive.
 * Scroll and you ride the lift up the facade: the display counts the levels
 * and the height; at the top the camera steps back to show the whole tower
 * over the city. Then the lift doors close and you're inside.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();
  const { currency } = useSelection();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [lift, setLift] = useState({ level: 0, height: 0 });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // reduced motion: no lift ride, the opening view from the pavement held still
  const reduce = usePrefersReducedMotion();
  const still = useMotionValue(0);
  const anim = mounted && !reduce;

  useMotionValueEvent(p, "change", (v) => {
    if (reduce) return;
    const y = heroCamera(Math.min(1, v / 0.9)).y;
    const level = levelForHeight(y);
    if (level !== lift.level) setLift({ level, height: y });
  });

  const camP = useTransform(p, (v) => Math.min(1, v / 0.9));
  const titleY = useTransform(p, [0, 0.25], ["0vh", "-12vh"]);
  const titleO = useTransform(p, [0.05, 0.22], [1, 0]);
  const uiO = useTransform(p, (v) => 1 - Math.min(1, v / 0.08));
  const roofO = useTransform(p, [0.66, 0.74, 0.86, 0.9], [0, 1, 1, 0]);
  // lift doors close over the last stretch
  const doorL = useTransform(p, [0.9, 1], ["-101%", "0%"]);
  const doorR = useTransform(p, [0.9, 1], ["101%", "0%"]);

  const from = Math.min(...UNITS.map((u) => u.price));
  const available = UNITS.filter((u) => u.status === "available").length;
  const lvl = lift.level === 0 ? "G" : lift.level > 24 ? "R" : String(lift.level).padStart(2, "0");

  return (
    <section ref={ref} id="top" data-theme="dark" aria-labelledby="hero-title" className={`relative bg-[#1A2233] ${reduce ? "h-[100svh]" : "h-[360svh]"}`}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <Tower3D
          mode="dusk"
          progress={reduce ? still : camP}
          className="absolute inset-0"
          fallback={<Image src={viewDusk} alt="" fill priority sizes="100vw" className="object-cover" />}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(14,22,40,0.55)_0%,rgba(14,22,40,0.1)_45%,transparent_70%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(0deg,rgba(10,14,26,0.88)_0%,rgba(10,14,26,0.5)_45%,transparent_100%)] sm:h-[35%] sm:bg-[linear-gradient(0deg,rgba(10,14,26,0.6)_0%,transparent_100%)]" />

        {/* headline */}
        <motion.h1 id="hero-title" className="wrap pointer-events-none absolute inset-x-0 top-[17svh] text-paper" style={{ y: anim ? titleY : 0, opacity: anim ? titleO : 1 }}>
          <span className="sr-only">
            {site.name}: live a level above. {site.tagline}.
          </span>
          <span aria-hidden="true" className="h-hero block">
            {["Live a level", "above."].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <motion.span className="block" initial={{ y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.35 + i * 0.12 }}>
                  {i === 1 ? <em className="font-[200] not-italic [font-stretch:125%]">{line}</em> : line}
                </motion.span>
              </span>
            ))}
          </span>
        </motion.h1>

        {/* the lift display */}
        <div className="wrap pointer-events-none absolute inset-x-0 bottom-[var(--gutter)] flex flex-col-reverse gap-6 text-paper sm:flex-row sm:items-end sm:justify-between">
          <div aria-hidden="true" className="flex items-end gap-4">
            <span className="num text-[clamp(3.6rem,11vw,10rem)] leading-[0.8] text-[#C9D3FF] [text-shadow:0_0_24px_rgba(120,150,255,0.45)]">{lvl}</span>
            <span className="mb-2 flex flex-col gap-1">
              <span className="data text-paper/60">Level</span>
              <span className="data tabular-nums text-paper">+{lift.height.toFixed(1)} m</span>
            </span>
          </div>
          <motion.div className="pointer-events-auto flex max-w-[30rem] flex-col items-start gap-5 sm:items-end sm:text-right" style={{ opacity: anim ? uiO : 1 }}>
            <p className="body text-paper/85">
              {UNITS.length} homes on {TOWER.levels} levels above Riverside Drive, facing the Ngong Hills. From{" "}
              <strong className="font-medium text-paper">{currency === "KES" ? formatKES(from) : formatUSD(from)}</strong> · {available} available · completion {PRICING.completionLabel}.
            </p>
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
              <button type="button" onClick={() => scrollTo("#homes")} className="h-12 whitespace-nowrap bg-paper px-5 sm:px-6 text-[0.88rem] font-medium text-graphite transition-colors hover:bg-cobalt hover:text-white">
                Find your home
              </button>
              <button type="button" onClick={() => scrollTo("#visit")} className="h-12 whitespace-nowrap border border-paper/40 px-5 sm:px-6 text-[0.88rem] text-paper transition-colors hover:bg-paper/10">
                Book a viewing
              </button>
            </div>
          </motion.div>
        </div>

        <motion.p aria-hidden="true" className="data wrap pointer-events-none absolute inset-x-0 top-[18svh] text-paper/80" style={{ opacity: reduce ? 0 : roofO }}>
          Roof · +92.4 m · 1°16′ S 36°48′ E · Riverside Drive, Nairobi
        </motion.p>

        {/* lift doors */}
        {!reduce && (
          <>
            <motion.div aria-hidden="true" className="absolute inset-y-0 left-0 z-10 w-1/2 bg-paper" style={{ x: doorL }}>
              <div className="absolute inset-y-0 right-0 w-px bg-graphite/30" />
            </motion.div>
            <motion.div aria-hidden="true" className="absolute inset-y-0 right-0 z-10 w-1/2 bg-paper" style={{ x: doorR }}>
              <div className="absolute inset-y-0 left-0 w-px bg-graphite/30" />
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
