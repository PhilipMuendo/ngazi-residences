/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  NGAZI: project configuration. Every developer-specific value lives here.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  "Ngazi" (Swahili: level, step) is an original concept for an off-plan
 *  residential tower in Nairobi. The building, its units, prices and
 *  availability are generated from the rules below, so the 3D tower, the
 *  stacking plan, the floor plans and the payment calculator always agree.
 *
 *  ⚠ PLACEHOLDERS: prices, availability, completion date, approvals, escrow
 *  bank, drive times and contact details are demo content and are labelled
 *  on screen until replaced with the developer's real data.
 */

import type { StaticImageData } from "next/image";

import livingCity from "@/assets/images/living-city.jpg";
import kitchenConcrete from "@/assets/images/kitchen-concrete.jpg";
import bedroomConcrete from "@/assets/images/bedroom-concrete.jpg";
import bathBlack from "@/assets/images/bath-black.jpg";
import poolCity from "@/assets/images/pool-city.jpg";
import gymSkyline from "@/assets/images/gym-skyline.jpg";
import lounge from "@/assets/images/lounge.jpg";
import loungeDark from "@/assets/images/lounge-dark.jpg";
import viewLow from "@/assets/images/view-low.jpg";
import viewMid from "@/assets/images/view-mid.jpg";
import viewHigh from "@/assets/images/view-high.jpg";
import viewDusk from "@/assets/images/view-dusk.jpg";
import construction from "@/assets/images/construction.jpg";
import terrazzo from "@/assets/images/terrazzo.jpg";
import marble from "@/assets/images/marble.jpg";
import concreteSteps from "@/assets/images/concrete-steps.jpg";
import terrazzoFloor from "@/assets/images/terrazzo-floor.jpg";

export type Img = { src: StaticImageData; alt: string };

// ── Plans: rooms as rectangles in metres (x right, y down), drawn by FloorPlan ─
export type Room = { x: number; y: number; w: number; h: number; label: string; outdoor?: boolean };
export type Door = { x: number; y: number; r: number; rot: number };
export type Plan = { w: number; h: number; rooms: Room[]; doors: Door[] };

export type UnitType = {
  id: "A" | "B" | "C" | "D" | "PH";
  name: string;
  beds: number;
  baths: number;
  area: number; // internal m²
  outdoor: number; // balcony / terrace m²
  aspect: string;
  view: string;
  premium: number; // view premium, fraction
  plan: Plan;
};

