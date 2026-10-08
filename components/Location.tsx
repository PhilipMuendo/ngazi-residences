"use client";

import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import { site } from "@/config/site";

/*
 * LOCATION as a time map, not a street map: everything that matters is placed
 * by direction and by minutes away. Rings are 10-minute drives.
 */

const R0 = 30; // keep the nearest places clear of the tower mark
const K = 6.2; // px per minute
const rad = (mins: number) => R0 + mins * K;
const CATS = ["All", "City", "Shopping", "Health", "Schools", "Nature", "Airports"] as const;

// place every dot by bearing and drive time, then nudge labels until none collide
const PLACES = (() => {
  const boxes: { x0: number; x1: number; y0: number; y1: number }[] = [{ x0: -16, x1: 16, y0: -16, y1: 34 }];
  const hit = (b: (typeof boxes)[number]) => boxes.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  return [...site.location.places]
    .sort((a, b) => a.mins - b.mins)
    .map((p) => {
      const a = (p.bearing * Math.PI) / 180;
      // rounded: trig output can differ in the last digit between server and browser
      const x = Math.round(Math.sin(a) * rad(p.mins) * 10) / 10;
      const y = Math.round(-Math.cos(a) * rad(p.mins) * 10) / 10;
      const right = x >= 0;
      const w = p.name.length * 6.1 + 6;
      const lx = x + (right ? 9 : -9);
      let ly = y;
      for (const dy of [0, 26, -26, 52, -52]) {
        const b = { x0: right ? lx : lx - w, x1: right ? lx + w : lx, y0: y + dy - 9, y1: y + dy + 18 };
        if (!hit(b)) {
          ly = y + dy;
          boxes.push(b);
          break;
        }
      }
      return { ...p, x, y, lx, ly, right };
    });
})();

