"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useMemo, useState, useSyncExternalStore, type FormEvent } from "react";
import { UNITS, site, unitByCode } from "@/config/site";
import { useSelection } from "@/lib/selection";

/*
 * BOOK A VIEWING. The whole page funnels here: the home picked in the
 * explorer arrives pre-filled. Three ways to view, real days and times,
 * one short form, and WhatsApp as the instant alternative.
 */

const TYPES = [
  { id: "Show apartment", note: "Walk the finished show home and sales suite" },
  { id: "Video call", note: "From anywhere, with a live walkthrough" },
  { id: "Site tour", note: "Hard hats on, see the build itself" },
] as const;
const TIMES = ["09:30", "11:00", "12:30", "14:00", "15:30"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// today on the client; a fixed date for the server render so hydration matches
const subscribe = () => () => {};
function useToday() {
  return useSyncExternalStore(
    subscribe,
    () => new Date().toDateString(),
    () => "Thu Oct 08 2026",
  );
}

type Status = { s: "idle" } | { s: "sending" } | { s: "sent"; ref: string } | { s: "error"; msg: string };

const field = "w-full border-b border-white/40 bg-transparent py-3 text-[1.1rem] text-white placeholder:text-white/40 outline-none transition-colors focus:border-white";

export default function Visit() {
  const { code } = useSelection();
  const uid = useId();
  const today = useToday();
  const days = useMemo(() => {
    const base = new Date(today);
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i + 1);
      return { key: `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`, dow: DAYS[d.getDay()], date: d.getDate(), mon: MONTHS[d.getMonth()], sunday: d.getDay() === 0 };
    });
  }, [today]);

  const [type, setType] = useState<(typeof TYPES)[number]["id"]>("Show apartment");
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [home, setHome] = useState<string | null>(null); // null = follow the explorer
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ s: "idle" });
  const homeCode = home ?? code;
  const unit = unitByCode(homeCode);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      type,
      day: day ?? "",
      time: time ?? "",
      home: homeCode === "any" ? "" : homeCode,
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      message: String(fd.get("message") ?? ""),
      company: String(fd.get("company") ?? ""),
    };
    const errs: Record<string, string> = {};
    if (!payload.day || !payload.time) errs.when = "Pick a day and a time.";
    if (payload.name.trim().length < 2) errs.name = "Please tell us your name.";
    if (!payload.phone.trim() && !payload.email.trim()) errs.phone = "Add a phone number or an email so we can confirm.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`${uid}-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setStatus({ s: "sending" });
    try {
      const r = await fetch("/api/visit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const j = (await r.json()) as { ok: boolean; ref?: string; errors?: Record<string, string>; error?: string };
      if (j.ok) setStatus({ s: "sent", ref: j.ref ?? "" });
      else if (j.errors) {
        setErrors(j.errors);
        setStatus({ s: "idle" });
      } else setStatus({ s: "error", msg: j.error ?? "Something went wrong." });
    } catch {
      setStatus({ s: "error", msg: "You seem to be offline." });
    }
  }

  const wa = `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(
    `Hello Ngazi, I'd like a ${type.toLowerCase()}${day ? ` on ${day}` : ""}${time ? ` at ${time}` : ""}${unit ? ` for home ${unit.code} (${unit.type.name})` : ""}.`,
  )}`;

  const chip = (on: boolean) => `relative border transition-colors ${on ? "border-white bg-white text-cobalt" : "border-white/35 text-white hover:border-white"}`;

  return (
    <section id="visit" data-theme="cobalt" aria-labelledby="visit-title" className="bg-cobalt pb-[14vh] pt-[16vh] text-white">
      <div className="wrap grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <h2 id="visit-title" className="h-xl">
            Come up
            <br />
            and see.
          </h2>
          <p className="body mt-8 max-w-[34ch] text-white/80">The show apartment is fitted to the full specification, on the site at the same height as level 4. Coffee&apos;s on us.</p>
          <dl className="mt-10 grid gap-5 text-[1rem]">
            <div>
              <dt className="data text-white/60">Sales suite</dt>
              <dd className="mt-1">{site.contact.salesSuite}</dd>
            </div>
            <div>
              <dt className="data text-white/60">Open</dt>
              <dd className="mt-1">{site.contact.hours}</dd>
            </div>
            <div>
              <dt className="data text-white/60">Call or WhatsApp</dt>
              <dd className="mt-1 flex flex-wrap gap-x-5">
                <a href={site.contact.phoneHref} className="underline underline-offset-4 hover:no-underline">
                  {site.contact.phone}
                </a>
                <a href={`https://wa.me/${site.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:no-underline">
                  WhatsApp
                </a>
                <a href={`mailto:${site.contact.email}`} className="underline underline-offset-4 hover:no-underline">
                  {site.contact.email}
                </a>
              </dd>
            </div>
          </dl>
          <p className="data mt-8 text-white/55">Contact details are placeholders.</p>
        </div>

        <div className="relative lg:col-span-7 lg:col-start-6">
          <AnimatePresence mode="wait" initial={false}>
            {status.s === "sent" ? (
              <motion.div key="sent" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border border-white/40 p-8 sm:p-12" role="status" tabIndex={-1} ref={(el) => el?.focus()}>
                <p className="data text-white/70">Request {status.ref}</p>
                <p className="h-lg mt-4">You&apos;re on the list.</p>
                <p className="body mt-6 max-w-[44ch] text-white/85">
                  {type} on {day} at {time}
                  {unit ? `, for home ${unit.code}` : ""}. We&apos;ll confirm within working hours, usually in under an hour.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="bg-white px-6 py-3.5 text-cobalt">
                    Confirm faster on WhatsApp
                  </a>
                  <button type="button" onClick={() => setStatus({ s: "idle" })} className="border border-white/50 px-6 py-3.5 hover:border-white">
                    Book another
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0 }} className="flex flex-col gap-10">
                <fieldset>
                  <legend className="data text-white/70">How would you like to view?</legend>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {TYPES.map((t) => (
                      <label key={t.id} className={`cursor-pointer px-4 py-3.5 ${chip(type === t.id)}`}>
                        <input type="radio" name="type" className="sr-only" checked={type === t.id} onChange={() => setType(t.id)} />
                        <span className="block text-[1.05rem] font-[500]">{t.id}</span>
                        <span className={`mt-1 block text-[0.85rem] leading-snug ${type === t.id ? "text-cobalt/75" : "text-white/65"}`}>{t.note}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset id={`${uid}-when`} tabIndex={-1} aria-describedby={errors.when ? `${uid}-when-err` : undefined} className="min-w-0 outline-none">
                  <legend className="data text-white/70">When</legend>
                  <div className="no-scrollbar -mx-[var(--gutter)] mt-3 flex gap-2 overflow-x-auto px-[var(--gutter)] lg:mx-0 lg:grid lg:grid-cols-6 lg:px-0" data-lenis-prevent>
                    {days.map((d) => {
                      const off = d.sunday && type !== "Video call";
                      return (
                        <label key={d.key} className={`relative min-w-[4.6rem] shrink-0 py-2.5 text-center ${off ? "cursor-not-allowed border border-white/15 text-white/35" : `cursor-pointer ${chip(day === d.key)}`}`} title={off ? "Sundays by appointment" : undefined}>
                          <input type="radio" name="day" className="sr-only" disabled={off} checked={day === d.key} onChange={() => setDay(d.key)} />
                          <span className="data block">{d.dow}</span>
                          <span className="num block text-[1.7rem] leading-tight">{d.date}</span>
                          <span className="data block opacity-70">{d.mon}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {TIMES.map((t) => (
                      <label key={t} className={`cursor-pointer px-4 py-2 tabular-nums ${chip(time === t)}`}>
                        <input type="radio" name="time" className="sr-only" checked={time === t} onChange={() => setTime(t)} />
                        {t}
                      </label>
                    ))}
                  </div>
                  {errors.when && (
                    <p id={`${uid}-when-err`} className="data mt-3 text-white">
                      ↳ {errors.when}
                    </p>
                  )}
                </fieldset>

                <div>
                  <label htmlFor={`${uid}-home`} className="data text-white/70">
                    Home you&apos;re interested in
                  </label>
                  <select id={`${uid}-home`} value={homeCode} onChange={(e) => setHome(e.target.value)} className={`${field} mt-1 appearance-none [&>option]:text-graphite`}>
                    <option value="any">Not sure yet, show me a few</option>
                    {UNITS.filter((u) => u.status !== "sold" || u.code === homeCode).map((u) => (
                      <option key={u.code} value={u.code}>
                        {u.code} · {u.type.name} · {u.type.area} m²{u.status === "sold" ? " (sold)" : u.status === "reserved" ? " (reserved)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor={`${uid}-name`} className="data text-white/70">
                      Your name
                    </label>
                    <input id={`${uid}-name`} name="name" autoComplete="name" className={field} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${uid}-name-err` : undefined} />
                    {errors.name && (
                      <p id={`${uid}-name-err`} className="data mt-2">
                        ↳ {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor={`${uid}-phone`} className="data text-white/70">
                      Phone / WhatsApp
                    </label>
                    <input id={`${uid}-phone`} name="phone" type="tel" autoComplete="tel" placeholder="+254" className={field} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${uid}-phone-err` : undefined} />
                    {errors.phone && (
                      <p id={`${uid}-phone-err`} className="data mt-2">
                        ↳ {errors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor={`${uid}-email`} className="data text-white/70">
                      Email
                    </label>
                    <input id={`${uid}-email`} name="email" type="email" autoComplete="email" className={field} aria-invalid={!!errors.email} aria-describedby={errors.email ? `${uid}-email-err` : undefined} />
                    {errors.email && (
                      <p id={`${uid}-email-err`} className="data mt-2">
                        ↳ {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor={`${uid}-message`} className="data text-white/70">
                      Anything we should know? <span className="text-white/45">(optional)</span>
                    </label>
                    <textarea id={`${uid}-message`} name="message" rows={2} className={`${field} resize-none`} />
                  </div>
                  <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
                    <label>
                      Company <input name="company" tabIndex={-1} autoComplete="off" />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <button type="submit" disabled={status.s === "sending"} className="group flex items-center justify-between gap-8 bg-white px-7 py-4 text-[1.05rem] font-[500] text-cobalt transition-colors hover:bg-graphite hover:text-white disabled:opacity-70">
                    {status.s === "sending" ? "Sending…" : "Request this viewing"}
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="px-2 py-2 text-[1rem] underline underline-offset-4 hover:no-underline">
                    or book on WhatsApp
                  </a>
                </div>
                {status.s === "error" && (
                  <p role="alert" className="data -mt-4">
                    ↳ {status.msg} Please try WhatsApp instead.
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
