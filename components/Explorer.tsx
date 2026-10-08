"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { site, UNITS, TOWER, PRICING, unitByCode, formatKES, formatKESFull, formatUSD, type Unit } from "@/config/site";
import { levelY } from "@/lib/towerGeometry";
import { useSelection } from "@/lib/selection";
import { useScrollTo } from "@/lib/smooth-scroll";
import { useFinePointer } from "@/lib/useMedia";
import FloorPlan from "./FloorPlan";
import Elevation from "./ui/TowerPlaceholder";

const Tower3D = dynamic(() => import("./Tower3D"), { ssr: false, loading: () => <Elevation /> });

/*
 * FIND YOUR HOME. The sales tool, not a brochure.
 * Left: the live model, the drawn plan, or the view from that floor.
 * Right: filters, the full stacking plan (every home, every level, its
 * status), and the spec sheet for the home you picked. Pick anywhere, in 3D or
 * in the stack, and everything else follows.
 */

const STATUS_LABEL = { available: "Available", reserved: "Reserved", sold: "Sold" } as const;
const BEDS = ["Any", "1", "2", "3", "4"] as const;
type Tab = "model" | "plan" | "view";

function Cell({ u, on, hot, dim, onPick, onHover }: { u: Unit; on: boolean; hot: boolean; dim: boolean; onPick: () => void; onHover: (v: boolean) => void }) {
  const fill = u.status === "available" ? "bg-cobalt/85" : u.status === "reserved" ? "bg-stone" : "bg-graphite/80";
  return (
    <button
      type="button"
      onClick={onPick}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      aria-pressed={on}
      aria-label={`Home ${u.code}, ${u.type.name}, ${u.type.area} square metres, ${STATUS_LABEL[u.status]}`}
      className={`relative h-full transition-[opacity,transform] duration-200 ${fill} ${dim ? "opacity-15" : "opacity-100"} ${on ? "z-10 scale-y-[1.35] outline outline-2 outline-offset-1 outline-graphite" : hot ? "brightness-125" : ""}`}
    >
      {u.status === "reserved" && <span className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent_0_3px,rgba(20,21,22,0.25)_3px_4px)]" />}
    </button>
  );
}

