"use client";

import { motion } from "motion/react";
import type { Plan } from "@/config/site";

/**
 * Draws a unit plan the way an architect would: poché walls, door swings,
 * glazing on the outside walls, room names with areas, a north point and a
 * scale bar. Everything comes from the room rectangles in config/site.ts.
 */

const WALL = 0.22; // m, internal wall thickness drawn
const EXT = 0.34; // m, external wall

function exteriorEdges(plan: Plan) {
  // exterior edges = room edges lying on the indoor bounding box
  const indoor = plan.rooms.filter((r) => !r.outdoor);
  const minX = Math.min(...indoor.map((r) => r.x)), minY = Math.min(...indoor.map((r) => r.y));
  const maxX = Math.max(...indoor.map((r) => r.x + r.w)), maxY = Math.max(...indoor.map((r) => r.y + r.h));
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  indoor.forEach((r) => {
    if (Math.abs(r.y - minY) < 1e-6) edges.push({ x1: r.x, y1: r.y, x2: r.x + r.w, y2: r.y });
    if (Math.abs(r.y + r.h - maxY) < 1e-6) edges.push({ x1: r.x, y1: r.y + r.h, x2: r.x + r.w, y2: r.y + r.h });
    if (Math.abs(r.x - minX) < 1e-6) edges.push({ x1: r.x, y1: r.y, x2: r.x, y2: r.y + r.h });
    if (Math.abs(r.x + r.w - maxX) < 1e-6) edges.push({ x1: r.x + r.w, y1: r.y, x2: r.x + r.w, y2: r.y + r.h });
  });
  return { edges, box: { minX, minY, maxX, maxY } };
}

export default function FloorPlan({ plan, className, animateKey }: { plan: Plan; className?: string; animateKey?: string }) {
  const all = plan.rooms;
  const minX = Math.min(...all.map((r) => r.x)) - 1.2;
  const minY = Math.min(...all.map((r) => r.y)) - 1.2;
  const maxX = Math.max(...all.map((r) => r.x + r.w)) + 1.2;
  const maxY = Math.max(...all.map((r) => r.y + r.h)) + 2.4;
  const { edges, box } = exteriorEdges(plan);
  const ink = "#2340E0";
  const draw = (i: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] as const, delay: 0.04 * i },
  });

  return (
    <svg key={animateKey} viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} className={className} role="img" aria-label="Floor plan">
      <defs>
        <pattern id="hatch" width="0.5" height="0.5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="0.5" stroke={ink} strokeWidth="0.05" opacity="0.5" />
        </pattern>
      </defs>

      {/* rooms */}
      {all.map((r, i) => (
        <g key={i}>
          <motion.rect
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            fill={r.outdoor ? "url(#hatch)" : "rgba(35,64,224,0.035)"}
            stroke={ink}
            strokeWidth={r.outdoor ? 0.05 : WALL}
            strokeLinejoin="miter"
            {...draw(i)}
          />
          <text x={r.x + r.w / 2} y={r.y + r.h / 2 - 0.1} textAnchor="middle" className="font-sans" fontSize={Math.min(0.52, r.w / 7)} fill="#141516">
            {r.label}
          </text>
          <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 0.55} textAnchor="middle" className="font-mono" fontSize="0.34" fill="#7E7A72">
            {(r.w * r.h).toFixed(1)} m²
          </text>
        </g>
      ))}

      {/* external walls, heavier */}
      <rect x={box.minX} y={box.minY} width={box.maxX - box.minX} height={box.maxY - box.minY} fill="none" stroke={ink} strokeWidth={EXT} />

      {/* glazing: a thin double line along the outside, broken at the corners */}
      {edges.map((e, i) => {
        const horiz = e.y1 === e.y2;
        const len = horiz ? e.x2 - e.x1 : e.y2 - e.y1;
        if (len < 1.4) return null;
        const inset = 0.45;
        const o = 0.11;
        return horiz ? (
          <g key={i} stroke="#ffffff" strokeWidth="0.06">
            <line x1={e.x1 + inset} y1={e.y1 - o} x2={e.x2 - inset} y2={e.y1 - o} />
            <line x1={e.x1 + inset} y1={e.y1 + o} x2={e.x2 - inset} y2={e.y1 + o} />
          </g>
        ) : (
          <g key={i} stroke="#ffffff" strokeWidth="0.06">
            <line x1={e.x1 - o} y1={e.y1 + inset} x2={e.x1 - o} y2={e.y2 - inset} />
            <line x1={e.x1 + o} y1={e.y1 + inset} x2={e.x1 + o} y2={e.y2 - inset} />
          </g>
        );
      })}

      {/* doors: leaf + swing */}
      {plan.doors.map((d, i) => {
        const a = (d.rot * Math.PI) / 180;
        const lx = d.x + Math.cos(a) * d.r, ly = d.y + Math.sin(a) * d.r;
        const b = a + Math.PI / 2;
        const sx = d.x + Math.cos(b) * d.r, sy = d.y + Math.sin(b) * d.r;
        return (
          <g key={i}>
            <line x1={d.x} y1={d.y} x2={sx} y2={sy} stroke="#E7E4DE" strokeWidth={WALL + 0.06} />
            <line x1={d.x} y1={d.y} x2={lx} y2={ly} stroke={ink} strokeWidth="0.06" />
            <path d={`M ${lx} ${ly} A ${d.r} ${d.r} 0 0 1 ${sx} ${sy}`} fill="none" stroke={ink} strokeWidth="0.04" strokeDasharray="0.12 0.1" />
          </g>
        );
      })}

      {/* overall dimension */}
      <g stroke={ink} strokeWidth="0.04" fill={ink}>
        <line x1={box.minX} y1={box.maxY + 0.9} x2={box.maxX} y2={box.maxY + 0.9} />
        <line x1={box.minX} y1={box.maxY + 0.7} x2={box.minX} y2={box.maxY + 1.1} />
        <line x1={box.maxX} y1={box.maxY + 0.7} x2={box.maxX} y2={box.maxY + 1.1} />
        <text x={(box.minX + box.maxX) / 2} y={box.maxY + 0.75} textAnchor="middle" className="font-mono" fontSize="0.34" stroke="none">
          {(box.maxX - box.minX).toFixed(1)} m
        </text>
      </g>

      {/* north point + scale bar */}
      <g transform={`translate(${maxX - 1.1} ${maxY - 1.6})`}>
        <circle r="0.5" fill="none" stroke="#141516" strokeWidth="0.04" />
        <path d="M0,-0.5 L0.22,0.25 L0,0.1 L-0.22,0.25 Z" fill="#141516" />
        <text y="-0.65" textAnchor="middle" className="font-mono" fontSize="0.3" fill="#141516">
          N
        </text>
      </g>
      <g transform={`translate(${minX + 1} ${maxY - 1.1})`} className="font-mono" fontSize="0.28" fill="#141516">
        {[0, 1, 2, 3, 4].map((m) => (
          <rect key={m} x={m} y={0} width={1} height={0.18} fill={m % 2 ? "#141516" : "none"} stroke="#141516" strokeWidth="0.03" />
        ))}
        <text x="0" y="0.6">0</text>
        <text x="5" y="0.6" textAnchor="end">
          5 m
        </text>
      </g>
    </svg>
  );
}
