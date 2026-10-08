"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { site, TOWER } from "@/config/site";

/*
 * AMENITIES as a building section. The drawing is cut through the tower;
 * point at an amenity and its level lights up in the cut while the
 * photograph appears beside it.
 */

const BANDS: Record<string, { y: number; h: number }> = {
  Roof: { y: 22, h: 26 },
  L1: { y: 478, h: 18 },
  G: { y: 496, h: 30 },
  "B1–B2": { y: 528, h: 42 },
};

function Section({ active }: { active: string | null }) {
  const ink = "#2340E0";
  const floors = TOWER.levels;
  const homeTop = 48, homeBottom = 478;
  const fh = (homeBottom - homeTop) / (floors - 1);
  return (
    <svg viewBox="0 0 300 600" className="h-auto w-full" role="img" aria-label="A section cut through the tower showing the roof amenities, homes, residents' level, lobby and basements">
      <defs>
        <pattern id="homes-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#141516" strokeWidth="0.5" opacity="0.18" />
        </pattern>
      </defs>
      {/* ground */}
      <line x1="0" y1="526" x2="300" y2="526" stroke="#141516" strokeWidth="1.4" />
      {/* basements */}
      <rect x="40" y="528" width="220" height="42" fill="none" stroke="#141516" strokeWidth="1" strokeDasharray="3 2" />
      <line x1="40" y1="549" x2="260" y2="549" stroke="#141516" strokeWidth="0.6" strokeDasharray="3 2" />
      {/* tower body */}
      <rect x="70" y={homeTop} width="160" height={homeBottom - homeTop} fill="url(#homes-hatch)" stroke="#141516" strokeWidth="1" />
      {Array.from({ length: floors - 1 }).map((_, i) => (
        <line key={i} x1="70" x2="230" y1={homeTop + i * fh} y2={homeTop + i * fh} stroke="#141516" strokeWidth="0.5" opacity="0.5" />
      ))}
      {/* cores */}
      <rect x="138" y={homeTop} width="24" height={526 - homeTop} fill="none" stroke="#141516" strokeWidth="0.6" />
      {/* L1 + lobby */}
      <rect x="70" y="478" width="160" height="18" fill="none" stroke="#141516" strokeWidth="1" />
      <rect x="80" y="496" width="140" height="30" fill="none" stroke="#141516" strokeWidth="1" />
      {/* roof: pool + pergola */}
      <rect x="70" y="44" width="160" height="4" fill="#141516" />
      <rect x="78" y="34" width="92" height="9" fill={ink} opacity="0.85" />
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={i} x1={176 + i * 8} x2={176 + i * 8} y1="22" y2="44" stroke="#141516" strokeWidth="0.8" />
      ))}
      <line x1="172" x2="230" y1="22" y2="22" stroke="#141516" strokeWidth="1" />

      {/* highlight */}
      {Object.entries(BANDS).map(([k, b]) => (
        <motion.rect key={k} x="36" y={b.y} width="228" height={b.h} fill={ink} initial={false} animate={{ opacity: active === k ? 0.22 : 0 }} transition={{ duration: 0.3 }} />
      ))}

      {/* labels */}
      <g className="font-mono" fontSize="8" fill="#141516">
        <text x="236" y="40">ROOF</text>
        <text x="236" y="270">L02–L24 · HOMES</text>
        <text x="236" y="490">L01</text>
        <text x="236" y="514">G</text>
        <text x="266" y="552">B1–B2</text>
      </g>
      <text x="8" y="592" className="font-mono" fontSize="7.5" fill="#7E7A72">
        SECTION A–A · INDICATIVE
      </text>
    </svg>
  );
}

export default function Amenities() {
  const list = site.amenities;
  const [i, setI] = useState(0);
  const a = list[i];

  return (
    <section id="amenities" data-theme="light" aria-labelledby="am-title" className="bg-paper pb-[14vh] pt-[16vh]">
      <div className="wrap">
        <h2 id="am-title" className="h-xl">
          Everything
          <br />
          <span className="text-cobalt">in section.</span>
        </h2>
      </div>
      <div className="wrap mt-[8vh] grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24">
            <Section active={a.level} />
          </div>
        </div>
        <ul className="lg:col-span-4">
          {list.map((x, k) => (
            <li key={x.name} className="border-t border-graphite/15 first:border-t-0">
              <button
                type="button"
                onPointerEnter={() => setI(k)}
                onFocus={() => setI(k)}
                onClick={() => setI(k)}
                aria-pressed={k === i}
                className="grid w-full grid-cols-[4.2rem_1fr] gap-3 py-5 text-left"
              >
                <span className={`num pt-0.5 text-[1.6rem] leading-none transition-colors ${k === i ? "text-cobalt" : "text-graphite/40"}`}>{x.level}</span>
                <span>
                  <span className={`block text-[1.35rem] font-[350] tracking-[-0.02em] [font-stretch:110%] transition-colors ${k === i ? "text-graphite" : "text-graphite/60"}`}>{x.name}</span>
                  <span className="mt-1 block text-[0.95rem] leading-snug text-graphite/70">{x.body}</span>
                </span>
              </button>
              {/* mobile image */}
              <div className="relative mb-5 aspect-[16/10] overflow-hidden lg:hidden">
                <Image src={x.image.src} alt={x.image.alt} fill sizes="100vw" className="object-cover" />
              </div>
            </li>
          ))}
          <li className="data border-t border-graphite/15 pt-4 text-mid">Amenity specifications are placeholders.</li>
        </ul>
        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-24 aspect-[4/5] overflow-hidden bg-paper-2">
            <AnimatePresence initial={false}>
              <motion.div key={a.name} className="absolute inset-0" initial={{ clipPath: "inset(100% 0% 0% 0%)" }} animate={{ clipPath: "inset(0% 0% 0% 0%)" }} exit={{ opacity: 0.999 }} transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}>
                <Image src={a.image.src} alt={a.image.alt} fill sizes="40vw" className="object-cover" />
              </motion.div>
            </AnimatePresence>
            <p className="data absolute bottom-3 left-3 z-10 bg-paper px-2 py-1">
              {a.level} · {a.name}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
