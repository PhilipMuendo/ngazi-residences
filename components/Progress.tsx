"use client";

import Image from "next/image";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { site, TOWER } from "@/config/site";

/*
 * PROGRESS & TRUST. Off-plan buyers are buying a promise, so show where the
 * build is (drawn, dated, photographed) and how their money is protected.
 */

const ROWS = TOWER.levels + 3; // B2, B1, G + L1–L24 (L1 counted with podium)

function TowerProgress({ percent }: { percent: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const on = useInView(ref, { once: true, amount: 0.4 });
  const W = 160, H = 440, x0 = 30, w = 100, rh = (H - 40) / ROWS, ground = H - 20 - rh * 2;
  const done = Math.max(1, Math.round((percent / 100) * ROWS));
  const rowY = (i: number) => H - 20 - (i + 1) * rh; // i = 0 is B2
  const topY = rowY(done - 1);
  return (
    <svg ref={ref} viewBox={`0 0 ${W + 50} ${H}`} className="h-auto w-full max-w-[17rem]" role="img" aria-label={`Construction progress: ${percent}% complete`}>
      {Array.from({ length: ROWS }).map((_, i) => {
        const filled = i < done - 1;
        const current = i === done - 1;
        return (
          <motion.rect
            key={i}
            x={x0}
            y={rowY(i) + 1}
            width={w}
            height={rh - 2}
            fill={filled ? "#2340E0" : current ? "#2340E0" : "none"}
            stroke="#E7E4DE"
            strokeOpacity={filled || current ? 0 : 0.3}
            strokeWidth="0.7"
            initial={{ opacity: filled || current ? 0 : 1 }}
            animate={on ? { opacity: current ? [0.35, 1, 0.35] : 1 } : undefined}
            transition={current ? { duration: 2.2, repeat: Infinity, delay: done * 0.06 } : { duration: 0.3, delay: i * 0.06 }}
          />
        );
      })}
      <line x1="0" x2={W + 50} y1={ground} y2={ground} stroke="#E7E4DE" strokeWidth="1.4" />
      {/* tower crane, standing just above the working level */}
      <g stroke="#E7E4DE" strokeWidth="1" fill="none">
        <line x1={x0 + w + 16} x2={x0 + w + 16} y1={ground} y2={topY - 36} />
        <line x1={x0 + w + 22} x2={x0 + w + 22} y1={ground} y2={topY - 36} />
        {Array.from({ length: Math.floor((ground - topY + 36) / 10) }).map((_, i) => (
          <line key={i} x1={x0 + w + 16} x2={x0 + w + 22} y1={ground - i * 10} y2={ground - i * 10 - 10} strokeOpacity="0.6" />
        ))}
        <line x1={x0 - 10} x2={x0 + w + 46} y1={topY - 36} y2={topY - 36} />
        <line x1={x0 + w + 19} x2={x0 + w + 19} y1={topY - 36} y2={topY - 50} />
        <line x1={x0 - 10} x2={x0 + w + 19} y1={topY - 36} y2={topY - 50} strokeOpacity="0.6" />
        <line x1={x0 + 30} x2={x0 + 30} y1={topY - 36} y2={topY - 14} strokeOpacity="0.8" />
      </g>
      <rect x={x0 + w + 36} y={topY - 36} width="10" height="8" fill="#E7E4DE" />
      <text x={x0 + w + 28} y={ground - 4} className="font-mono" fontSize="8" fill="#E7E4DE" opacity="0.5">
        STREET
      </text>
      <text x={x0 + w + 28} y={ground + 14} className="font-mono" fontSize="8" fill="#E7E4DE" opacity="0.5">
        B1–B2
      </text>
      <text x={x0 + w + 54} y={topY - 24} className="font-mono" fontSize="8" fill="#8EA0FF">
        NOW
      </text>
    </svg>
  );
}

export default function Progress() {
  const p = site.progress;
  return (
    <section id="progress" data-theme="dark" aria-labelledby="pg-title" className="bg-graphite pb-[14vh] pt-[16vh] text-paper">
      <div className="wrap flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <h2 id="pg-title" className="h-xl">
          Rising,
          <br />
          <span className="text-[#8EA0FF]">on schedule.</span>
        </h2>
        <p className="flex items-baseline gap-4">
          <span className="num text-[clamp(4.5rem,10vw,10rem)] leading-[0.82]">{p.percent}%</span>
          <span className="data leading-relaxed text-paper/60">
            Structure complete
            <br />
            Updated {p.updated}*
          </span>
        </p>
      </div>

      <div className="wrap mt-[8vh] grid grid-cols-1 gap-12 md:grid-cols-12 lg:gap-8">
        <div className="flex justify-center md:col-span-4 lg:col-span-3 lg:justify-start">
          <TowerProgress percent={p.percent} />
        </div>
        <ol className="md:col-span-8 lg:col-span-4">
          {p.milestones.map((m) => (
            <li key={m.label} className="grid grid-cols-[1rem_5.5rem_1fr] items-baseline gap-3 border-b border-paper/10 py-3.5">
              <span aria-hidden="true" className={`block h-2.5 w-2.5 translate-y-[-1px] ${m.state === "done" ? "bg-paper" : m.state === "current" ? "animate-pulse bg-[#8EA0FF]" : "border border-paper/40"}`} />
              <span className="data text-paper/55">{m.date}</span>
              <span className={`text-[1.05rem] ${m.state === "next" ? "text-paper/55" : ""}`}>
                {m.label}
                <span className="sr-only">{m.state === "done" ? " (complete)" : m.state === "current" ? " (in progress)" : " (upcoming)"}</span>
                {m.state === "current" && <span className="data ml-3 text-[#8EA0FF]">Now</span>}
              </span>
            </li>
          ))}
        </ol>
        <figure className="md:col-span-12 lg:col-span-5">
          <div className="relative aspect-[4/3] overflow-hidden lg:aspect-[4/5]">
            <Image src={p.image.src} alt={p.image.alt} fill sizes="(min-width:1024px) 36vw, 100vw" className="object-cover" placeholder="blur" />
          </div>
          <figcaption className="data mt-3 flex justify-between gap-4 text-paper/50">
            <span>Site, {p.updated}</span>
            <span>*Placeholder photograph &amp; progress</span>
          </figcaption>
        </figure>
      </div>

      <div className="wrap mt-[14vh]">
        <h3 className="h-lg max-w-[16ch]">Bought properly, from the first shilling.</h3>
        <div className="mt-10 grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {site.trust.map((t) => (
            <div key={t.title} className="border-t border-paper/25 py-6">
              <p className="text-[1.2rem] font-[450] [font-stretch:108%]">{t.title}</p>
              <p className="mt-2 text-[0.98rem] leading-relaxed text-paper/65">{t.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