export const UNIT_TYPES: Record<UnitType["id"], UnitType> = {
  C: {
    id: "C",
    name: "One bedroom",
    beds: 1,
    baths: 1,
    area: 69,
    outdoor: 9,
    aspect: "South-west",
    view: "City skyline",
    premium: 0,
    plan: {
      w: 10.2,
      h: 7,
      rooms: [
        { x: 0, y: 0, w: 6.2, h: 7, label: "Living · Kitchen" },
        { x: 6.2, y: 0, w: 4, h: 4, label: "Bedroom" },
        { x: 6.2, y: 4, w: 2.2, h: 3, label: "Bath" },
        { x: 8.4, y: 4, w: 1.8, h: 3, label: "Entry" },
        { x: 0, y: -1.8, w: 6.2, h: 1.8, label: "Balcony", outdoor: true },
      ],
      doors: [
        { x: 6.2, y: 3.0, r: 0.9, rot: 180 },
        { x: 7.2, y: 4, r: 0.8, rot: 90 },
        { x: 10.2, y: 6.0, r: 0.95, rot: 180 },
      ],
    },
  },
  A: {
    id: "A",
    name: "Two bedroom",
    beds: 2,
    baths: 2,
    area: 104,
    outdoor: 12,
    aspect: "North-east",
    view: "Karura Forest · sunrise",
    premium: 0.03,
    plan: {
      w: 12.8,
      h: 8.2,
      rooms: [
        { x: 0, y: 0, w: 6.4, h: 5.2, label: "Living · Dining" },
        { x: 0, y: 5.2, w: 3.6, h: 3, label: "Kitchen" },
        { x: 3.6, y: 5.2, w: 2.8, h: 3, label: "Entry" },
        { x: 6.4, y: 0, w: 6.4, h: 4.4, label: "Bedroom 1" },
        { x: 6.4, y: 4.4, w: 2.6, h: 3.8, label: "En-suite" },
        { x: 9, y: 4.4, w: 3.8, h: 3.8, label: "Bedroom 2" },
        { x: 0, y: -2, w: 6.4, h: 2, label: "Balcony", outdoor: true },
      ],
      doors: [
        { x: 6.4, y: 3.2, r: 0.9, rot: 180 },
        { x: 7.6, y: 4.4, r: 0.8, rot: 90 },
        { x: 9, y: 5.4, r: 0.9, rot: 0 },
        { x: 5.2, y: 8.2, r: 0.95, rot: 270 },
      ],
    },
  },
  D: {
    id: "D",
    name: "Two bedroom + study",
    beds: 2,
    baths: 2,
    area: 118,
    outdoor: 10,
    aspect: "South-east",
    view: "City · morning sun",
    premium: 0.02,
    plan: {
      w: 13.2,
      h: 9,
      rooms: [
        { x: 0, y: 0, w: 7.2, h: 5.4, label: "Living · Dining" },
        { x: 0, y: 5.4, w: 4, h: 3.6, label: "Kitchen" },
        { x: 4, y: 5.4, w: 3.2, h: 3.6, label: "Study" },
        { x: 7.2, y: 0, w: 6, h: 4.6, label: "Bedroom 1" },
        { x: 7.2, y: 4.6, w: 2.6, h: 4.4, label: "En-suite" },
        { x: 9.8, y: 4.6, w: 3.4, h: 4.4, label: "Bedroom 2" },
        { x: -1.8, y: 0, w: 1.8, h: 5.4, label: "Balcony", outdoor: true },
      ],
      doors: [
        { x: 7.2, y: 3.4, r: 0.9, rot: 180 },
        { x: 4, y: 6.4, r: 0.8, rot: 0 },
        { x: 8.4, y: 4.6, r: 0.8, rot: 90 },
        { x: 9.8, y: 5.8, r: 0.9, rot: 0 },
      ],
    },
  },
  B: {
    id: "B",
    name: "Three bedroom",
    beds: 3,
    baths: 3,
    area: 141,
    outdoor: 16,
    aspect: "North-west",
    view: "Ngong Hills · sunset",
    premium: 0.06,
    plan: {
      w: 14.6,
      h: 9.8,
      rooms: [
        { x: 0, y: 0, w: 8, h: 5.6, label: "Living · Dining" },
        { x: 0, y: 5.6, w: 4.2, h: 4.2, label: "Kitchen" },
        { x: 4.2, y: 5.6, w: 3.8, h: 4.2, label: "Bedroom 3" },
        { x: 8, y: 0, w: 6.6, h: 4.8, label: "Bedroom 1" },
        { x: 8, y: 4.8, w: 2.8, h: 5, label: "En-suite" },
        { x: 10.8, y: 4.8, w: 3.8, h: 5, label: "Bedroom 2" },
        { x: 0, y: -2.2, w: 8, h: 2.2, label: "Balcony", outdoor: true },
      ],
      doors: [
        { x: 8, y: 3.6, r: 0.9, rot: 180 },
        { x: 4.2, y: 6.8, r: 0.85, rot: 0 },
        { x: 9.2, y: 4.8, r: 0.8, rot: 90 },
        { x: 10.8, y: 6.2, r: 0.9, rot: 0 },
      ],
    },
  },
  PH: {
    id: "PH",
    name: "Four bedroom penthouse",
    beds: 4,
    baths: 5,
    area: 286,
    outdoor: 48,
    aspect: "Dual aspect",
    view: "Ngong Hills & skyline",
    premium: 0.18,
    plan: {
      w: 22,
      h: 13,
      rooms: [
        { x: 0, y: 0, w: 11, h: 7, label: "Living" },
        { x: 0, y: 7, w: 7, h: 6, label: "Kitchen · Dining" },
        { x: 7, y: 7, w: 4, h: 6, label: "Family" },
        { x: 11, y: 0, w: 7, h: 6, label: "Principal suite" },
        { x: 18, y: 0, w: 4, h: 6, label: "Bath" },
        { x: 11, y: 6, w: 4.5, h: 7, label: "Bedroom 2" },
        { x: 15.5, y: 6, w: 6.5, h: 3.5, label: "Bedroom 3" },
        { x: 15.5, y: 9.5, w: 6.5, h: 3.5, label: "Bedroom 4" },
        { x: 0, y: -3.5, w: 11, h: 3.5, label: "Terrace", outdoor: true },
      ],
      doors: [
        { x: 11, y: 4.8, r: 1, rot: 180 },
        { x: 18, y: 1.4, r: 0.85, rot: 0 },
        { x: 11, y: 7.4, r: 0.9, rot: 0 },
        { x: 15.5, y: 7.2, r: 0.9, rot: 0 },
        { x: 15.5, y: 10.6, r: 0.9, rot: 0 },
      ],
    },
  },
};

