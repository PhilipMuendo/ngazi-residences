"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { site } from "@/config/site";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" data-theme="light" aria-labelledby="faq-title" className="sheet pb-[14vh] pt-[16vh]">
      <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <h2 id="faq-title" className="h-xl">
              Asked
              <br />
              <span className="text-cobalt">and answered.</span>
            </h2>
            <p className="body mt-8 max-w-[34ch] text-graphite/75">
              Something else?{" "}
              <a href={`https://wa.me/${site.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="underline decoration-cobalt decoration-2 underline-offset-4 hover:text-cobalt">
                Message us on WhatsApp
              </a>{" "}
              or call{" "}
              <a href={site.contact.phoneHref} className="whitespace-nowrap underline decoration-cobalt decoration-2 underline-offset-4 hover:text-cobalt">
                {site.contact.phone}
              </a>
              .
            </p>
          </div>
        </div>
        <ul className="border-t-2 border-graphite lg:col-span-7">
          {site.faqs.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q} className="border-b border-graphite/15">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={on}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(on ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left text-[clamp(1.15rem,1.7vw,1.5rem)] font-[350] tracking-[-0.015em] [font-stretch:108%] transition-colors hover:text-cobalt"
                  >
                    {f.q}
                    <span aria-hidden="true" className={`grid h-9 w-9 shrink-0 place-items-center border text-[1.3rem] font-[200] transition-[transform,background-color,color] duration-300 ${on ? "rotate-45 border-cobalt bg-cobalt text-white" : "border-graphite/30"}`}>
                      +
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      id={`faq-a-${i}`}
                      role="region"
                      aria-labelledby={`faq-q-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="body max-w-[60ch] pb-7 text-graphite/75">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