export default function Explorer() {
  const { code, setCode, currency } = useSelection();
  const scrollTo = useScrollTo();
  const fine = useFinePointer();
  const [tab, setTab] = useState<Tab>("model");
  const [beds, setBeds] = useState<(typeof BEDS)[number]>("Any");
  const maxAll = Math.max(...UNITS.map((u) => u.price));
  const [maxPrice, setMaxPrice] = useState(maxAll);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [hoverCode, setHoverCode] = useState<string | null>(null);
  const [hoverLevel, setHoverLevel] = useState<number | null>(null);
  const [sunOn, setSunOn] = useState(false);
  const [hour, setHour] = useState(15);
  const [nudge, setNudge] = useState(0);
  const [dusk, setDusk] = useState(false);

  const unit = unitByCode(code) ?? UNITS[0];
  const shownCode = hoverCode ?? code;
  const shown = unitByCode(shownCode) ?? unit;
  const price = (n: number) => (currency === "KES" ? formatKES(n) : formatUSD(n));

  const matches = useCallback(
    (u: Unit) => (beds === "Any" || u.type.beds === Number(beds)) && u.price <= maxPrice && (!availableOnly || u.status === "available"),
    [beds, maxPrice, availableOnly],
  );
  const count = UNITS.filter((u) => matches(u) && u.status === "available").length;
  const levels = useMemo(() => Array.from({ length: TOWER.levels - 1 }, (_, i) => TOWER.levels - i), []);

  const pick = (c: string) => {
    setCode(c);
  };

  const viewImage = dusk ? site.views.dusk : unit.level <= 8 ? site.views.low : unit.level <= 16 ? site.views.mid : site.views.high;

  return (
    <section id="homes" data-theme="light" aria-labelledby="homes-title" className="relative bg-paper pb-[12vh] pt-[14vh]">
      <div className="wrap flex flex-col gap-6 pb-10 lg:flex-row lg:items-end lg:justify-between">
        <h2 id="homes-title" className="h-xl">
          Find your <span className="text-cobalt">home.</span>
        </h2>
        <p className="body max-w-[40ch] text-graphite/75 lg:text-right">
          Every home in the tower, live. Turn the model, pick a level, open the plan, check the view and what it costs.
          {site.placeholders && <span className="data mt-2 block text-mid">Prices and availability shown are placeholders.</span>}
        </p>
      </div>

      <div className="wrap grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        {/* ── the pane ── */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-20">
            <div role="tablist" aria-label="View" className="flex border-b border-graphite/15">
              {(
                [
                  ["model", "3D model"],
                  ["plan", `Plan · ${unit.code}`],
                  ["view", `View from L${String(unit.level).padStart(2, "0")}`],
                ] as [Tab, string][]
              ).map(([t, label]) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  aria-controls={`pane-${t}`}
                  onClick={() => setTab(t)}
                  className={`data relative px-4 py-3 transition-colors ${tab === t ? "text-graphite" : "text-mid hover:text-graphite"}`}
                >
                  {label}
                  {tab === t && <motion.span layoutId="tab-line" className="absolute inset-x-0 -bottom-px h-[2px] bg-cobalt" />}
                </button>
              ))}
            </div>

            <div className="relative mt-3 h-[52svh] overflow-hidden bg-paper-2 lg:h-[calc(100svh-11rem)]">
              {/* model stays mounted so it never rebuilds */}
              <div id="pane-model" role="tabpanel" aria-label="3D model" hidden={tab !== "model"} className="absolute inset-0">
                <Tower3D
                  mode="day"
                  interactive
                  showStatus
                  matches={matches}
                  selectedCode={code}
                  hoverLevel={hoverLevel}
                  sunHour={sunOn ? hour : null}
                  rotateNudge={nudge}
                  onHoverUnit={setHoverCode}
                  onSelectUnit={pick}
                  className="absolute inset-0"
                  fallback={<Elevation />}
                />
                {/* hover tag */}
                <AnimatePresence>
                  {hoverCode && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="data pointer-events-none absolute left-4 top-4 bg-graphite px-3 py-2 text-paper">
                      {shown.code} · {shown.type.name} · {shown.type.area} m² · {STATUS_LABEL[shown.status]}
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* toolbar */}
                <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="data flex items-center gap-3 bg-paper/90 px-3 py-2 backdrop-blur">
                    <span className="flex items-center gap-1.5">
                      <i className="h-2.5 w-2.5 bg-cobalt/85" /> Available
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className="h-2.5 w-2.5 bg-stone" /> Reserved
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className="h-2.5 w-2.5 bg-graphite/80" /> Sold
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="data flex items-center gap-2 bg-paper/90 px-3 py-1.5 backdrop-blur">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input type="checkbox" checked={sunOn} onChange={(e) => setSunOn(e.target.checked)} className="accent-[#2340E0]" />
                        Sun study
                      </label>
                      {sunOn && (
                        <>
                          <input type="range" min={6.25} max={18.5} step={0.25} value={hour} onChange={(e) => setHour(Number(e.target.value))} className="draft w-28 text-graphite" aria-label="Time of day" />
                          <span className="w-10 tabular-nums">
                            {String(Math.floor(hour)).padStart(2, "0")}:{String(Math.round((hour % 1) * 60)).padStart(2, "0")}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex bg-paper/90 backdrop-blur">
                      <button type="button" aria-label="Rotate left" onClick={() => setNudge((n) => n - 1)} className="grid h-9 w-9 place-items-center hover:bg-graphite/10">
                        ⟲
                      </button>
                      <button type="button" aria-label="Rotate right" onClick={() => setNudge((n) => n + 1)} className="grid h-9 w-9 place-items-center hover:bg-graphite/10">
                        ⟳
                      </button>
                    </div>
                  </div>
                </div>
                {fine && <p className="data pointer-events-none absolute right-4 top-4 text-mid">Drag to turn · scroll to zoom · click a home</p>}
              </div>

              {/* plan */}
              {tab === "plan" && (
                <div id="pane-plan" role="tabpanel" aria-label={`Floor plan of home ${unit.code}`} className="sheet absolute inset-0 flex items-center justify-center p-6">
                  <FloorPlan plan={unit.type.plan} animateKey={unit.code} className="h-full max-h-full w-full" />
                  <div className="data absolute left-4 top-4 bg-paper px-3 py-2">
                    Type {unit.type.id} · {unit.type.name} · {unit.type.area} m² + {unit.type.outdoor} m² outdoor
                  </div>
                  <p className="data absolute bottom-3 right-4 text-mid">Indicative plan, not to scale for contract</p>
                </div>
              )}

              {/* view */}
              {tab === "view" && (
                <div id="pane-view" role="tabpanel" aria-label={`Indicative view from level ${unit.level}`} className="absolute inset-0">
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={`${viewImage.src}-${dusk}`}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 + (unit.level % 8) * 0.012 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Image src={viewImage} alt={`Indicative view over Nairobi from level ${unit.level}`} fill sizes="60vw" className="object-cover" style={{ objectPosition: `50% ${Math.max(20, 80 - unit.level * 2.5)}%` }} />
                    </motion.div>
                  </AnimatePresence>
                  {/* altitude gauge */}
                  <div className="absolute bottom-6 right-6 top-6 flex w-14 flex-col items-center text-paper">
                    <span className="data">+{(levelY(unit.level) + 1.6).toFixed(0)} m</span>
                    <div className="relative mt-2 w-px flex-1 bg-paper/50">
                      <span className="absolute left-1/2 h-3 w-3 -translate-x-1/2 bg-cobalt" style={{ bottom: `${((unit.level - 1) / (TOWER.levels - 1)) * 100}%` }} />
                    </div>
                    <span className="data mt-2">G</span>
                  </div>
                  <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                    <p className="data bg-graphite/80 px-3 py-2 text-paper">
                      L{String(unit.level).padStart(2, "0")} · facing {unit.type.aspect.toLowerCase()} · {unit.type.view}
                    </p>
                    <div className="data flex w-fit bg-paper">
                      {[
                        ["Day", false],
                        ["Dusk", true],
                      ].map(([l, v]) => (
                        <button key={String(l)} type="button" aria-pressed={dusk === v} onClick={() => setDusk(v as boolean)} className={`px-3 py-1.5 ${dusk === v ? "bg-graphite text-paper" : ""}`}>
                          {l as string}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="data absolute left-4 top-4 bg-paper/90 px-2 py-1 text-mid">Illustrative photograph, not taken from the site</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── controls ── */}
        <div className="lg:col-span-5">
          {/* filters */}
          <div className="grid grid-cols-1 gap-5 border-b border-graphite/15 pb-6 sm:grid-cols-2">
            <div>
              <p className="data text-mid">Bedrooms</p>
              <div role="radiogroup" aria-label="Bedrooms" className="mt-2 flex border border-graphite/20">
                {BEDS.map((b) => (
                  <button key={b} role="radio" aria-checked={beds === b} onClick={() => setBeds(b)} className={`flex-1 py-2 text-[0.9rem] transition-colors ${beds === b ? "bg-graphite text-paper" : "hover:bg-graphite/5"}`}>
                    {b === "4" ? "PH" : b}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="budget" className="data flex justify-between text-mid">
                <span>Budget up to</span>
                <span className="text-graphite">{price(maxPrice)}</span>
              </label>
              <input id="budget" type="range" min={10_000_000} max={maxAll} step={500_000} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="draft mt-2 text-graphite" />
            </div>
            <label className="data flex cursor-pointer items-center gap-2 sm:col-span-2">
              <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} className="accent-[#2340E0]" />
              Available homes only <span className="ml-auto text-graphite">{count} match</span>
            </label>
          </div>

          {/* stacking plan */}
          <div className="mt-6" role="group" aria-label="Stacking plan: every home by level">
            <div className="data mb-2 grid grid-cols-[2.6rem_1fr] gap-3 text-mid">
              <span>Level</span>
              <span className="grid grid-cols-4 text-center">
                <span>A · NE</span>
                <span>B · NW</span>
                <span>C · SW</span>
                <span>D · SE</span>
              </span>
            </div>
            <ol className="flex flex-col gap-[3px]">
              {levels.map((level) => {
                const row = UNITS.filter((u) => u.level === level);
                const ph = level >= TOWER.penthouseFrom;
                return (
                  <li
                    key={level}
                    className={`grid h-[17px] grid-cols-[2.6rem_1fr] items-stretch gap-3 transition-colors ${hoverLevel === level || unit.level === level ? "text-cobalt" : ""}`}
                    onPointerEnter={() => setHoverLevel(level)}
                    onPointerLeave={() => setHoverLevel(null)}
                  >
                    <span className="num flex items-center text-[0.95rem] leading-none">L{String(level).padStart(2, "0")}</span>
                    <span className={`grid gap-[3px] ${ph ? "grid-cols-2" : "grid-cols-4"}`}>
                      {[...row]
                        .sort((a, b) => a.slot - b.slot)
                        .map((u) => (
                          <Cell key={u.code} u={u} on={u.code === code} hot={u.code === hoverCode} dim={!matches(u)} onPick={() => pick(u.code)} onHover={(v) => setHoverCode(v ? u.code : null)} />
                        ))}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="data mt-3 text-mid">L01 residents&apos; amenities · G lobby · Roof pool &amp; sky lounge</p>
          </div>

          {/* the spec sheet */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={unit.code} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="mt-8 border-t-2 border-graphite pt-5" aria-live="polite">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="data text-mid">Home</p>
                  <p className="num text-[5.2rem] leading-[0.8]">{unit.code}</p>
                </div>
                <div className="text-right">
                  <p className="data text-mid">{STATUS_LABEL[unit.status]}</p>
                  <p className="mt-1 text-[1.8rem] font-[350] leading-none tracking-[-0.02em] [font-stretch:110%]">{price(unit.price)}</p>
                  <p className="data mt-1 text-mid">{currency === "KES" ? formatUSD(unit.price) : formatKESFull(unit.price)}</p>
                </div>
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                {[
                  ["Type", unit.type.name],
                  ["Internal", `${unit.type.area} m²`],
                  ["Outdoor", `${unit.type.outdoor} m²`],
                  ["Baths", String(unit.type.baths)],
                  ["Aspect", unit.type.aspect],
                  ["View", unit.type.view],
                ].map(([k, v]) => (
                  <div key={k} className="border-t border-graphite/15 pt-2">
                    <dt className="data text-mid">{k}</dt>
                    <dd className="mt-1 text-[0.95rem]">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button type="button" onClick={() => setTab("plan")} className="border border-graphite/25 py-3 text-[0.85rem] hover:border-graphite">
                  Floor plan
                </button>
                <button type="button" onClick={() => setTab("view")} className="border border-graphite/25 py-3 text-[0.85rem] hover:border-graphite">
                  The view
                </button>
                <button type="button" onClick={() => scrollTo("#pricing")} className="border border-graphite/25 py-3 text-[0.85rem] hover:border-graphite">
                  Payment plan
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo("#visit")}
                  disabled={unit.status === "sold"}
                  className="bg-cobalt py-3 text-[0.85rem] text-white transition-colors hover:bg-graphite disabled:bg-graphite/20 disabled:text-graphite/50"
                >
                  {unit.status === "sold" ? "Sold" : "Enquire"}
                </button>
              </div>
              <p className="data mt-4 text-mid">From {(unit.price / unit.type.area / 1000).toFixed(0)}k per m² · {PRICING.completionLabel} completion</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
