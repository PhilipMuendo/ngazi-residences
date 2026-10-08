"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { useLenis, useScrollTo } from "@/lib/smooth-scroll";
import { useSelection } from "@/lib/selection";

/**
 * The building's navigation is its lift. Sections are levels; a display shows
 * where you are and which way you're travelling; buttons take you there.
 * Desktop: a rail on the left. Mobile: a top bar and a full-screen keypad.
 */

export const LEVELS = [
  { id: "top", code: "G", label: "Lobby" },
  { id: "building", code: "1", label: "Architecture" },
  { id: "homes", code: "2", label: "Find your home" },
  { id: "interiors", code: "3", label: "Interiors" },
  { id: "amenities", code: "4", label: "Amenities" },
  { id: "location", code: "5", label: "Location" },
  { id: "pricing", code: "6", label: "Payment plan" },
  { id: "progress", code: "7", label: "Progress & trust" },
  { id: "visit", code: "8", label: "Book a viewing" },
];

export default function ElevatorNav() {
  const scrollTo = useScrollTo();
  const lenis = useLenis();
  const { currency, setCurrency } = useSelection();
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [tone, setTone] = useState("dark");
  const dark = tone !== "light";
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const { scrollY } = useScroll();
  const last = useRef(0);

  useMotionValueEvent(scrollY, "change", (v) => {
    if (Math.abs(v - last.current) > 4) {
      const d = v > last.current ? 1 : -1;
      setDir(d);
      // past the lobby the bar steps aside while you read and comes back when you scroll up
      const hero = document.getElementById("top");
      setHidden(d === 1 && !!hero && v > hero.offsetHeight - window.innerHeight);
    }
    last.current = v;
  });

  useEffect(() => {
    const els = LEVELS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = LEVELS.findIndex((l) => l.id === e.target.id);
          if (i >= 0) setActive(i);
        }),
      { rootMargin: "-50% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    // header theme from the section under it
    const themed = Array.from(document.querySelectorAll<HTMLElement>("[data-theme]"));
    const io2 = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setTone((e.target as HTMLElement).dataset.theme ?? "light")), {
      rootMargin: "0px 0px -95% 0px",
    });
    themed.forEach((el) => io2.observe(el));
    return () => {
      io.disconnect();
      io2.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.key !== "Tab" || !menuRef.current) return;
      // keep focus inside the keypad (plus its Close button in the top bar)
      const items = [trigger.current, ...Array.from(menuRef.current.querySelectorAll<HTMLElement>("button"))].filter(Boolean) as HTMLElement[];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      trigger.current?.focus();
    };
  }, [open, lenis]);

  const go = (id: string) => {
    const was = open;
    setOpen(false);
    window.setTimeout(() => scrollTo(`#${id}`), was ? 400 : 0);
  };
  const L = LEVELS[active];

  return (
    <>
      <a href="#homes" className="fixed left-4 top-4 z-[120] -translate-y-24 bg-graphite px-4 py-2 text-paper focus:translate-y-0">
        Skip to the homes
      </a>

      {/* desktop: the lift rail */}
      <nav aria-label="Levels" className="fixed inset-y-0 left-0 z-[100] hidden w-[var(--rail)] flex-col items-center border-r border-graphite/10 bg-paper/80 py-5 backdrop-blur-md lg:flex">
        <button type="button" onClick={() => go("top")} className="num text-[1.05rem] tracking-[0.18em] [writing-mode:vertical-rl] rotate-180" aria-label={`${site.name}, back to the lobby`}>
          {site.wordmark}
        </button>

        {/* the display */}
        <div className="mt-6 flex w-14 flex-col items-center rounded-[3px] bg-graphite px-1 py-2 text-[#9DB0FF] shadow-[inset_0_0_12px_rgba(35,64,224,0.35)]" aria-live="polite">
          <span className="sr-only">Current level: {L.label}</span>
          <span aria-hidden="true" className="text-[0.55rem] leading-none">{dir > 0 ? "▲" : "▼"}</span>
          <span aria-hidden="true" className="relative mt-0.5 block h-8 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={L.code}
                className="num block text-[2rem] leading-[1] text-[#C9D3FF] [text-shadow:0_0_8px_rgba(120,150,255,0.8)]"
                initial={{ y: dir > 0 ? "100%" : "-100%" }}
                animate={{ y: "0%" }}
                exit={{ y: dir > 0 ? "-100%" : "100%" }}
                transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
              >
                {L.code}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        {/* the buttons, top floor first like a real panel */}
        <ol className="mt-6 flex flex-1 flex-col items-center justify-center gap-2.5">
          {[...LEVELS].reverse().map((l) => {
            const i = LEVELS.indexOf(l);
            const on = i === active;
            return (
              <li key={l.id} className="group relative">
                <button
                  type="button"
                  onClick={() => go(l.id)}
                  aria-current={on ? "location" : undefined}
                  aria-label={`Level ${l.code}: ${l.label}`}
                  className={`num grid h-9 w-9 place-items-center rounded-full border text-[0.95rem] transition-all duration-300 ${
                    on ? "border-cobalt bg-cobalt text-white shadow-[0_0_0_3px_rgba(35,64,224,0.18),0_0_14px_rgba(35,64,224,0.55)]" : "border-graphite/25 bg-paper text-graphite hover:border-graphite"
                  }`}
                >
                  {l.code}
                </button>
                <span className="data pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap bg-graphite px-2 py-1 text-paper opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                  {l.label}
                </span>
              </li>
            );
          })}
        </ol>
        <button type="button" onClick={() => go("visit")} className="data bg-cobalt px-2 py-4 text-white transition-colors [writing-mode:vertical-rl] rotate-180 hover:bg-graphite">
          Book a viewing
        </button>
      </nav>

      {/* top bar */}
      <header
        className={`fixed left-0 right-0 top-0 z-[90] transition-[color,background-color,transform] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] lg:left-[var(--rail)] ${dark && !open ? "text-paper" : "text-graphite"} ${
          hidden && !open ? "-translate-y-full" : ""
        } ${active === 0 || open ? "" : tone === "light" ? "bg-paper/85 backdrop-blur-md" : tone === "cobalt" ? "bg-cobalt/90 backdrop-blur-md" : "bg-graphite/85 backdrop-blur-md"}`}
      >
        <div className="flex h-16 items-center justify-between gap-4 px-[var(--gutter)]">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => go("top")} className="num text-[1.15rem] tracking-[0.2em] lg:hidden">
              {site.wordmark}
            </button>
            <p className="data hidden opacity-70 lg:block">{site.tagline}</p>
          </div>
          <p className="data flex items-center gap-2 lg:hidden" aria-hidden="true">
            <span className="grid h-6 min-w-6 place-items-center bg-cobalt px-1 text-white">{L.code}</span>
            <span className="opacity-80">{L.label}</span>
          </p>
          <div className="flex items-center gap-3">
            <div role="group" aria-label="Currency" className="data hidden border border-current/25 sm:flex">
              {(["KES", "USD"] as const).map((c) => (
                <button key={c} type="button" aria-pressed={currency === c} onClick={() => setCurrency(c)} className={`px-2.5 py-1.5 transition-colors ${currency === c ? "bg-current/90" : "opacity-60 hover:opacity-100"}`}>
                  <span className={currency === c ? (dark && !open ? "text-graphite" : "text-paper") : ""}>{c}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => go("visit")}
              className="hidden h-9 items-center bg-cobalt px-4 text-[0.82rem] font-medium text-white transition-colors hover:bg-graphite sm:inline-flex"
            >
              Book a viewing
            </button>
            <button ref={trigger} type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="lift-keypad" className="data inline-flex h-9 items-center border border-current/30 px-3 lg:hidden">
              {open ? "Close" : "Levels"}
            </button>
          </div>
        </div>
      </header>

      {/* mobile: the keypad */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="lift-keypad"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Levels"
            className="sheet fixed inset-0 z-[85] flex flex-col px-[var(--gutter)] pb-6 pt-20"
            initial={{ clipPath: "inset(0% 50% 0% 50%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 50% 0% 50%)" }}
            transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
          >
            <p className="data text-mid">Choose a level</p>
            <ol className="mt-5 grid flex-1 grid-cols-3 content-start gap-3">
              {LEVELS.map((l, i) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => go(l.id)}
                    aria-current={i === active ? "location" : undefined}
                    className={`flex aspect-square w-full flex-col items-center justify-center gap-2 border transition-colors ${i === active ? "border-cobalt bg-cobalt text-white" : "border-graphite/20 bg-paper"}`}
                  >
                    <span className="num text-[2.6rem] leading-none">{l.code}</span>
                    <span className="data text-center leading-tight opacity-80">{l.label}</span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div role="group" aria-label="Currency" className="data flex border border-graphite/25">
                {(["KES", "USD"] as const).map((c) => (
                  <button key={c} type="button" aria-pressed={currency === c} onClick={() => setCurrency(c)} className={`flex-1 py-3 ${currency === c ? "bg-graphite text-paper" : ""}`}>
                    {c}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => go("visit")} className="bg-cobalt py-3 text-[0.9rem] text-white">
                Book a viewing
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
