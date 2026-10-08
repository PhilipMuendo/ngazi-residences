"use client";

import type { ReactNode } from "react";
import { site, TOWER, UNITS, PRICING } from "@/config/site";
import { useScrollTo } from "@/lib/smooth-scroll";
import { LEVELS } from "./ElevatorNav";

/*
 * The footer is the drawing's title block: the box in the corner of every
 * architectural sheet that says what this is, who made it and how to reach them.
 */

function Cell({ k, children, className = "" }: { k: string; children: ReactNode; className?: string }) {
  return (
    <div className={`border-b border-r border-paper/20 p-4 sm:p-5 ${className}`}>
      <p className="data text-paper/45">{k}</p>
      <div className="mt-2 text-[0.98rem] leading-relaxed">{children}</div>
    </div>
  );
}

export default function Footer() {
  const scrollTo = useScrollTo();
  return (
    <footer data-theme="dark" className="bg-graphite pb-10 pt-[10vh] text-paper">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-8 pb-10 sm:flex-row sm:items-end">
          <p className="max-w-[22ch] text-[clamp(1.6rem,3vw,2.6rem)] font-[280] leading-[1.05] tracking-[-0.03em] [font-stretch:115%]">
            {UNITS.filter((u) => u.status === "available").length} homes are still available on {TOWER.levels} levels.
          </p>
          <button type="button" onClick={() => scrollTo(0)} className="group flex items-center gap-4 self-start sm:self-auto">
            <span className="data text-paper/60 group-hover:text-paper">Back to the lobby</span>
            <span aria-hidden="true" className="grid h-12 w-12 place-items-center border border-paper/40 transition-colors group-hover:border-paper group-hover:bg-paper group-hover:text-graphite">
              ▲
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 border-l border-t border-paper/20 sm:grid-cols-2 lg:grid-cols-12">
          <div className="flex flex-col justify-between border-b border-r border-paper/20 p-5 sm:col-span-2 lg:col-span-4 lg:row-span-2">
            <p className="text-[clamp(3.2rem,4.6vw,5rem)] font-[600] leading-[0.8] tracking-[0.06em] [font-stretch:125%]">{site.wordmark}</p>
            <p className="mt-6 text-[1rem] text-paper/70">{site.tagline}</p>
          </div>
          <Cell k="Project" className="lg:col-span-3">
            {TOWER.levels} levels · {UNITS.length} homes
            <br />
            Completion {PRICING.completionLabel}*
          </Cell>
          <Cell k="Developer" className="lg:col-span-3">
            {site.contact.developer}*
          </Cell>
          <Cell k="Sheet" className="lg:col-span-2">
            A-000 · Index
          </Cell>
          <Cell k="Sales suite" className="lg:col-span-3">
            {site.contact.salesSuite}
            <br />
            <span className="text-paper/60">{site.contact.hours}</span>
          </Cell>
          <Cell k="Contact" className="lg:col-span-3">
            <a href={site.contact.phoneHref} className="hover:text-[#8EA0FF]">
              {site.contact.phone}
            </a>
            <br />
            <a href={`mailto:${site.contact.email}`} className="hover:text-[#8EA0FF]">
              {site.contact.email}
            </a>
          </Cell>
          <Cell k="Follow" className="lg:col-span-2">
            <ul>
              {site.social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-[#8EA0FF]">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </Cell>
          <nav aria-label="Footer" className="border-b border-r border-paper/20 p-4 sm:col-span-2 sm:p-5 lg:col-span-12">
            <p className="data text-paper/45">Levels</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-9">
              {LEVELS.map((l) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo(l.id === "top" ? 0 : `#${l.id}`);
                    }}
                    className="group flex items-baseline gap-2.5"
                  >
                    <span className="num text-[1.1rem] text-paper/45 group-hover:text-[#8EA0FF]">{l.code}</span>
                    <span className="text-[0.95rem] group-hover:underline">{l.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="data mt-6 flex flex-col justify-between gap-3 leading-relaxed text-paper/45 lg:flex-row">
          <p>© 2026 {site.contact.developer} · Placeholder brand, prices, availability and contact details.</p>
          <p>Images are illustrative, not of the building · Credits in IMAGES.md</p>
        </div>
      </div>
    </footer>
  );
}
