"use client";

/**
 * Tower3D: the Ngazi tower as a live architectural model (three.js).
 *
 * Built procedurally from config/site.ts and lib/towerGeometry.ts, so every
 * glazed volume IS a sellable home: hover it, click it, colour it by status.
 *
 *  mode "dusk"  hero: lit windows, scroll drives a lift ride up the facade
 *  mode "day"   explorer: white-card model, orbit, status colours, sun study
 *
 * Props are read through refs inside the render loop, so changing a selection
 * never rebuilds the scene. Renders only while on screen; falls back to
 * `fallback` if WebGL is unavailable.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { MotionValue } from "motion/react";
import { TOWER, UNITS, type Unit } from "@/config/site";
import { PLATE, SLAB, ROOF_Y, levelY, finsForLevel, unitBox, heroCamera } from "@/lib/towerGeometry";
import { usePrefersReducedMotion } from "@/lib/useMedia";

export type TowerProps = {
  mode: "dusk" | "day";
  className?: string;
  progress?: MotionValue<number>;
  interactive?: boolean;
  selectedCode?: string | null;
  hoverLevel?: number | null;
  showStatus?: boolean;
  matches?: (u: Unit) => boolean;
  sunHour?: number | null;
  rotateNudge?: number; // increment to rotate by a step (touch buttons)
  onHoverUnit?: (code: string | null) => void;
  onSelectUnit?: (code: string) => void;
  fallback?: ReactNode;
};

const COLORS = {
  day: {
    bg: "#E7E4DE",
    ground: "#E3E0D9",
    concrete: "#F1EEE8",
    fin: "#D9D2C4",
    glass: "#AFC0CF",
    context: "#F4F2EE",
    tree: "#C9CDBE",
    available: "#7D93F2",
    reserved: "#CFC6B6",
    sold: "#555A61",
    dim: "#DEDCD7",
    accent: "#2340E0",
  },
  dusk: {
    bg: "#1A2233",
    ground: "#15181D",
    concrete: "#8F8C88",
    fin: "#6E6458",
    glass: "#1B2430",
    context: "#252B33",
    tree: "#1E2622",
    accent: "#2340E0",
  },
};

export default function Tower3D(props: TowerProps) {
  const holder = useRef<HTMLDivElement>(null);
  const live = useRef(props);
  live.current = props;
  const [failed, setFailed] = useState(false);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const mode = live.current.mode;
    const C = mode === "day" ? COLORS.day : COLORS.dusk;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      setFailed(true);
      return;
    }
    const small = window.innerWidth < 768;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = mode === "day" ? 1.05 : 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.setAttribute("aria-hidden", "true");

    const scene = new THREE.Scene();
    if (mode === "day") {
      scene.background = new THREE.Color(C.bg);
      scene.fog = new THREE.Fog(C.bg, 260, 620);
    } else {
      // dusk sky: deep blue overhead, warm along the horizon
      const c = document.createElement("canvas");
      c.width = 4;
      c.height = 256;
      const g = c.getContext("2d")!;
      const grad = g.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, "#0E1628");
      grad.addColorStop(0.55, "#2A3550");
      grad.addColorStop(0.78, "#7A5A5A");
      grad.addColorStop(0.9, "#D9905A");
      grad.addColorStop(1, "#E9B07A");
      g.fillStyle = grad;
      g.fillRect(0, 0, 4, 256);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      scene.background = tex;
      scene.fog = new THREE.Fog("#3A3442", 220, 700);
    }

    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = mode === "day" ? 0.55 : 0.18;

    // ── lights ───────────────────────────────────────────────────────────────
    const hemi = new THREE.HemisphereLight(mode === "day" ? "#ffffff" : "#5A6E98", mode === "day" ? "#d8d2c6" : "#1a1410", mode === "day" ? 1.15 : 0.55);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(mode === "day" ? "#fff3e2" : "#ffb070", mode === "day" ? 2.4 : 1.25);
    sun.castShadow = true;
    sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
    const sc = sun.shadow.camera;
    sc.left = -95;
    sc.right = 95;
    sc.top = 95;
    sc.bottom = -95;
    sc.near = 10;
    sc.far = 420;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.04;
    scene.add(sun);
    scene.add(sun.target);
    sun.target.position.set(0, 30, 0);

    // ── materials ────────────────────────────────────────────────────────────
    const mats: THREE.Material[] = [];
    const std = (o: THREE.MeshStandardMaterialParameters) => {
      const m = new THREE.MeshStandardMaterial(o);
      mats.push(m);
      return m;
    };
    const concrete = std({ color: C.concrete, roughness: 0.86, metalness: 0 });
    const finMat = std({ color: C.fin, roughness: 0.6, metalness: mode === "day" ? 0.05 : 0.35 });
    const groundMat = std({ color: C.ground, roughness: 1 });
    const contextMat = std({ color: C.context, roughness: 0.9 });
    const treeMat = std({ color: C.tree, roughness: 1 });
    const waterMat = std({ color: "#3C5BEA", roughness: 0.1, metalness: 0.2, emissive: mode === "dusk" ? "#1F3CC8" : "#000000", emissiveIntensity: mode === "dusk" ? 0.9 : 0 });
    const railMat = std({ color: "#ffffff", roughness: 0.1, metalness: 0, transparent: true, opacity: mode === "day" ? 0.35 : 0.12 });

    const geos: THREE.BufferGeometry[] = [];
    const box = (w: number, h: number, d: number) => {
      const g = new THREE.BoxGeometry(w, h, d);
      geos.push(g);
      return g;
    };
    const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, cast = true, receive = true) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = cast;
      m.receiveShadow = receive;
      scene.add(m);
      return m;
    };

    // ground + context: a white-card city model
    const ground = new THREE.Mesh(new THREE.CircleGeometry(700, 64), groundMat);
    geos.push(ground.geometry);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const ctxWindows: THREE.Mesh[] = [];
    // dusk: a shared window-grid texture so the city reads as lit buildings, not blocks
    let windowTex: THREE.CanvasTexture | null = null;
    if (mode === "dusk") {
      const c = document.createElement("canvas");
      c.width = 128;
      c.height = 128;
      const g = c.getContext("2d")!;
      g.fillStyle = "#000";
      g.fillRect(0, 0, 128, 128);
      for (let yy = 0; yy < 8; yy++)
        for (let xx = 0; xx < 8; xx++) {
          if (rnd() < 0.42) {
            const warm = rnd() < 0.8;
            g.fillStyle = warm ? `rgba(255,${170 + Math.floor(rnd() * 40)},${90 + Math.floor(rnd() * 40)},${0.5 + rnd() * 0.5})` : "rgba(190,215,255,0.6)";
            g.fillRect(xx * 16 + 4, yy * 16 + 5, 8, 7);
          }
        }
      windowTex = new THREE.CanvasTexture(c);
      windowTex.colorSpace = THREE.SRGBColorSpace;
      windowTex.wrapS = windowTex.wrapT = THREE.RepeatWrapping;
      windowTex.magFilter = THREE.NearestFilter;
    }
    for (let i = 0; i < 90; i++) {
      const ang = rnd() * Math.PI * 2;
      const dist = 52 + rnd() * 210;
      const x = Math.cos(ang) * dist, z = Math.sin(ang) * dist;
      const w = 10 + rnd() * 18, d = 10 + rnd() * 16;
      const h = 6 + Math.pow(rnd(), 2.2) * (dist > 140 ? 70 : 34);
      const m = add(box(w, h, d), contextMat, x, h / 2, z, true, true);
      m.rotation.y = rnd() * 0.6 - 0.3;
      if (windowTex) {
        const tex = windowTex.clone();
        tex.needsUpdate = true;
        tex.repeat.set(Math.max(1, Math.round(w / 6)), Math.max(1, Math.round(h / 8)));
        tex.offset.set(rnd(), rnd());
        const lit = std({ color: "#20252c", emissive: "#ffffff", emissiveMap: tex, emissiveIntensity: 0.55 + rnd() * 0.5, roughness: 0.9 });
        m.material = lit;
        ctxWindows.push(m);
      }
    }
    for (let i = 0; i < 70; i++) {
      const ang = rnd() * Math.PI * 2;
      const dist = 24 + rnd() * 70;
      const r = 2 + rnd() * 2.6;
      const tx = Math.cos(ang) * dist, tz = Math.sin(ang) * dist;
      // keep the hero's street-level camera path clear
      if (Math.hypot(tx - 42, tz - 30) < 22 || Math.hypot(tx - 30, tz - 25) < 16) continue;
      const tree = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), treeMat);
      geos.push(tree.geometry);
      tree.position.set(tx, r + 1.2, tz);
      tree.castShadow = true;
      tree.receiveShadow = true;
      scene.add(tree);
    }

    // ── the tower ────────────────────────────────────────────────────────────
    // ground floor: recessed double-height lobby glass + columns
    const lobbyGlass = std({ color: mode === "day" ? "#B9C7D3" : "#2A2016", roughness: 0.12, metalness: 0.1, emissive: mode === "dusk" ? "#FFB765" : "#000000", emissiveIntensity: mode === "dusk" ? 0.55 : 0 });
    add(box(PLATE.w - 4, TOWER.groundHeight - 0.2, PLATE.d - 4), lobbyGlass, 0, TOWER.groundHeight / 2, 0);
    const colGeo = new THREE.CylinderGeometry(0.42, 0.42, TOWER.groundHeight, 12);
    geos.push(colGeo);
    for (const [cx, cz] of [
      [-12, -10], [-4, -10], [4, -10], [12, -10],
      [-12, 10], [-4, 10], [4, 10], [12, 10],
    ]) add(colGeo, concrete, cx, TOWER.groundHeight / 2, cz);

    const slabGeo = box(PLATE.w + 1.2, SLAB, PLATE.d + 1.2);
    const unitMeshes = new Map<string, THREE.Mesh>();
    const unitMats = new Map<string, THREE.MeshStandardMaterial>();
    const levelOfMesh = new Map<THREE.Object3D, string>();

    for (let level = 1; level <= TOWER.levels; level++) {
      const y = levelY(level);
      add(slabGeo, concrete, 0, y + SLAB / 2, 0);
      const ph = level >= TOWER.penthouseFrom;
      if (level === 1) {
        const amen = std({ color: mode === "day" ? "#C3CED8" : "#2B241B", roughness: 0.1, metalness: 0.1, emissive: mode === "dusk" ? "#FFC27A" : "#000000", emissiveIntensity: mode === "dusk" ? 0.8 : 0 });
        add(box(PLATE.w - 0.4, TOWER.floorHeight - SLAB - 0.05, PLATE.d - 0.4), amen, 0, y + SLAB / 2 + (TOWER.floorHeight - SLAB) / 2, 0);
        continue;
      }
      // party walls (cross) between homes
      const wallH = TOWER.floorHeight - SLAB;
      add(box(0.3, wallH, PLATE.d - 0.2), concrete, 0, y + SLAB / 2 + wallH / 2, 0);
      if (!ph) add(box(PLATE.w - 0.2, wallH, 0.3), concrete, 0, y + SLAB / 2 + wallH / 2, 0);

      UNITS.filter((u) => u.level === level).forEach((u) => {
        const b = unitBox(u, ph);
        const m = std({ color: C.glass, roughness: 0.08, metalness: 0.15, emissive: "#000000" }) as THREE.MeshStandardMaterial;
        if (mode === "dusk") {
          const lit = rnd() < 0.62;
          m.emissive.set(lit ? (rnd() < 0.85 ? "#FFA951" : "#FFD39A") : "#000000");
          m.emissiveIntensity = lit ? 0.25 + rnd() * 0.55 : 0;
        }
        const mesh = add(box(b.w, b.h, b.d), m, b.x, b.y, b.z, false, true);
        unitMeshes.set(u.code, mesh);
        unitMats.set(u.code, m);
        levelOfMesh.set(mesh, u.code);
      });

      // stacked corner balconies, alternating so the silhouette steps
      if (!ph) {
        const corners = level % 2 === 0 ? [0, 2] : [1, 3];
        corners.forEach((slot) => {
          const sx = slot === 0 || slot === 3 ? 1 : -1;
          const sz = slot === 0 || slot === 1 ? -1 : 1;
          add(box(5.2, 0.28, 3.4), concrete, sx * (PLATE.w / 2 + 1.4), y + 0.14, sz * (PLATE.d / 2 - 2.4));
          add(box(0.06, 1.05, 3.4), railMat, sx * (PLATE.w / 2 + 4), y + 0.8, sz * (PLATE.d / 2 - 2.4), false, false);
        });
      } else {
        // penthouse wrap-around terraces
        add(box(PLATE.w + 5, 0.3, 3), concrete, 0, y + 0.15, -(PLATE.d / 2 + 1.6));
      }
    }
    // roof: slab, pool, pergola, core
    add(slabGeo, concrete, 0, ROOF_Y + SLAB / 2, 0);
    add(box(18, 0.25, 4.5), waterMat, -1.5, ROOF_Y + SLAB + 0.15, -6.5, false, true);
    add(box(PLATE.w + 1.2, 1.1, 0.25), railMat, 0, ROOF_Y + 0.85, -(PLATE.d / 2 + 0.5), false, false);
    add(box(7, 4.2, 5.5), concrete, 6.5, ROOF_Y + 2.4, 5);
    for (let i = 0; i < 9; i++) add(box(0.3, 0.3, 9), concrete, -11 + i * 2.2, ROOF_Y + 3.4, 4.5);
    add(box(20, 0.3, 0.3), concrete, -2.2, ROOF_Y + 3.6, 0.2);

    // fins: one instanced mesh for the whole facade
    const allFins = Array.from({ length: TOWER.levels }, (_, i) => finsForLevel(i + 1)).flat();
    const finGeo = box(0.16, TOWER.floorHeight - 0.02, 0.95);
    const fins = new THREE.InstancedMesh(finGeo, finMat, allFins.length);
    const dummy = new THREE.Object3D();
    allFins.forEach((f, i) => {
      dummy.position.set(f.x, levelY(f.level) + TOWER.floorHeight / 2, f.z);
      dummy.rotation.set(0, f.rotY, 0);
      dummy.updateMatrix();
      fins.setMatrixAt(i, dummy.matrix);
    });
    fins.castShadow = true;
    fins.receiveShadow = true;
    scene.add(fins);

    // ── camera + controls ────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(small ? 40 : 30, 1, 1, 2000);
    let controls: OrbitControls | null = null;
    if (mode === "day") {
      camera.position.set(112, 70, 124);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 46, 0);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enablePan = false;
      controls.minDistance = 70;
      controls.maxDistance = 300;
      controls.minPolarAngle = 0.3;
      controls.maxPolarAngle = 1.48;
      controls.rotateSpeed = 0.55;
      controls.zoomSpeed = 0.6;
      controls.autoRotate = !reduce;
      controls.autoRotateSpeed = 0.35;
      // on touch screens the page must scroll: rotation is via buttons instead
      if (small || !window.matchMedia("(hover: hover)").matches) {
        controls.enableRotate = false;
        controls.enableZoom = false;
      }
      controls.addEventListener("start", () => {
        if (controls) controls.autoRotate = false;
      });
    }

    // ── picking ──────────────────────────────────────────────────────────────
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const pickables = [...unitMeshes.values()];
    let hovered: string | null = null;
    let downAt: { x: number; y: number } | null = null;
    const pick = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(pickables, false)[0];
      return hit ? levelOfMesh.get(hit.object) ?? null : null;
    };
    const onMove = (e: PointerEvent) => {
      if (!live.current.interactive) return;
      const code = pick(e);
      if (code !== hovered) {
        hovered = code;
        renderer.domElement.style.cursor = code ? "pointer" : "grab";
        live.current.onHoverUnit?.(code);
      }
    };
    const onDown = (e: PointerEvent) => (downAt = { x: e.clientX, y: e.clientY });
    const onUp = (e: PointerEvent) => {
      if (!live.current.interactive || !downAt) return;
      const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
      downAt = null;
      if (moved > 6) return;
      const code = pick(e);
      if (code) live.current.onSelectUnit?.(code);
    };
    const onLeave = () => {
      if (hovered) {
        hovered = null;
        live.current.onHoverUnit?.(null);
      }
    };
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointerleave", onLeave);

    // ── sizing / visibility ─────────────────────────────────────────────────
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      // keep roughly the same horizontal field on a portrait phone as on a laptop
      if (mode === "dusk") camera.fov = Math.min(58, Math.max(30, (2 * Math.atan(0.36 / camera.aspect) * 180) / Math.PI));
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) loop();
    });
    io.observe(el);

    // ── per-frame state ─────────────────────────────────────────────────────
    const tmpColor = new THREE.Color();
    const accent = new THREE.Color(C.accent);
    let targetY = 46;
    let lastNudge = live.current.rotateNudge ?? 0;
    let raf = 0;
    let t0 = performance.now();

    const applyUnitColours = () => {
      const P = live.current;
      const sel = P.selectedCode ?? null;
      const hoverLevel = P.hoverLevel ?? null;
      UNITS.forEach((u) => {
        const m = unitMats.get(u.code);
        if (!m) return;
        if (mode === "day") {
          const match = P.matches ? P.matches(u) : true;
          const base = !P.showStatus ? C.glass : !match ? (COLORS.day.dim) : COLORS.day[u.status];
          tmpColor.set(base);
          m.color.lerp(tmpColor, 0.18);
          const on = u.code === sel ? 1 : hoverLevel === u.level ? 0.35 : 0;
          m.emissive.copy(accent);
          m.emissiveIntensity += (on * 0.95 - m.emissiveIntensity) * 0.2;
        }
      });
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - t0) / 1000);
      t0 = now;
      const P = live.current;

      // sun: fixed late afternoon unless a sun study hour is given
      const h = P.sunHour ?? (mode === "day" ? 15.2 : 17.9);
      const a = ((h - 6.2) / 12.4) * Math.PI; // 0 sunrise (east) → π sunset (west)
      const elev = Math.max(0.04, Math.sin(a)) * (mode === "day" ? 1.05 : 0.18);
      const dir = new THREE.Vector3(Math.cos(a), elev, -0.28).normalize();
      sun.position.copy(dir.multiplyScalar(220)).add(new THREE.Vector3(0, 30, 0));
      if (mode === "day") sun.intensity = 0.6 + Math.max(0, Math.sin(a)) * 2.1;

      if (mode === "dusk") {
        const p = P.progress?.get() ?? 0;
        const c = heroCamera(p);
        camera.position.set(c.x, c.y, c.z);
        camera.lookAt(0, c.lookY, 0);
      } else if (controls) {
        // follow the selected/hovered level smoothly
        const sel = P.selectedCode ? UNITS.find((u) => u.code === P.selectedCode) : null;
        const focusLevel = sel?.level ?? null;
        const desired = focusLevel ? levelY(focusLevel) + 2 : 46;
        targetY += (desired - targetY) * 0.06;
        const dy = targetY - controls.target.y;
        controls.target.y += dy;
        camera.position.y += dy;
        if ((P.rotateNudge ?? 0) !== lastNudge) {
          const step = ((P.rotateNudge ?? 0) - lastNudge) * (Math.PI / 6);
          lastNudge = P.rotateNudge ?? 0;
          const off = camera.position.clone().sub(controls.target);
          off.applyAxisAngle(new THREE.Vector3(0, 1, 0), step);
          camera.position.copy(controls.target).add(off);
          controls.autoRotate = false;
        }
        controls.update(dt);
      }
      applyUnitColours();
      renderer.render(scene, camera);
    };

    const loop = () => {
      cancelAnimationFrame(raf);
      const tick = (now: number) => {
        if (!visible || document.hidden) return;
        frame(now);
        raf = requestAnimationFrame(tick);
      };
      t0 = performance.now();
      raf = requestAnimationFrame(tick);
    };
    loop();
    const onVis = () => !document.hidden && visible && loop();
    document.addEventListener("visibilitychange", onVis);
    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      setFailed(true);
    };
    renderer.domElement.addEventListener("webglcontextlost", onLost);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointerleave", onLeave);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      controls?.dispose();
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      fins.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      void ctxWindows;
    };
  }, [reduce]);

  if (failed) return <div className={props.className}>{props.fallback}</div>;
  return <div ref={holder} className={props.className} />;
}
