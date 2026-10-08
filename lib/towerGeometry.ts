/**
 * Pure geometry for the Ngazi tower: no three.js here, so the numbers can be
 * shared by the 3D model, the elevation drawing and the copy ("1,702 fins")
 * and are guaranteed to agree.
 *
 * Coordinates in metres. x = east (+) / west (−), y = up, z = south (+) / north (−).
 */

import { TOWER, UNITS, type Unit } from "@/config/site";

export const PLATE = TOWER.plate; // 26 × 22
export const SLAB = 0.32;
export const ROOF_Y = TOWER.groundHeight + TOWER.levels * TOWER.floorHeight; // 92.4 m

export const levelY = (level: number) => (level <= 0 ? 0 : TOWER.groundHeight + (level - 1) * TOWER.floorHeight);

/** Height of the camera / eye on a level, for the lift display. */
export const levelForHeight = (y: number) => (y < TOWER.groundHeight ? 0 : Math.min(TOWER.levels + 1, Math.floor((y - TOWER.groundHeight) / TOWER.floorHeight) + 1));

// ── fins ───────────────────────────────────────────────────────────────────────
// Vertical fins every 1.3 m around the plate. Each is turned a little more than
// the one below and beside it, so the facade ripples: shade at noon, open views
// at dusk.
export type Fin = { x: number; z: number; rotY: number; level: number };
const FIN_SPACING = 1.3;

export function finsForLevel(level: number): Fin[] {
  const fins: Fin[] = [];
  const hw = PLATE.w / 2 + 0.35, hd = PLATE.d / 2 + 0.35;
  const sides: { from: [number, number]; to: [number, number]; normal: number }[] = [
    { from: [-hw, -hd], to: [hw, -hd], normal: 0 }, // north face
    { from: [hw, -hd], to: [hw, hd], normal: Math.PI / 2 }, // east face
    { from: [hw, hd], to: [-hw, hd], normal: Math.PI }, // south face
    { from: [-hw, hd], to: [-hw, -hd], normal: -Math.PI / 2 }, // west face
  ];
  let s = 0;
  sides.forEach((side) => {
    const len = Math.hypot(side.to[0] - side.from[0], side.to[1] - side.from[1]);
    const n = Math.floor(len / FIN_SPACING);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const x = side.from[0] + (side.to[0] - side.from[0]) * t;
      const z = side.from[1] + (side.to[1] - side.from[1]) * t;
      const ripple = Math.sin(level * 0.34 + s * 0.16) * 0.62; // ±35°
      fins.push({ x, z, rotY: side.normal + ripple, level });
      s++;
    }
  });
  return fins;
}

export const FIN_COUNT = Array.from({ length: TOWER.levels - 1 }, (_, i) => finsForLevel(i + 2).length).reduce((a, b) => a + b, 0);

// ── units ─────────────────────────────────────────────────────────────────────
/** Box (centre + size) of the glazed volume a unit occupies. */
export function unitBox(u: Pick<Unit, "level" | "slot">, penthouse: boolean) {
  const y = levelY(u.level) + SLAB / 2 + (TOWER.floorHeight - SLAB) / 2;
  const h = TOWER.floorHeight - SLAB - 0.05;
  const gap = 0.3;
  if (penthouse) {
    const w = PLATE.w / 2 - gap;
    return { x: u.slot === 0 ? -(w / 2 + gap / 2) : w / 2 + gap / 2, y, z: 0, w, h, d: PLATE.d - 0.4 };
  }
  // slots: 0 NE, 1 NW, 2 SW, 3 SE
  const w = PLATE.w / 2 - gap, d = PLATE.d / 2 - gap;
  const sx = u.slot === 0 || u.slot === 3 ? 1 : -1;
  const sz = u.slot === 0 || u.slot === 1 ? -1 : 1;
  return { x: sx * (w / 2 + gap / 2), y, z: sz * (d / 2 + gap / 2), w, h, d };
}

export const unitsOnLevel = (level: number) => UNITS.filter((u) => u.level === level);

// ── hero camera: street → lift ride up the facade → pull back ─────────────────
const ease = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export function heroCamera(p: number) {
  const a = 0.62 + 1.05 * ease(clamp01(p / 0.85)); // orbit angle around the tower
  let radius: number, y: number, lookY: number;
  if (p < 0.12) {
    const t = ease(p / 0.12);
    radius = lerp(52, 36, t);
    y = lerp(2.2, 9, t);
    lookY = lerp(46, 14, t);
  } else if (p < 0.72) {
    const t = ease((p - 0.12) / 0.6);
    radius = lerp(36, 33, t);
    y = lerp(9, 96, t);
    lookY = y + 3;
  } else {
    const t = ease((p - 0.72) / 0.28);
    radius = lerp(33, 178, t);
    y = lerp(96, 78, t);
    lookY = lerp(99, 47, t);
  }
  return { x: Math.cos(a) * radius, y, z: Math.sin(a) * radius, lookY };
}
