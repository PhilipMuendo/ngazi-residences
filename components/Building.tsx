"use client";

import { motion, useInView, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { TOWER, UNITS, PRICING } from "@/config/site";
import { FIN_COUNT, finsForLevel, levelY, ROOF_Y } from "@/lib/towerGeometry";
import finShadows from "@/assets/images/fin-shadows.jpg";

/*
 * ARCHITECTURE. The north elevation is drawn from the same fin geometry as
 * the 3D model: each fin's projected width depends on how far it's turned,
 * so the ripple you see on paper is the ripple on the building.
 */

const S = 6.4; // px per metre in the drawing
const GROUND = 700;
const CX = 230;
// round drawn coordinates so server and client render identical attributes
const r2 = (n: number) => Math.round(n * 100) / 100;

function Elevation() {
  const ref = useRef<SVGSVGElement>(null);
  const on = useInView(ref, { once: true, amount: 0.25 });
  const W = (TOWER.plate.w + 1.2) * S;
  const top = GROUND - ROOF_Y * S;
  const ink = "#2340E0";

  // north-face fins only (z < 0 side), projected onto x
  const finRects: { x: number; y: number; w: number; h: number; level: number }[] = [];
  for (let level = 2; level <= TOWER.levels; level++) {
    finsForLevel(level)
      .filter((f) => f.z < -TOWER.plate.d / 2)
      .forEach((f) => {
        const rot = f.rotY; // around 0 for the north face
        const proj = 0.95 * Math.abs(Math.sin(rot)) + 0.16 * Math.abs(Math.cos(rot));
        finRects.push({ x: CX + f.x * S - (proj * S) / 2, y: GROUND - (levelY(level) + TOWER.floorHeight) * S, w: proj * S, h: TOWER.floorHeight * S - 1, level });
      });
  }

  return (
    <svg ref={ref} viewBox="0 0 460 760" className="h-auto w-full" role="img" aria-label={`North elevation of the tower, ${ROOF_Y} metres tall, showing the rippling fins`}>
      {/* Ngong Hills on the horizon behind */}
      <motion.path
        d="M0,640 C60,610 90,600 130,612 C170,624 190,580 230,586 C270,592 300,560 340,574 C380,588 410,600 460,596"
        fill="none"
        stroke={ink}
        strokeOpacity="0.35"
        strokeWidth="1"
        initial={{ pathLength: 0 }}
        animate={on ? { pathLength: 1 } : undefined}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <text x="8" y="600" className="font-mono" fontSize="8" fill={ink} opacity="0.6">
        NGONG HILLS · ≈ 25 KM
      </text>

      {/* ground */}
      <line x1="0" y1={GROUND} x2="460" y2={GROUND} stroke="#141516" strokeWidth="1.2" />
      {Array.from({ length: 46 }).map((_, i) => (
        <line key={i} x1={i * 10} y1={GROUND} x2={i * 10 - 6} y2={GROUND + 6} stroke="#141516" strokeWidth="0.6" />
      ))}

      {/* body + slabs */}
      <motion.rect
        x={CX - W / 2}
        y={top}
        width={W}
        height={GROUND - top}
        fill="none"
        stroke="#141516"
        strokeWidth="1"
        initial={{ pathLength: 0 }}
        animate={on ? { pathLength: 1 } : undefined}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      />
      {Array.from({ length: TOWER.levels + 1 }).map((_, i) => {
        const y = GROUND - levelY(i + 1) * S;
        return (
          <motion.line
            key={i}
            x1={CX - W / 2}
            x2={CX + W / 2}
            y1={y}
            y2={y}
            stroke="#141516"
            strokeWidth="1.4"
            initial={{ pathLength: 0 }}
            animate={on ? { pathLength: 1 } : undefined}
            transition={{ duration: 0.9, delay: 0.3 + i * 0.03, ease: [0.16, 1, 0.3, 1] }}
          />
        );
      })}
      {/* fins */}
      <motion.g initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : undefined} transition={{ duration: 1.4, delay: 0.8 }}>
        {finRects.map((f, i) => (
          <rect key={i} x={r2(f.x)} y={r2(f.y)} width={r2(Math.max(0.6, f.w))} height={r2(f.h)} fill="#141516" opacity={r2(0.18 + (f.w / (0.95 * S)) * 0.6)} />
        ))}
      </motion.g>
      {/* lobby */}
      <rect x={CX - W / 2 + 13} y={GROUND - TOWER.groundHeight * S + 4} width={W - 26} height={TOWER.groundHeight * S - 4} fill="none" stroke="#141516" strokeWidth="0.6" strokeDasharray="3 2" />

      {/* dimension chain */}
      <g className="font-mono" fontSize="7.5" fill={ink}>
        <line x1={CX + W / 2 + 26} y1={top} x2={CX + W / 2 + 26} y2={GROUND} stroke={ink} strokeWidth="0.8" />
        {Array.from({ length: TOWER.levels + 1 }).map((_, i) => {
          const y = GROUND - levelY(i + 1) * S;
          const major = (i + 1) % 4 === 0 || i === 0;
          return (
            <g key={i}>
              <line x1={CX + W / 2 + (major ? 20 : 23)} x2={CX + W / 2 + 32} y1={y} y2={y} stroke={ink} strokeWidth="0.6" />
              {major && (
                <text x={CX + W / 2 + 36} y={y + 2.5}>
                  L{String(i + 1).padStart(2, "0")} +{levelY(i + 1).toFixed(1)}
                </text>
              )}
            </g>
          );
        })}
        <text x={CX + W / 2 + 36} y={top + 2.5}>
          ROOF +{ROOF_Y.toFixed(1)}
        </text>
        <text x={CX + W / 2 + 36} y={GROUND + 2.5}>
          ±0.00
        </text>
      </g>

      {/* sun study annotation */}
      <g stroke={ink} strokeWidth="0.8" fill="none">
        <path d={`M ${CX - W / 2 - 70} ${top - 30} L ${CX - W / 2 + 4} ${GROUND - 60 * S}`} strokeDasharray="4 3" />
        <path d={`M 4 ${GROUND - 46 * S} L ${CX - W / 2 + 4} ${GROUND - 40 * S}`} strokeDasharray="4 3" />
      </g>
      <g className="font-mono" fontSize="7.5" fill={ink}>
        <text x="6" y={top - 34}>NOON SUN · SHADED</text>
        <text x="6" y={GROUND - 46 * S - 8}>DUSK SUN · OPEN VIEW</text>
      </g>

      {/* title block */}
      <g transform="translate(6 716)" className="font-mono" fontSize="7" fill="#141516">
        <rect width="448" height="38" fill="none" stroke="#141516" strokeWidth="0.8" />
        <line x1="300" y1="0" x2="300" y2="38" stroke="#141516" strokeWidth="0.6" />
        <text x="8" y="15">NORTH ELEVATION · {FIN_COUNT.toLocaleString()} FINS · DRAWN FROM THE MODEL</text>
        <text x="8" y="29" opacity="0.6">NGAZI · RIVERSIDE DRIVE · NAIROBI</text>
        <text x="308" y="15">SHEET A-201</text>
        <text x="308" y="29" opacity="0.6">SCALE 1:500 @ A1</text>
      </g>
    </svg>
  );
}