// ── The tower ──────────────────────────────────────────────────────────────────
export const TOWER = {
  levels: 24, // L1 amenities, L2–L22 typical, L23–L24 penthouses
  firstHomeLevel: 2,
  penthouseFrom: 23,
  floorHeight: 3.6, // m
  groundHeight: 6, // m, double-height lobby
  plate: { w: 26, d: 22 }, // m
  /** unit order around a typical floor, by quadrant: NE, NW, SW, SE */
  typical: ["A", "B", "C", "D"] as UnitType["id"][],
  penthouses: ["PH", "PH"] as UnitType["id"][], // west, east halves
};

export type Status = "available" | "reserved" | "sold";
export type Unit = {
  code: string; // e.g. "14B"
  level: number;
  slot: number; // quadrant index (0–3) or half (0–1) on penthouse levels
  type: UnitType;
  price: number; // KES
  status: Status;
};

export const PRICING = {
  kesPerM2: 158_000, // placeholder, typical Riverside 2026 off-plan pricing
  penthouseKesPerM2: 205_000,
  floorPremium: 0.009, // per level above L2
  kesPerUsd: 129, // placeholder exchange rate
  completion: "2028-12-31", // placeholder
  completionLabel: "Q4 2028",
  depositOptions: [10, 20, 30],
  defaultDeposit: 20,
  cashDiscount: 0.05,
};

// deterministic pseudo-random so availability is stable across renders and devices
function rand(seed: number) {
  const x = Math.sin(seed * 9301.17 + 49297.3) * 233280.5;
  return x - Math.floor(x);
}

function buildUnits(): Unit[] {
  const units: Unit[] = [];
  for (let level = TOWER.firstHomeLevel; level <= TOWER.levels; level++) {
    const ph = level >= TOWER.penthouseFrom;
    const slots = ph ? TOWER.penthouses : TOWER.typical;
    slots.forEach((id, slot) => {
      const type = UNIT_TYPES[id];
      const rate = ph ? PRICING.penthouseKesPerM2 : PRICING.kesPerM2;
      const raw = type.area * rate * (1 + (level - TOWER.firstHomeLevel) * PRICING.floorPremium) * (1 + type.premium);
      const price = Math.round(raw / 50_000) * 50_000;
      // lower floors and Ngong-facing homes sell first
      const r = rand(level * 7 + slot * 13);
      const pressure = 0.62 - (level - 2) * 0.016 + (id === "B" ? 0.14 : 0) + (id === "C" ? 0.08 : 0);
      const status: Status = r < pressure ? "sold" : r < pressure + 0.12 ? "reserved" : "available";
      units.push({ code: `${level}${ph ? (slot === 0 ? "W" : "E") : id}`, level, slot, type, price, status });
    });
  }
  return units;
}

export const UNITS = buildUnits();
export const unitByCode = (code: string) => UNITS.find((u) => u.code === code);
// the home the page opens on: the highest available Ngong Hills-facing three-bed (else any available home)
export const FEATURED_CODE = (
  [...UNITS].sort((a, b) => b.level - a.level).find((u) => u.status === "available" && u.type.id === "B" && u.level < TOWER.penthouseFrom - 2) ??
  UNITS.find((u) => u.status === "available") ??
  UNITS[0]
).code;

