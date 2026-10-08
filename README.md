# Ngazi: residences on Riverside Drive, Nairobi

A sales website for an off-plan apartment tower in Nairobi. **Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 ·
Motion · Lenis · three.js**.

> "Ngazi" (Swahili: ladder, stairs) is an original concept brand. Every value the developer would change lives in
> **`config/site.ts`**; prices, availability and contacts are placeholders and say so on screen. Photos are
> replaceable stock (see `IMAGES.md`).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## The idea: *the building is the interface*

The site is a tower you ride. Sections are levels, the navigation is a lift panel, and the main tool is the
building itself, live in 3D, with every home on it.

| Level | Section | What happens |
|---|---|---|
| G | **Lobby** | The tower at dusk, built live in WebGL (1,610 instanced fins, lit windows, the city around it). Scroll and you ride the lift up the facade while the display counts levels and metres; at the roof the camera steps back over the city, then the lift doors close. |
| 1 | **Architecture** | Why the facade looks like that, with a north elevation drawn from the same geometry as the 3D model, and a title block. |
| 2 | **Find your home** | The sales tool. A white model of the tower where every home is coloured by status; turn it, pick a home on it or in the full stacking plan; filter by bedrooms and budget; run a sun study for any hour; open the drawn floor plan or the view from that floor; read the spec sheet. Your pick follows you down the page. |
| 3 | **Interiors** | Rooms as annotated photographs (spec pinned to the thing) and a materials board with a magnifying loupe. |
| 4 | **Amenities** | A section cut through the tower; point at an amenity and its level lights up in the drawing. |
| 5 | **Location** | A drive-time map: places by direction and minutes, not miles, with category filters. |
| 6 | **Payment plan** | Pick a home, deposit and way to pay (instalments, pay in full, mortgage). Live monthly figure, every payment to completion, a chart of paid-to-date against construction milestones, KES/USD, WhatsApp the plan. |
| 7 | **Progress & trust** | How far the build is (drawn and photographed), milestones, and how buyers' money and titles are protected. FAQ. |
| 8 | **Book a viewing** | Show apartment, video call or site tour; real days and times; the selected home pre-filled; `/api/visit` or WhatsApp. |
| — | **Footer** | An architectural title block. |

## Make it a real development

| What | Where |
|---|---|
| Name, tagline, domain | `config/site.ts` → `name`, `tagline`, `url` |
| Phone, **WhatsApp**, email, sales suite, hours | `config/site.ts` → `contact` |
| Colours | `config/site.ts` → `brand` |
| Tower (levels, floor heights, which unit types on which floors) | `config/site.ts` → `TOWER` |
| Unit types, areas, floor plans | `config/site.ts` → `UNIT_TYPES` (plans are simple room rectangles in metres) |
| Prices, floor premium, deposits, cash discount, completion date, exchange rate | `config/site.ts` → `PRICING` |
| **Availability** | `config/site.ts` → `buildUnits()` currently generates demo statuses. Replace with the real price list (or fetch it from the sales CRM). |
| Interiors, materials, amenities, places, progress, trust, FAQs | `config/site.ts` |
| Photography | `assets/images/` (same filename = no code change), then `python scripts/grade.py` |
| Viewing requests | set `VISIT_WEBHOOK_URL` (CRM, Zapier/Make, Slack). Without it, requests are only logged (no personal data in logs). |

Mortgage terms in the planner (`MORTGAGE` in `components/Pricing.tsx`) are indicative placeholders.

## Accessibility & performance

- The 3D model renders only while on screen, caps pixel ratio, pauses when hidden, and falls back to a photograph (hero) or drawing (explorer) without WebGL.
- Everything the 3D model does is also available without it: the stacking plan is a full list of buttons with labels for every home.
- `prefers-reduced-motion`: no lift ride (a still view of the tower instead), Lenis off, no auto-rotate, number tweens jump.
- Semantic landmarks, one `h1`, skip link, focus-trapped mobile keypad (Esc closes), native selects behind the custom displays, `aria-pressed`/`aria-expanded`, labelled form errors with focus moved to the first one.
- The homepage is statically prerendered; only `/api/visit` is dynamic.
