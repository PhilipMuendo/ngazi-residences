/** Shown while the 3D model loads (or if WebGL is unavailable): the tower, drafted. */
export default function TowerPlaceholder({ label = "Loading the 3D model" }: { label?: string }) {
  return (
    <div className="sheet absolute inset-0 flex flex-col items-center justify-center gap-4 text-cobalt">
      <svg viewBox="0 0 120 260" className="h-[60%] w-auto" aria-hidden="true" fill="none" stroke="currentColor">
        <rect x="20" y="20" width="80" height="230" strokeWidth="1.2" />
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={i} x1="20" x2="100" y1={250 - 18 - i * 9.2} y2={250 - 18 - i * 9.2} strokeWidth="0.6" opacity="0.6" />
        ))}
        <line x1="0" x2="120" y1="250" y2="250" strokeWidth="1.4" />
      </svg>
      <p className="data text-mid">{label}</p>
    </div>
  );
}
