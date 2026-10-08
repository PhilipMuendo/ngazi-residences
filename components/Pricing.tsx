"use client";

import { AnimatePresence, motion, useSpring, useTransform } from "motion/react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { PRICING, UNITS, UNIT_TYPES, site, unitByCode, formatKESFull, formatUSD, type Unit } from "@/config/site";
import { useSelection } from "@/lib/selection";
import { useScrollTo } from "@/lib/smooth-scroll";
import { useMedia, usePrefersReducedMotion } from "@/lib/useMedia";

/*
 * PAYMENT PLANNER. Pick a home, a deposit and a way to pay; see the exact
 * figure, every payment to completion, and how payments track the tower
 * going up. Synced with the explorer above and the viewing form below.
 */

type Plan = "instalments" | "cash" | "mortgage";
type Freq = "monthly" | "quarterly";
type Pay = { m: number; amount: number; kind: "Deposit" | "Instalment" | "Balance" | "Mortgage" };

const MORTGAGE = { rate: 0.135, years: 20 }; // placeholder, indicative only
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthLabel = (m: number) => `${MONTHS[m % 12]} ${Math.floor(m / 12)}`;
const parseMonth = (s: string) => {
  const [mon, y] = s.split(" ");
  if (mon.startsWith("Q")) return Number(y) * 12 + Number(mon[1]) * 3 - 1;
  return Number(y) * 12 + MONTHS.indexOf(mon);
};
const END = (() => {
  const [y, m] = PRICING.completion.split("-").map(Number);
  return y * 12 + m - 1;
})();

// "this month": the client's clock, but a fixed price-list month on the server so hydration matches
const subscribe = () => () => {};
function useStartMonth() {
  return useSyncExternalStore(
    subscribe,
    () => {
      const d = new Date();
      return d.getFullYear() * 12 + d.getMonth();
    },
    () => 2026 * 12 + 9,
  );
}

function buildSchedule(price: number, dep: number, plan: Plan, freq: Freq, start: number): { pays: Pay[]; total: number } {
  const deposit = Math.round((price * dep) / 100);
  if (plan === "cash") {
    const total = Math.round(price * (1 - PRICING.cashDiscount));
    return { total, pays: [{ m: start, amount: deposit, kind: "Deposit" }, { m: start + 3, amount: total - deposit, kind: "Balance" }] };
  }
  if (plan === "mortgage") {
    return { total: price, pays: [{ m: start, amount: deposit, kind: "Deposit" }, { m: Math.max(END, start + 1), amount: price - deposit, kind: "Mortgage" }] };
  }
  const step = freq === "monthly" ? 1 : 3;
  const months: number[] = [];
  for (let m = start + step; m <= END; m += step) months.push(m);
  if (!months.length) months.push(start + 1);
  const each = Math.round((price - deposit) / months.length);
  const pays: Pay[] = [{ m: start, amount: deposit, kind: "Deposit" }];
  months.forEach((m, i) => pays.push({ m, amount: i === months.length - 1 ? price - deposit - each * (months.length - 1) : each, kind: "Instalment" }));
  return { total: price, pays };
}

function Tween({ value, format }: { value: number; format: (n: number) => string }) {
  const reduce = usePrefersReducedMotion();
  const mv = useSpring(value, { stiffness: 120, damping: 22 });
  useEffect(() => {
    if (reduce) mv.jump(value);
    else mv.set(value);
  }, [value, mv, reduce]);
  const text = useTransform(mv, (v) => format(v));
  return <motion.span>{text}</motion.span>;
}

