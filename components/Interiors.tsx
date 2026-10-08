"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { site } from "@/config/site";
import { useFinePointer } from "@/lib/useMedia";

/*
 * INTERIORS. Rooms as annotated photographs (the spec is pinned to the thing it
 * describes) and a materials board you can put a loupe over.
 */

function Swatch({ m }: { m: (typeof site.materials)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null);
  const Z = 2.6;
  const R = 70;
  return (
    <figure className="group">
      <div
        ref={ref}
        className="relative aspect-square cursor-zoom-in overflow-hidden bg-paper-2"
        onPointerMove={(e) => {
          if (!fine || !ref.current) return;
          const r = ref.current.getBoundingClientRect();
          setLens({ x: e.clientX - r.left, y: e.clientY - r.top });
        }}
        onPointerLeave={() => setLens(null)}
      >
        <Image src={m.image.src} alt={m.image.alt} fill sizes="(min-width:1024px) 22vw, 50vw" className="object-cover" />
        {lens && ref.current && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full border-2 border-paper shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
            style={{
              width: R * 2,
              height: R * 2,
              left: lens.x - R,
              top: lens.y - R,
              backgroundImage: `url(${m.image.src.src})`,
              backgroundSize: `${ref.current.clientWidth * Z}px ${ref.current.clientHeight * Z}px`,
              backgroundPosition: `${-(lens.x * Z - R)}px ${-(lens.y * Z - R)}px`,
            }}
          />
        )}
      </div>
      <figcaption className="mt-3 flex items-baseline justify-between gap-3">
        <span className="text-[0.98rem]">{m.name}</span>
        <span className="data text-mid">{m.where}</span>
      </figcaption>
    </figure>
  );
}

export default function Interiors() {
  const rooms = site.interiors;
  const [i, setI] = useState(0);
  const [note, setNote] = useState<number | null>(null);
  const room = rooms[i];

  return (
    <section id="interiors" data-theme="light" aria-labelledby="int-title" className="sheet pb-[14vh] pt-[16vh]">
      <div className="wrap grid grid-cols-1 gap-8 lg:grid-cols-12">
        <h2 id="int-title" className="h-xl lg:col-span-7">
          Fewer, better
          <br />
          <span className="text-cobalt">things.</span>
        </h2>
        <p className="body max-w-[42ch] self-end text-graphite/75 lg:col-span-4 lg:col-start-9">
          Concrete, oak, stone and brass, and nothing that needs explaining. Every home is finished to the same specification; penthouses add marble and a private lift lobby.
        </p>
      </div>

      <div className="wrap mt-[8vh]">
        <div role="tablist" aria-label="Rooms" className="flex flex-wrap gap-x-8 gap-y-2 border-b border-graphite/15">
          {rooms.map((r, k) => (
            <button
              key={r.title}
              role="tab"
              aria-selected={k === i}
              onClick={() => {
                setI(k);
                setNote(null);
              }}
              className={`relative pb-3 text-[clamp(1.4rem,2.4vw,2.4rem)] font-[300] tracking-[-0.03em] [font-stretch:115%] transition-colors ${k === i ? "text-graphite" : "text-graphite/30 hover:text-graphite/60"}`}
            >
              {r.title}
              {k === i && <motion.span layoutId="room-line" className="absolute inset-x-0 -bottom-px h-[2px] bg-cobalt" />}
            </button>
          ))}
        </div>

        <div className="relative mt-6 aspect-[16/10] overflow-hidden bg-paper-2 lg:aspect-[21/10]">
          <AnimatePresence initial={false}>
            <motion.div
              key={room.title}
              className="absolute inset-0"
              initial={{ clipPath: "inset(0% 0% 0% 100%)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
              exit={{ opacity: 0.999 }}
              transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
            >
              <Image src={room.image.src} alt={room.image.alt} fill sizes="(min-width:1024px) 90vw, 100vw" className="object-cover" />
              {room.notes.map((n, k) => (
                <div key={n.label} className="absolute" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                  <button
                    type="button"
                    onPointerEnter={() => setNote(k)}
                    onPointerLeave={() => setNote(null)}
                    onFocus={() => setNote(k)}
                    onBlur={() => setNote(null)}
                    onClick={() => setNote(note === k ? null : k)}
                    aria-label={n.label}
                    aria-expanded={note === k}
                    className="num grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center bg-cobalt text-[0.9rem] text-white shadow-[0_0_0_4px_rgba(35,64,224,0.25)]"
                  >
                    {k + 1}
                  </button>
                  <AnimatePresence>
                    {note === k && (
                      <motion.p
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="data pointer-events-none absolute left-5 top-[-0.9rem] whitespace-nowrap bg-paper px-3 py-2 text-graphite shadow-lg"
                      >
                        {n.label}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        <ol className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {room.notes.map((n, k) => (
            <li key={n.label} className="data flex gap-3 text-graphite/80">
              <span className="text-cobalt">{String(k + 1).padStart(2, "0")}</span>
              {n.label}
            </li>
          ))}
        </ol>
      </div>

      <div className="wrap mt-[10vh]">
        <div className="flex items-end justify-between border-b border-graphite/15 pb-3">
          <h3 className="h-md">The materials board</h3>
          <p className="data hidden text-mid sm:block">Hover to inspect</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {site.materials.map((m) => (
            <Swatch key={m.id} m={m} />
          ))}
        </div>
      </div>
    </section>
  );
}