export const formatKES = (n: number) => `KES ${n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e8 ? 0 : 1)}M` : n.toLocaleString("en-KE")}`;
export const formatKESFull = (n: number) => `KES ${Math.round(n).toLocaleString("en-KE")}`;
export const formatUSD = (n: number) => `US$${Math.round(n / PRICING.kesPerUsd).toLocaleString("en-US")}`;
export const levelHeight = (level: number) => TOWER.groundHeight + (level - 1) * TOWER.floorHeight;

// ── Site ───────────────────────────────────────────────────────────────────────
export const site = {
  name: "Ngazi",
  wordmark: "NGAZI",
  tagline: "Residences on Riverside Drive, Nairobi",
  url: "https://ngazi-residences.vercel.app",
  placeholders: true,

  brand: {
    paper: "#E7E4DE", // concrete paper
    graphite: "#141516",
    stone: "#B9B4AA",
    mid: "#7E7A72",
    accent: "#2340E0", // blueprint cobalt
  },

  contact: {
    phone: "+254 700 000 000", // placeholder
    phoneHref: "tel:+254700000000",
    whatsapp: "254700000000", // placeholder
    email: "homes@example.com", // placeholder
    salesSuite: "Show apartment & sales suite, Riverside Drive, Nairobi", // placeholder
    hours: "Mon–Sat 9:00–17:00 · Sun by appointment",
    developer: "Ngazi Developments Ltd.", // placeholder
  },

  social: [
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "YouTube", href: "https://www.youtube.com/" },
  ],

  seo: {
    title: "Ngazi | Off-plan apartments on Riverside Drive, Nairobi",
    description:
      "88 homes on 24 levels above Riverside Drive. One to four bedroom apartments and penthouses with views to the Ngong Hills. Explore the tower in 3D, check availability and plan your payments. Completion Q4 2028.",
    keywords: [
      "off-plan apartments Nairobi",
      "apartments for sale Riverside Drive",
      "Westlands apartments for sale",
      "luxury apartments Nairobi",
      "penthouse Nairobi",
      "3 bedroom apartment Nairobi",
      "buy apartment in Kenya from abroad",
      "Nairobi real estate investment",
    ],
  },

  interiors: [
    {
      image: { src: livingCity, alt: "A living room with tall windows and pale stone furniture" },
      title: "Living",
      notes: [
        { x: 50, y: 18, label: "Floor-to-ceiling glazing, 2.9 m clear" },
        { x: 30, y: 86, label: "Engineered oak, 220 mm planks" },
        { x: 82, y: 64, label: "Recessed linear lighting" },
      ],
    },
    {
      image: { src: kitchenConcrete, alt: "A kitchen with a long island under a board-marked concrete ceiling" },
      title: "Kitchen",
      notes: [
        { x: 42, y: 12, label: "Board-marked concrete soffit" },
        { x: 30, y: 70, label: "Honed stone island, 3.2 m" },
        { x: 78, y: 46, label: "Integrated appliances" },
      ],
    },
    {
      image: { src: bedroomConcrete, alt: "A calm bedroom in concrete, oak and linen" },
      title: "Bedroom",
      notes: [
        { x: 60, y: 30, label: "Fluted oak headboard wall" },
        { x: 22, y: 76, label: "Acoustic floor build-up" },
      ],
    },
    {
      image: { src: bathBlack, alt: "A bathroom with a black freestanding tub and stone walls" },
      title: "Bath",
      notes: [
        { x: 50, y: 64, label: "Freestanding stone-resin tub" },
        { x: 40, y: 18, label: "Brushed brass fittings" },
      ],
    },
  ],

  materials: [
    { id: "terrazzo", name: "Terrazzo", where: "Lobby & corridors", image: { src: terrazzo, alt: "Terrazzo texture" } },
    { id: "marble", name: "Green marble", where: "Penthouse baths", image: { src: marble, alt: "Green-grey marble texture" } },
    { id: "concrete", name: "Board-marked concrete", where: "Soffits & stair cores", image: { src: concreteSteps, alt: "Concrete steps in dappled light" } },
    { id: "floor", name: "Honed terrazzo floor", where: "Kitchens", image: { src: terrazzoFloor, alt: "Terrazzo floor with a chair in sunlight" } },
  ],

  amenities: [
    { level: "Roof", name: "Infinity pool & sky deck", body: "A 25 m pool on the roof, facing the Ngong Hills.", image: { src: poolCity, alt: "A rooftop infinity pool above the city" } },
    { level: "Roof", name: "Sky lounge", body: "Residents' lounge and bar for sundowners.", image: { src: loungeDark, alt: "A moody residents' lounge" } },
    { level: "L1", name: "Gym & studio", body: "Cardio with a skyline view, free weights, a yoga studio.", image: { src: gymSkyline, alt: "Exercise machines facing a city view" } },
    { level: "L1", name: "Work lounge", body: "Bookable meeting rooms and quiet desks on fibre.", image: { src: lounge, alt: "A residents' work lounge" } },
    { level: "G", name: "Lobby & concierge", body: "Double-height lobby, 24 h concierge, parcel room.", image: { src: lounge, alt: "A lobby lounge" } },
    { level: "B1–B2", name: "Parking & services", body: "Two bays per home, EV charging, borehole, 100% backup power.", image: { src: construction, alt: "The tower under construction" } },
  ],

  location: {
    // bearing in degrees from north, minutes by car (typical off-peak, approximate)
    places: [
      { name: "Riverside Square", cat: "Shopping", bearing: 120, mins: 2 },
      { name: "Westlands", cat: "City", bearing: 300, mins: 6 },
      { name: "Karura Forest", cat: "Nature", bearing: 20, mins: 9 },
      { name: "Aga Khan Hospital", cat: "Health", bearing: 150, mins: 10 },
      { name: "Sarit Centre", cat: "Shopping", bearing: 285, mins: 9 },
      { name: "Nairobi CBD", cat: "City", bearing: 175, mins: 15 },
      { name: "UN Gigiri", cat: "City", bearing: 10, mins: 18 },
      { name: "Village Market", cat: "Shopping", bearing: 30, mins: 20 },
      { name: "International schools", cat: "Schools", bearing: 330, mins: 22 },
      { name: "Nairobi Hospital", cat: "Health", bearing: 195, mins: 15 },
      { name: "Wilson Airport", cat: "Airports", bearing: 200, mins: 25 },
      { name: "JKIA", cat: "Airports", bearing: 140, mins: 35 },
    ],
  },

  progress: {
    percent: 18, // placeholder
    updated: "September 2026", // placeholder
    image: { src: construction, alt: "A residential tower under construction with a tower crane" },
    milestones: [
      { label: "Approvals & permits", date: "Nov 2025", state: "done" },
      { label: "Groundbreaking", date: "Mar 2026", state: "done" },
      { label: "Basements", date: "Aug 2026", state: "done" },
      { label: "Podium & L1", date: "Dec 2026", state: "current" },
      { label: "Structure to L12", date: "Jul 2027", state: "next" },
      { label: "Topping out", date: "Feb 2028", state: "next" },
      { label: "Facade & fit-out", date: "Sep 2028", state: "next" },
      { label: "Handover", date: "Q4 2028", state: "next" },
    ],
  },

  trust: [
    { title: "Sectional titles", body: "Each home is issued its own sectional title under the Sectional Properties Act, 2020." },
    { title: "Escrow-held deposits", body: "Deposits are held in escrow with a regulated Kenyan bank until the relevant stage completes." },
    { title: "Approved & registered", body: "County building approval, NEMA licence and NCA project registration on file and available on request." },
    { title: "Your advocate, your contract", body: "The sale agreement is shared in full for review by your own advocate before you sign anything." },
  ],

  faqs: [
    { q: "Can I buy from outside Kenya?", a: "Yes. Most of our diaspora buyers reserve by video call, sign electronically and pay in USD or KES. We'll introduce you to an advocate and arrange a virtual tour of the show apartment." },
    { q: "What do I pay, and when?", a: "A deposit (typically 20%) when you sign, then the balance in monthly or quarterly instalments until completion. Paying in full earns a cash discount. Use the payment planner above to see your schedule." },
    { q: "Can I use a mortgage?", a: "Yes, for the balance on completion. We work with several Kenyan banks that offer mortgages on Ngazi homes; pre-approval takes a few weeks." },
    { q: "What will the service charge be?", a: "An estimated service charge per m² is published in the sales pack and covers security, cleaning, the amenities, lifts, water and backup power." },
    { q: "What happens if completion is late?", a: "The sale agreement sets out the completion date and what happens if it moves. Ask us for the clause; your advocate should read it." },
    { q: "Can you rent it out for me?", a: "Yes. An optional rental management service handles furnishing, tenants and maintenance for owners who don't live in Nairobi." },
  ],

  views: { low: viewLow, mid: viewMid, high: viewHigh, dusk: viewDusk },
} as const;
