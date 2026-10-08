import { ImageResponse } from "next/og";
import { site, TOWER, UNITS, PRICING } from "@/config/site";

export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card: the tower drawn in elevation on blueprint paper. */
export default function OpengraphImage() {
  const floors = Array.from({ length: TOWER.levels });
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: site.brand.paper, color: site.brand.graphite, fontFamily: "sans-serif", padding: 64 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 10, fontWeight: 700 }}>{site.wordmark}</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 104, lineHeight: 0.92, letterSpacing: -4, fontWeight: 300 }}>
            <span>Live a level</span>
            <span style={{ color: site.brand.accent }}>above.</span>
          </div>
          <div style={{ display: "flex", fontSize: 24, color: site.brand.mid }}>
            {UNITS.length} homes · {TOWER.levels} levels · Riverside Drive, Nairobi · {PRICING.completionLabel}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", width: 250, height: "100%", borderBottom: `4px solid ${site.brand.graphite}` }}>
          <div style={{ display: "flex", flexDirection: "column", border: `3px solid ${site.brand.accent}`, marginLeft: 50, marginRight: 50 }}>
            {floors.map((_, i) => (
              <div key={i} style={{ display: "flex", height: 19, borderTop: i ? `1.5px solid ${site.brand.accent}` : "none", background: i % 5 === 2 ? "rgba(35,64,224,0.18)" : "transparent" }} />
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