export default function Location() {
  const ref = useRef<SVGSVGElement>(null);
  const on = useInView(ref, { once: true, amount: 0.3 });
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [hover, setHover] = useState<string | null>(null);
  const places = PLACES;
  const ink = "#2340E0";

  return (
    <section id="location" data-theme="dark" aria-labelledby="loc-title" className="bg-graphite pb-[14vh] pt-[16vh] text-paper">
      <div className="wrap grid grid-cols-1 gap-8 lg:grid-cols-12">
        <h2 id="loc-title" className="h-xl lg:col-span-7">
          Minutes,
          <br />
          <span className="text-[#8EA0FF]">not miles.</span>
        </h2>
        <p className="body max-w-[40ch] self-end text-paper/70 lg:col-span-4 lg:col-start-9">
          Riverside Drive sits between Westlands and the city, with Karura Forest to the north. Here is everything, placed by direction and by how long it takes to get there.
        </p>
      </div>

      <div className="wrap mt-[8vh] grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <div role="radiogroup" aria-label="Show" className="data flex flex-wrap gap-1">
            {CATS.map((c) => (
              <button key={c} role="radio" aria-checked={cat === c} onClick={() => setCat(c)} className={`border px-3 py-1.5 transition-colors ${cat === c ? "border-paper bg-paper text-graphite" : "border-paper/25 hover:border-paper/60"}`}>
                {c}
              </button>
            ))}
          </div>
          <svg ref={ref} viewBox="-300 -300 600 600" className="mt-6 h-auto w-full max-w-[44rem]" role="img" aria-label="Drive-time map centred on Ngazi with rings at 10, 20, 30 and 40 minutes">
            {[10, 20, 30, 40].map((m, i) => (
              <g key={m}>
                <motion.circle
                  r={rad(m)}
                  fill="none"
                  stroke="#E7E4DE"
                  strokeOpacity={0.22}
                  strokeDasharray={m === 40 ? "3 5" : undefined}
                  initial={{ pathLength: 0 }}
                  animate={on ? { pathLength: 1 } : undefined}
                  transition={{ duration: 1.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                />
                <text x={4} y={-rad(m) - 4} className="font-mono max-sm:text-[15px]" fontSize="9" fill="#E7E4DE" opacity="0.5">
                  {m} MIN
                </text>
              </g>
            ))}
            {/* compass */}
            {[
              ["N", 0, -290],
              ["E", 290, 4],
              ["S", 0, 298],
              ["W", -296, 4],
            ].map(([l, x, y]) => (
              <text key={l as string} x={x as number} y={y as number} textAnchor="middle" className="font-mono" fontSize="10" fill="#E7E4DE" opacity="0.45">
                {l}
              </text>
            ))}
            {places.map((p, i) => {
              const { x, y, lx, ly, right } = p;
              const live = cat === "All" || cat === p.cat;
              const hot = hover === p.name;
              return (
                <motion.g
                  key={p.name}
                  initial={{ opacity: 0 }}
                  animate={on ? { opacity: live ? 1 : 0.18 } : undefined}
                  transition={{ duration: 0.6, delay: on ? 0.6 + i * 0.05 : 0 }}
                  onPointerEnter={() => setHover(p.name)}
                  onPointerLeave={() => setHover(null)}
                >
                  <line x1={0} y1={0} x2={x} y2={y} stroke={hot ? "#8EA0FF" : "#E7E4DE"} strokeOpacity={hot ? 0.9 : 0.12} />
                  <circle cx={x} cy={y} r={hot ? 6 : 4} fill={hot || (live && cat !== "All") ? "#8EA0FF" : "#E7E4DE"} />
                  {ly !== y && <line className="max-sm:hidden" x1={x} y1={y} x2={lx - (right ? 3 : -3)} y2={ly} stroke="#E7E4DE" strokeOpacity="0.4" strokeWidth="0.6" />}
                  <circle cx={x} cy={y} r={14} fill="transparent" />
                  {/* phones: numbered markers keyed to the list, since labels this small can't be read */}
                  <g className="sm:hidden">
                    <circle cx={x} cy={y} r={12} fill={hot || (live && cat !== "All") ? "#8EA0FF" : "#E7E4DE"} />
                    <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#141516" className="font-mono">
                      {i + 1}
                    </text>
                  </g>
                  <text x={lx} y={ly + 3.5} textAnchor={right ? "start" : "end"} fontSize="11" fill="#E7E4DE" className="font-sans max-sm:hidden">
                    {p.name}
                  </text>
                  <text x={lx} y={ly + 15} textAnchor={right ? "start" : "end"} fontSize="8.5" fill="#E7E4DE" opacity="0.55" className="font-mono max-sm:hidden">
                    {p.mins} MIN
                  </text>
                </motion.g>
              );
            })}
            {/* the tower */}
            <rect x="-7" y="-7" width="14" height="14" fill={ink} />
            <rect x="-13" y="-13" width="26" height="26" fill="none" stroke={ink} strokeWidth="1" />
            <text y="30" textAnchor="middle" className="font-mono" fontSize="9" fill="#8EA0FF">
              NGAZI
            </text>
          </svg>
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          <ol className="border-t border-paper/15">
            {places.map((p, i) => {
              const live = cat === "All" || cat === p.cat;
              return (
                <li
                  key={p.name}
                  onPointerEnter={() => setHover(p.name)}
                  onPointerLeave={() => setHover(null)}
                  className={`flex items-baseline justify-between gap-4 border-b border-paper/10 py-3 transition-opacity ${live ? "opacity-100" : "opacity-30"} ${hover === p.name ? "text-[#8EA0FF]" : ""}`}
                >
                  <span className="flex items-baseline gap-3 text-[1rem]">
                    <span className="num w-5 text-[0.95rem] text-paper/45 sm:hidden">{i + 1}</span>
                    {p.name}
                  </span>
                  <span className="flex items-baseline gap-3">
                    <span className="data text-paper/45">{p.cat}</span>
                    <span className="num w-14 text-right text-[1.6rem] leading-none">{p.mins}′</span>
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="data mt-4 text-paper/45">Typical off-peak drive times, approximate. Placeholder data.</p>
        </div>
      </div>
    </section>
  );
}