function Chart({ pays, price, start, plan }: { pays: Pay[]; price: number; start: number; plan: Plan }) {
  const wide = useMedia("(min-width: 640px)", true);
  const W = wide ? 760 : 400, H = wide ? 250 : 240, L = 34, R = 10, T = 14, B = 34;
  const last = Math.max(END, ...pays.map((p) => p.m));
  const span = Math.max(1, last - start);
  const x = (m: number) => L + ((m - start) / span) * (W - L - R);
  const y = (f: number) => T + (1 - f) * (H - T - B);
  const bw = Math.max(3, Math.min(16, ((W - L - R) / (span + 1)) * 0.62));
  let cum = 0;
  const steps = pays.map((p) => {
    cum += p.amount;
    return { m: p.m, f: cum / price };
  });
  const line = steps.reduce((d, s, i) => {
    const px = x(s.m).toFixed(1);
    const prev = i === 0 ? 0 : steps[i - 1].f;
    return d + `${i === 0 ? `M${px},${y(0).toFixed(1)}` : ""} L${px},${y(prev).toFixed(1)} L${px},${y(s.f).toFixed(1)}`;
  }, "");
  const finalX = x(last).toFixed(1);
  const marks = site.progress.milestones
    .filter((ms) => ["Topping out", "Handover"].includes(ms.label))
    .map((ms) => ({ m: parseMonth(ms.date), label: ms.label }))
    .filter((ms) => ms.m > start && ms.m <= last);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Chart of the share of the price paid over time">
      <defs>
        <pattern id="mort" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="5" height="5" fill="#2340E0" opacity="0.15" />
          <line x1="0" y1="0" x2="0" y2="5" stroke="#2340E0" strokeWidth="1.4" />
        </pattern>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={L} x2={W - R} y1={y(f)} y2={y(f)} stroke="#141516" strokeOpacity={f === 0 ? 0.6 : 0.1} />
          <text x={L - 6} y={y(f) + 3} textAnchor="end" fontSize="9" className="font-mono" fill="#7E7A72">
            {f * 100}%
          </text>
        </g>
      ))}
      {/* paid-to-date step line */}
      <motion.path d={`${line} L${finalX},${y(steps[steps.length - 1].f).toFixed(1)}`} fill="none" stroke="#2340E0" strokeWidth="1.6" initial={false} animate={{ d: `${line} L${finalX},${y(steps[steps.length - 1].f).toFixed(1)}` }} transition={{ duration: 0.5 }} />
      {pays.map((p, i) => (
        <motion.rect
          key={`${plan}-${i}`}
          x={x(p.m) - bw / 2}
          width={bw}
          fill={p.kind === "Mortgage" ? "url(#mort)" : p.kind === "Deposit" ? "#141516" : "#2340E0"}
          initial={{ y: y(0), height: 0 }}
          animate={{ y: y(p.amount / price), height: y(0) - y(p.amount / price) }}
          transition={{ duration: 0.6, delay: Math.min(i * 0.012, 0.4), ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
      {/* time axis */}
      <text x={x(start)} y={H - 12} fontSize="9" className="font-mono" fill="#141516">
        {monthLabel(start).toUpperCase()}
      </text>
      {marks.map((ms) => (
        <g key={ms.label}>
          <line x1={x(ms.m)} x2={x(ms.m)} y1={T} y2={y(0)} stroke="#141516" strokeOpacity="0.35" strokeDasharray="2 3" />
          <text x={x(ms.m) - 4} y={H - 12} textAnchor="end" fontSize="9" className="font-mono" fill="#141516">
            {ms.label.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  );
}

const PLANS: { id: Plan; title: string; note: string }[] = [
  { id: "instalments", title: "Instalments", note: "Deposit, then equal payments until completion" },
  { id: "cash", title: "Pay in full", note: `${Math.round(PRICING.cashDiscount * 100)}% off, balance within 90 days` },
  { id: "mortgage", title: "Mortgage", note: "Deposit now, the balance financed on completion" },
];

const statusText = (u: Unit) => (u.status === "available" ? "" : u.status === "reserved" ? " · reserved" : " · sold");

export default function Pricing() {
  const { code, setCode, currency } = useSelection();
  const scrollTo = useScrollTo();
  const unit = unitByCode(code) ?? UNITS[0];
  const start = useStartMonth();
  const [plan, setPlan] = useState<Plan>("instalments");
  const [dep, setDep] = useState(PRICING.defaultDeposit);
  const [freq, setFreq] = useState<Freq>("monthly");
  const [open, setOpen] = useState(false);

  const { pays, total } = useMemo(() => buildSchedule(unit.price, dep, plan, freq, start), [unit.price, dep, plan, freq, start]);
  const fmt = (n: number) => (currency === "USD" ? formatUSD(n) : formatKESFull(n));
  const other = (n: number) => (currency === "USD" ? formatKESFull(n) : formatUSD(n));
  const deposit = pays[0].amount;
  const instalments = pays.filter((p) => p.kind === "Instalment");
  const balance = pays[pays.length - 1].amount;
  const r = MORTGAGE.rate / 12, n = MORTGAGE.years * 12;
  const mortgageMonthly = (balance * r) / (1 - Math.pow(1 + r, -n));

  const headline =
    plan === "instalments"
      ? { value: instalments[0]?.amount ?? 0, unit: freq === "monthly" ? "a month" : "a quarter", sub: `${instalments.length} payments after a ${dep}% deposit of ${fmt(deposit)}` }
      : plan === "cash"
        ? { value: total, unit: "in total", sub: `You save ${fmt(unit.price - total)} against the list price` }
        : { value: mortgageMonthly, unit: "a month, from handover", sub: `${fmt(deposit)} deposit now; ${fmt(balance)} financed over ${MORTGAGE.years} years at ${(MORTGAGE.rate * 100).toFixed(1)}%` };

  const groups = Object.values(UNIT_TYPES).map((t) => ({ t, units: UNITS.filter((u) => u.type.id === t.id).sort((a, b) => b.level - a.level) }));
  const wa = `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(`Hello Ngazi, please send me the payment plan for home ${unit.code} (${unit.type.name}): ${plan === "instalments" ? `${dep}% deposit, ${freq} instalments` : plan === "cash" ? "pay in full" : `${dep}% deposit, mortgage on completion`}.`)}`;

  return (
    <section id="pricing" data-theme="light" aria-labelledby="pr-title" className="bg-paper-2 pb-[14vh] pt-[16vh]">
      <div className="wrap grid grid-cols-1 gap-8 lg:grid-cols-12">
        <h2 id="pr-title" className="h-xl lg:col-span-7">
          Pay as
          <br />
          <span className="text-cobalt">it rises.</span>
        </h2>
        <p className="body max-w-[42ch] self-end text-graphite/75 lg:col-span-4 lg:col-start-9">
          Reserve with a deposit, then pay in step with construction until the keys are yours. Every figure below is worked out from the current price list.
        </p>
      </div>

      <div className="wrap mt-[8vh] grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
        {/* controls */}
        <div className="flex flex-col gap-9 lg:col-span-4">
          <div>
            <label htmlFor="pp-home" className="data text-mid">
              Home
            </label>
            {/* the native select does the work (keyboard, screen readers, phone pickers); the big code is what you see */}
            <div className="relative mt-2 flex items-end justify-between border-b-2 border-graphite pb-1 has-[select:focus-visible]:outline has-[select:focus-visible]:outline-2 has-[select:focus-visible]:outline-offset-4 has-[select:focus-visible]:outline-cobalt">
              <span aria-hidden="true" className="num text-[3.4rem] leading-[0.95]">
                {unit.code}
              </span>
              <span aria-hidden="true" className="data mb-2 flex items-center gap-2 text-graphite/70">
                Change home <span className="text-[0.9rem]">▾</span>
              </span>
              <select
                id="pp-home"
                value={unit.code}
                onChange={(e) => setCode(e.target.value)}
                className="absolute inset-0 cursor-pointer appearance-none opacity-0"
              >
                {groups.map(({ t, units }) => (
                  <optgroup key={t.id} label={t.name}>
                    {units.map((u) => (
                      <option key={u.code} value={u.code} disabled={u.status === "sold" && u.code !== unit.code}>
                        {u.code} · {t.name}
                        {statusText(u)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <p className="mt-3 text-[0.98rem] text-graphite/75">
              {unit.type.name}, {unit.type.area} m², level {unit.level}. List price <strong className="font-[600] text-graphite">{fmt(unit.price)}</strong>
              {unit.status !== "available" && <span className="data ml-2 bg-graphite px-1.5 py-0.5 text-paper">{unit.status}</span>}
            </p>
          </div>

          <fieldset>
            <legend className="data text-mid">How you pay</legend>
            <div className="mt-3 flex flex-col gap-2">
              {PLANS.map((p) => (
                <label key={p.id} className={`flex cursor-pointer items-start gap-4 border px-4 py-3 transition-colors ${plan === p.id ? "border-graphite bg-paper" : "border-graphite/15 hover:border-graphite/40"}`}>
                  <input type="radio" name="plan" value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id)} className="mt-1.5 accent-[#2340E0]" />
                  <span>
                    <span className="block text-[1.12rem] font-[450] [font-stretch:108%]">{p.title}</span>
                    <span className="block text-[0.9rem] text-graphite/65">{p.note}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-1">
            <fieldset>
              <legend className="data text-mid">Deposit</legend>
              <div className="mt-3 flex">
                {PRICING.depositOptions.map((d) => (
                  <label key={d} className={`num flex-1 cursor-pointer border py-2.5 text-center text-[1.4rem] transition-colors [&:not(:first-child)]:-ml-px ${dep === d ? "relative z-10 border-graphite bg-graphite text-paper" : "border-graphite/25 hover:bg-paper"}`}>
                    <input type="radio" name="dep" className="sr-only" checked={dep === d} onChange={() => setDep(d)} />
                    {d}%
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset disabled={plan !== "instalments"} className="transition-opacity disabled:opacity-35">
              <legend className="data text-mid">Instalments</legend>
              <div className="mt-3 flex">
                {(["monthly", "quarterly"] as Freq[]).map((f) => (
                  <label key={f} className={`flex-1 cursor-pointer border py-3 text-center text-[0.98rem] capitalize transition-colors [&:not(:first-child)]:-ml-px ${freq === f ? "relative z-10 border-graphite bg-graphite text-paper" : "border-graphite/25 hover:bg-paper"}`}>
                    <input type="radio" name="freq" className="sr-only" checked={freq === f} onChange={() => setFreq(f)} />
                    {f}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        {/* result */}
        <div className="lg:col-span-7 lg:col-start-6">
          <div className="border-t-2 border-graphite pt-6">
            <p className="data text-mid" aria-live="polite">
              {unit.code} · {PLANS.find((p) => p.id === plan)!.title}
            </p>
            <p className="mt-3 flex flex-wrap items-baseline gap-x-4">
              <span className="num text-[clamp(3.2rem,7.4vw,7.6rem)] leading-[0.9] tracking-[-0.01em]">
                <Tween value={headline.value} format={fmt} />
              </span>
              <span className="text-[1.25rem] font-[300] [font-stretch:112%]">{headline.unit}</span>
            </p>
            <p className="mt-3 text-[1rem] text-graphite/75">{headline.sub}</p>
            <p className="data mt-1 text-mid">≈ {other(headline.value)}</p>
          </div>

          <dl className="mt-8 grid grid-cols-2 border-t border-graphite/15 sm:grid-cols-4">
            {[
              ["List price", fmt(unit.price)],
              ["Deposit", fmt(deposit)],
              ["Payments", String(pays.length)],
              ["You pay", fmt(total)],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-graphite/15 py-3 pr-3">
                <dt className="data text-mid">{k}</dt>
                <dd className="mt-1 text-[1.05rem] font-[500] tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <div className="data mb-2 flex flex-wrap gap-x-5 gap-y-1 text-graphite/75">
              <span className="flex items-center gap-2">
                <i className="h-2.5 w-2.5 bg-graphite" /> Deposit
              </span>
              <span className="flex items-center gap-2">
                <i className="h-2.5 w-2.5 bg-cobalt" /> {plan === "cash" ? "Balance" : "Instalment"}
              </span>
              {plan === "mortgage" && (
                <span className="flex items-center gap-2">
                  <i className="h-2.5 w-2.5 bg-[repeating-linear-gradient(45deg,#2340E0_0_1px,transparent_1px_3px)]" /> Mortgage
                </span>
              )}
              <span className="flex items-center gap-2">
                <i className="h-px w-4 bg-cobalt" /> Paid to date
              </span>
            </div>
            <Chart pays={pays} price={unit.price} start={start} plan={plan} />
          </div>

          <div className="mt-6 border-t border-graphite/15">
            <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="pp-table" className="flex w-full items-center justify-between py-4 text-left text-[1.05rem]">
              See every payment
              <span aria-hidden="true" className={`text-[1.4rem] font-[200] transition-transform duration-300 ${open ? "rotate-45" : ""}`}>
                +
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div id="pp-table" initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }} className="overflow-hidden">
                  <div className="max-h-[22rem] overflow-y-auto" data-lenis-prevent>
                    <table className="w-full text-left text-[0.95rem] tabular-nums">
                      <thead className="data sticky top-0 bg-paper-2 text-mid">
                        <tr>
                          <th className="py-2 font-normal">#</th>
                          <th className="py-2 font-normal">Due</th>
                          <th className="py-2 font-normal">Payment</th>
                          <th className="py-2 text-right font-normal">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pays.map((p, i) => (
                          <tr key={i} className="border-t border-graphite/10">
                            <td className="py-2 text-mid">{String(i + 1).padStart(2, "0")}</td>
                            <td className="py-2">{p.kind === "Deposit" ? "On signing" : monthLabel(p.m)}</td>
                            <td className="py-2">{p.kind}</td>
                            <td className="py-2 text-right">{fmt(p.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => scrollTo("#visit")} className="bg-graphite px-6 py-3.5 text-[0.98rem] text-paper transition-colors hover:bg-cobalt">
              Book a viewing of {unit.code}
            </button>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="border border-graphite px-6 py-3.5 text-[0.98rem] transition-colors hover:bg-graphite hover:text-paper">
              Send me this plan on WhatsApp
            </a>
          </div>
          <p className="data mt-6 max-w-[70ch] leading-relaxed text-mid">
            Illustrative only. Prices, payment terms, exchange rate ({PRICING.kesPerUsd} KES/USD) and mortgage terms are placeholders. Final terms are in the sale agreement.
          </p>
        </div>
      </div>
    </section>
  );
}