export default function Building() {
  const photoRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: photoRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  const facts = [
    { v: String(TOWER.levels), l: "Levels" },
    { v: String(UNITS.length), l: "Homes" },
    { v: `${ROOF_Y}`, l: "Metres tall" },
    { v: PRICING.completionLabel.split(" ")[0], l: `Completion ${PRICING.completionLabel.split(" ")[1]}*` },
  ];

  return (
    <section id="building" data-theme="light" aria-labelledby="building-title" className="sheet relative pb-[14vh] pt-[16vh]">
      <div className="wrap grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <h2 id="building-title" className="h-xl">
            A tower
            <br />
            shaped by
            <br />
            <span className="text-cobalt">the sun.</span>
          </h2>
          <p className="body mt-10 max-w-[44ch] text-graphite/80">
            Each of the {FIN_COUNT.toLocaleString()} fins on the facade is turned a few degrees more than the one beside it and the one below. Together they shade every home from the high noon sun and open up to the view when the light goes low and gold over the Ngong Hills. Nothing on the outside is decoration.
          </p>
          <dl className="mt-14 grid grid-cols-2 gap-y-10 border-t border-graphite/15 pt-8 sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.l} className="flex flex-col">
                <dd className="num text-[clamp(3.4rem,6vw,5.6rem)] leading-[0.85]">{f.v}</dd>
                <dt className="data mt-2 text-mid">{f.l}</dt>
              </div>
            ))}
          </dl>
          <p className="data mt-6 text-mid">* Target completion, placeholder</p>

          <div ref={photoRef} className="relative mt-16 aspect-[16/10] overflow-hidden">
            <motion.div className="absolute inset-[-12%_0]" style={{ y }}>
              <Image src={finShadows} alt="Deep shadows cast by concrete fins" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" placeholder="blur" />
            </motion.div>
            <p className="data absolute bottom-3 left-3 bg-paper px-2 py-1">Fin shadow study · 12:30</p>
          </div>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <div className="lg:sticky lg:top-24">
            <Elevation />
          </div>
        </div>
      </div>
    </section>
  );
}
