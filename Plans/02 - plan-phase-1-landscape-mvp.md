# Phase 1 — Landscape MVP (Detailed Plan)

**Goal:** A living 3D winter landscape in the browser — terrain, landmarks, and props authored in Blender, with a shader sky, fog, free-fly camera, and color grading.
**Output:** Your world exists in the browser. Open the site and you're standing in Hemsedal.
**Branch:** `2-landscape-mvp` (already checked out)
**Estimated time:** 3–4 weeks
**Approach:** Route B — Fully authored in Blender (terrain + landmarks + props in one scene, exported as glTF)

> **Read `Plans/03 - world-map.md` first.** It defines the coordinate system, zones, and exact placement of every element. All Blender work and all code placement references that map.

---

## Phase 0 → Phase 1 Handoff Recap

Phase 0 delivered:
- Next.js 16 + TS + R3F + drei + three + GSAP + Lenis + Motion + Zustand scaffold
- Design tokens in `src/styles/tokens.css` (placeholder palette)
- CSS reset + base layers in `src/styles/base.css`
- Fixed full-screen canvas container (`.canvas-container`) behind DOM content
- Deployed to Vercel on `1-setup-initial-framework`

Phase 1 is a **rewrite of the approach**: instead of procedural terrain, everything is authored in Blender. The current `Terrain.tsx` (procedural shader) will be replaced with a glTF scene loader.

---

## Where Your Artistic Flair Goes

This phase is **80% art direction, 20% engineering**. The Blender scene is the canvas; you are the painter. Here is exactly where and when to apply your creative judgment:

| # | Moment | What You Decide | Where in the Plan |
|---|--------|-----------------|------------------|
| 🎨 **A** | **Palette selection** | The 5–7 core colors that define the world. Snow, rock, grass, sky, fog, accent. Set in CSS tokens and used as vertex colors in Blender. | Step 2 — before any modeling |
| 🎨 **B** | **Terrain character** | How dramatic are the mountains? Jagged alpine peaks? Rolling fjord hills? Sharp ridges or soft valleys? You sculpt this directly in Blender. | Step 3 — terrain sculpting |
| 🎨 **C** | **Landmark concepts** | What are the 2–3 hero landmarks? A weathered cabin? A stone cairn? A half-buried ski lift? These tell the story of Hemsedal. Sketch them, then model in Blender. | Step 4 — landmark modeling |
| 🎨 **D** | **Landmark placement** | Where does each landmark sit? On a ridge overlooking a valley? At a trail junction? Beside the frozen lake? You compose the world in Blender, positions documented in the world map. | Step 4 — landmark placement |
| 🎨 **E** | **Atmosphere mood** | Fog density, sky gradient (dawn? overcast? deep twilight?), time-of-day feel. Crisp morning, moody afternoon, blue-hour dusk? | Step 7 — sky + atmosphere |
| 🎨 **F** | **Camera vantage points** | Where does the camera rest when idle? What's the "hero shot"? Place cameras in Blender, export their positions. | Step 8 — camera framing |
| 🎨 **G** | **Color grading** | Subtle post-scene color shifts — warm shadows, cool highlights, desaturation, contrast. The "film look." Applied as a global shader pass. | Step 9 — color grading |

> **Rule:** If a parameter is exposed as a Leva control or a CSS token, it's yours to tune. If it's baked into the Blender scene, change it in Blender and re-export. The tuning loops (Steps 3, 4, 7, 9) are where you spend most of your time — that's intentional.

---

## Architecture Overview

```
websitehemsedal/src/
├── app/
│   ├── layout.tsx              # Unchanged from Phase 0
│   ├── page.tsx                # Updated: mounts Scene + minimal overlay UI
│   └── globals.css             # Unchanged (imports tokens + base)
├── components/
│   ├── Scene.tsx               # REWRITTEN — loads Blender glTF scene + sky
│   ├── World.tsx               # NEW — loads terrain + landmarks glTF scene
│   ├── Sky.tsx                 # KEPT — gradient sky dome shader
│   ├── FreeFlyCamera.tsx       # KEPT — dev-only camera controls
│   └── Water.tsx               # NEW (optional) — ripple shader plane at lake
├── lib/
│   ├── shaders/                # Only sky + grading shaders remain
│   │   ├── sky.vert.ts         # Sky dome vertex
│   │   ├── sky.frag.ts         # Sky gradient fragment + sun glow
│   │   ├── grading.vert.ts     # Full-screen grading pass vertex
│   │   └── grading.frag.ts     # Color grading fragment (exposure, contrast, etc.)
│   ├── worldMap.ts             # NEW — world coordinates, zones, landmark refs
│   └── cameraPositions.ts      # Hero camera shots (from Blender cameras)
└── styles/
    ├── tokens.css              # UPDATED — real palette (🎨 A)
    └── base.css                # Unchanged
```

**Removed from the procedural approach:**
- `src/components/Terrain.tsx` — replaced by `World.tsx` (glTF loader)
- `src/lib/shaders/terrain.vert.ts` — no longer needed (terrain is a mesh)
- `src/lib/shaders/terrain.frag.ts` — no longer needed (vertex colors baked in Blender)
- `src/lib/terrain/heightmap.ts` — no longer needed (no CPU height function)
- `src/lib/terrain/constants.ts` — replaced by `worldMap.ts`
- `src/components/Landmark.tsx` — landmarks are now part of the Blender scene

**New dependencies:**
```bash
cd websitehemsedal
npm install leva                    # Live shader/param tuning UI (sky, grading)
npm install -D @gltf-transform/cli  # glTF optimization pipeline
```

**Blender file location:** `assets/blender/hemsedal-landscape.blend` (git LFS recommended for .blend and texture files)

---

## Step-by-Step Plan

### Step 1 — Define the World Map

**What:** Before touching Blender, define the coordinate system and the layout of the world. This document is the single source of truth for all placement decisions.

**Create `Plans/03 - world-map.md`** with:
- World coordinate system (units, origin, axes, scale — 1 Blender unit = 1 meter = 1 world unit in three.js)
- A top-down sketch of the landscape zones (valleys, ridges, peaks, frozen lake, trail)
- Landmark positions with exact (x, y, z) coordinates
- Camera positions for hero shots
- Packing checklist item locations (where in the scene each category of gear "lives")

**Verification:** The world map document exists and is readable. Every subsequent step references it.

---

### Step 2 — Define Your Palette 🎨 A

**What:** Choose 5–7 colors that define the Hemsedal winter world. These are used in:
- `src/styles/tokens.css` (CSS custom properties for DOM/UI)
- Blender vertex colors (painted on the terrain and landmarks)
- Sky gradient shader
- Fog color

**Action:** Open `src/styles/tokens.css` and set the palette. Then use the same colors in Blender's viewport material colors so what you see in Blender matches what renders in the browser.

**Mood options:**
- **Crisp Nordic:** Cold blue-greys, white snow, muted pine green, warm amber accent (cabin lights)
- **Moody Alpine:** Deep slate, ice blue, desaturated purple shadows, pale gold sky
- **Stark Winter:** Near-black rock, brilliant white snow, single warm accent, pale blue sky

**Current palette** (refine as you go):
```css
:root {
  --color-snow:    #e8edf2;   /* Snow caps, highlights */
  --color-rock:    #3a4250;   /* Exposed rock, steep faces */
  --color-grass:   #2d4a3e;   /* Alpine ground (muted green) */
  --color-valley:  #1a2028;   /* Low areas, shadowed valleys */
  --color-fog:     #2a3542;   /* Atmospheric fog */
  --color-sky-top: #1c2836;   /* Sky zenith */
  --color-sky-hor: #4a6076;   /* Sky horizon */
  --color-accent:  #e8a54b;   /* Warm amber — cabin lights, UI highlights */
}
```

**🎨 Artistic moment:** Spend 30–60 minutes on this. Look at reference images of Norwegian winter landscapes, Hemsedal specifically. Take screenshots, extract colors. This palette is the brand — it must be consistent between CSS, Blender, and shaders.

---

### Step 3 — Model the Terrain in Blender 🎨 B

**What:** Sculpt the Hemsedal landscape in Blender. This is the foundation — everything else sits on top of it.

**Prerequisites:** Blender 4.x installed.

**Blender scene setup:**
1. Create `assets/blender/hemsedal-landscape.blend`
2. Set scene units to **Meters**, scale 1.0
3. Set the 3D cursor to world origin (0, 0, 0) — this is the center of the world
4. Create a collection called `Terrain`

**Terrain modeling workflow:**
1. **Base shape:** Start with a large plane (e.g., 500×500 units), subdivide to ~128×128 segments
2. **Sculpt:** Use Blender's sculpt mode to carve valleys, raise ridges, and shape peaks. Reference photos of Hemsedal and Norwegian mountain terrain.
3. **Zones** (see world map for exact coordinates):
   - **Valley floor** (center, low elevation): flat-ish area where the cabin sits
   - **Ridges** (north and east): jagged peaks with snow caps
   - **Frozen lake** (southwest): a flat, slightly depressed area for the water plane
   - **Trail** (winding path): a visible trail from the valley up toward a ridge, marked by cairns
4. **Retopologize / decimate:** Target < 150k–300k triangles for the terrain mesh. Use the Decimate modifier.
5. **UV unwrap:** Unwrap the terrain for potential texture work later.
6. **Vertex colors:** Paint the terrain with vertex colors matching the palette:
   - Snow (`--color-snow`) on peaks and high ground
   - Rock (`--color-rock`) on steep faces
   - Grass (`--color-grass`) on mid-altitude slopes
   - Valley (`--color-valley`) in low, shadowed areas
   - Use Blender's Vertex Paint mode, set brush colors to match the CSS tokens exactly

**🎨 Artistic moment — terrain character:**

| Look | How to sculpt |
|------|--------------|
| Gentle rolling hills | Soft, wide brush strokes, low amplitude |
| Dramatic alpine peaks | Sharp crease brush on ridges, high amplitude, deep valleys between |
| Jagged ridges | Draw sharp creases with the Crease brush, then smooth the valleys |
| Wide valley + distant peaks | Flat valley floor (masked), tall peaks pushed to the edges |

**Naming convention:** `terrain_main` (the hero terrain mesh).

**Verification:** Terrain looks like a winter mountain landscape in Blender's viewport with vertex colors matching the palette.

---

### Step 4 — Model Landmarks & Props in Blender 🎨 C + 🎨 D

**What:** Model 2–3 hero landmarks and scatter supporting props (trees, rocks) directly in the terrain scene at their final world positions. Everything is placed in Blender — no runtime placement needed.

**Landmark concepts — pick 2–3 hero landmarks that tell the Hemsedal story:**

| Landmark | Story | Difficulty | Poly target | World map zone |
|----------|-------|-----------|-------------|----------------|
| Weathered wooden cabin (stabbur) | "Someone lives here. This is a place." | Medium | 5–15k tris | Valley floor |
| Stone cairn (steinhaufen) | "A marker on the trail." | Easy | 1–3k tris | Ridge / trail junction |
| Half-buried ski lift pylon | "The mountain is used. Winter sports history." | Medium | 3–8k tris | Mid-slope |
| Frozen waterfall / ice formation | "Nature's architecture." | Easy | 2–5k tris | Cliff face |
| Small stone bridge | "A path crosses here." | Medium | 4–10k tris | Over stream in valley |

**Blender workflow for each landmark:**

1. **Model** in Blender. Keep it stylized/low-poly — this is a web asset, not a film render.
2. **Place at final position** — use the world map coordinates. The landmark sits in the scene where it will appear in the browser.
3. **UV unwrap** — even if using vertex colors.
4. **Vertex colors** — paint with the palette colors. Cabin: warm wood tones + amber windows. Cairn: weathered grey stones. Ski pylon: rust oranges and dark metal.
5. **Simplify** — target the poly counts above. Decimate modifier.
6. **Origin at base** — set the origin to the bottom-center of each model for clean transforms.

**Supporting props (scatter in the scene):**
- Pine trees (instanced or duplicated) along the valley edges and lower slopes
- Rocks and boulders scattered on ridges
- A trail path (can be part of the terrain vertex colors or a separate decal mesh)

**Collections organization:**
```
Blender Outliner:
├── Terrain
│   └── terrain_main
├── Landmarks
│   ├── cabin_stabbur
│   ├── cairn_trail_marker
│   └── ski_lift_pylon
├── Props
│   ├── pine_tree_01 … pine_tree_05
│   ├── rock_01 … rock_08
│   └── bridge_stone
├── Cameras
│   ├── cam_hero_overview
│   ├── cam_cabin_foreground
│   └── cam_ridge_overlook
└── Markers (empties, not exported)
    ├── marker_lake_center
    └── marker_trail_start
```

**🎨 Artistic moment — landmark design:**

Don't make generic assets — make *Hemsedal* assets:
- The cabin should look like a real Norwegian stabbur — horizontal logs, grass roof, small windows with warm amber light
- The cairn should look hand-stacked, slightly irregular, weathered grey stones
- The ski pylon should show rust, bent metal, cables sagging with disuse

**🎨 Artistic moment — placement (🎨 D):**

Compose the world in Blender. Place each landmark where it tells the best story:
- Cabin: in the valley, slightly off-center, with a view of the peaks through the valley opening
- Cairn: on the ridge, visible from the valley, marking the trail
- Ski pylon: on a mid-slope, slightly tilted as if abandoned, half-buried in snow

Update `Plans/03 - world-map.md` with the final coordinates after placement.

**Verification:** The Blender scene shows a composed winter landscape with terrain, landmarks, and props at their final positions.

---

### Step 5 — Bake Lighting & Optimize

**What:** Bake ambient occlusion / lightmap into the terrain and landmarks. Optimize the scene for web.

**Baking workflow:**
1. **Set up a sun light** in Blender matching the desired time-of-day (see Step 7 for mood options)
2. **Bake AO** to a texture (512×512 or 1024×1024 for the terrain, smaller for landmarks)
3. **Bake the lightmap** — render the scene's lighting to a texture and bake it onto the terrain UVs
4. **Alternative:** rely purely on vertex colors + the in-browser lighting (ambient + directional). This is simpler and matches the current code's approach. Choose based on how much baked realism you want.

**Optimization:**
1. Apply all modifiers (Decimate, etc.)
2. Remove hidden faces, doubles, and unused materials
3. Check triangle counts per mesh (terrain < 300k, each landmark < 15k)

**Verification:** Scene is clean, modifiers applied, poly counts within budget.

---

### Step 6 — Export & Compress glTF

**What:** Export the Blender scene as glTF and optimize for web delivery.

**Export settings:**
- File → Export → glTF 2.0
- Format: **glTF Binary (.glb)**
- Transform: **+Y Up** (glTF standard)
- Geometry: ✅ Apply Modifiers, ✅ Normals, ✅ Colors (vertex colors), ✅ UVs
- Materials: ✅ Export (vertex colors carry the palette)
- Compression: None (we'll compress with gltf-transform)
- **Do NOT export cameras or markers** — camera positions go into `cameraPositions.ts` manually

**Output:** `websitehemsedal/public/models/hemsedal-landscape.glb`

**Optimize:**
```bash
cd websitehemsedal
npx @gltf-transform/cli optimize public/models/hemsedal-landscape.glb public/models/hemsedal-landscape.glb --compress draco --texture-compress ktx2
```

**Verify the .glb:** Open in [gltf.report](https://gltf.report) or Blender's glTF preview. Check that vertex colors are present and the scene looks correct.

**Verification:** The optimized .glb is < 10 MB and loads correctly in gltf.report.

---

### Step 7 — Load the Scene in R3F + Sky & Atmosphere 🎨 E

**What:** Replace the procedural `Terrain.tsx` with a `World.tsx` component that loads the Blender glTF scene. Add the shader sky dome and scene fog.

**`src/components/World.tsx`** (new — replaces `Terrain.tsx`):
```tsx
"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

const MODEL_PATH = "/models/hemsedal-landscape.glb";

export default function World() {
  const { scene } = useGLTF(MODEL_PATH);

  // Clone and configure materials
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false;
        child.receiveShadow = false;

        const hasVertexColors = child.geometry.attributes.color !== undefined;

        child.material = new THREE.MeshStandardMaterial({
          vertexColors: hasVertexColors,
          color: hasVertexColors ? undefined : new THREE.Color("#8a97a5"),
          roughness: 0.9,
          metalness: 0.0,
          fog: true,
        });
      }
    });
    return clone;
  }, [scene]);

  return <primitive object={clonedScene} />;
}

// Preload
useGLTF.preload(MODEL_PATH);
```

**`src/components/Sky.tsx`** (keep existing, minor updates):
- Keep the gradient sky dome shader
- Keep Leva controls for sky colors and gradient power
- Keep sun glow

**Update `src/components/Scene.tsx`:**
```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Leva } from "leva";
import World from "./World";
import Sky from "./Sky";
import FreeFlyCamera from "./FreeFlyCamera";

export default function Scene() {
  return (
    <div className="canvas-container">
      <Leva collapsed fill={false} oneLineLabels={false} />

      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 15, 40], fov: 60, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Scene background matches fog color */}
        <color attach="background" args={["#1a2028"]} />

        {/* Scene fog */}
        <fog attach="fog" args={["#2a3542", 80, 400]} />

        {/* Lighting — vertex colors carry the palette, this adds depth */}
        <ambientLight intensity={0.4} color="#334455" />
        <directionalLight
          position={[50, 80, 30]}
          intensity={1.0}
          color="#fff5e0"
        />

        <Suspense fallback={null}>
          <Sky />
          <World />
        </Suspense>

        {/* Dev-only free-fly camera */}
        <FreeFlyCamera />
      </Canvas>
    </div>
  );
}
```

**Delete these files** (no longer needed):
- `src/components/Terrain.tsx`
- `src/components/Landmark.tsx`
- `src/lib/shaders/terrain.vert.ts`
- `src/lib/shaders/terrain.frag.ts`
- `src/lib/terrain/heightmap.ts`
- `src/lib/terrain/constants.ts`

**🎨 Artistic moment — atmosphere mood (🎨 E):**

| Mood | Sky top | Sky horizon | Fog color | Fog near/far | Sun intensity |
|------|---------|-------------|-----------|-------------|---------------|
| Crisp winter morning | `#d4e4f0` | `#8fb8d4` | `#8fb8d4` | 60 / 300 | 1.2 |
| Overcast afternoon | `#3a4a5a` | `#5a6a7a` | `#4a5a6a` | 50 / 250 | 0.6 |
| Blue-hour dusk | `#1a2035` | `#4a5a7a` | `#2a3550` | 70 / 350 | 0.8 |
| Stormy dramatic | `#1a1f28` | `#3a4555` | `#252f3a` | 40 / 200 | 0.4 |
| Golden alpenglow | `#2a3040` | `#c47a4a` | `#4a4a55` | 80 / 400 | 1.0 |

Tune in Leva: Sky colors, gradient power, fog density (via the `fog` component args or a Leva-controlled uniform).

**Verification:** `npm run dev` → the Blender-authored landscape renders in the browser with sky, fog, and lighting. No console errors.

---

### Step 8 — Camera Framing 🎨 F

**What:** Place cameras in Blender at the hero shot positions, export their coordinates, and save them for the Phase 2 camera spline.

**In Blender:**
1. Add cameras to the `Cameras` collection at your chosen hero shot positions
2. Frame each shot in the camera view (Numpad 0)
3. Note the position (x, y, z) and rotation for each camera
4. **Do not export cameras** — just record the coordinates

**In code — `src/lib/cameraPositions.ts`:**
```typescript
// Hero camera shots — positions from Blender cameras
// Coordinate system: 1 unit = 1 meter, Y is up

export interface CameraShot {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number]; // Euler XYZ in radians
  label: string;
}

export const CAMERA_HERO_SHOTS: CameraShot[] = [
  {
    id: "overview",
    position: [0, 30, 80],
    rotation: [-0.35, 0, 0],
    label: "Wide valley overview",
  },
  {
    id: "cabin",
    position: [-15, 4, 12],
    rotation: [-0.1, -0.5, 0],
    label: "Cabin foreground with peaks behind",
  },
  {
    id: "ridge",
    position: [35, 12, -25],
    rotation: [-0.4, 2.5, 0],
    label: "Ridge overlook with cairn",
  },
  // Add more as you find them with the FreeFlyCamera
];
```

**Using the FreeFlyCamera:** Click the viewport, fly with WASD + Space/Shift, and scout additional positions. Note coordinates and add them to `cameraPositions.ts`.

**🎨 Artistic moment — finding the hero shot:**

Fly around the authored scene until you find 3–5 camera positions that frame the landscape beautifully:
- A wide establishing shot (high, distant, whole valley visible)
- A ground-level shot (standing in the snow, looking up at peaks)
- A shot framed by a landmark (cabin in foreground, mountains behind)
- A dramatic low angle (looking up at a ridge)

**Verification:** Camera positions are saved in `cameraPositions.ts`. The FreeFlyCamera works for scouting.

---

### Step 9 — Global Color Grading Shader 🎨 G

**What:** A full-screen post-process color grading pass — the "film look." This is a shader, not a Blender bake, so it's infinitely tunable via Leva.

**Approach:** Use a render pass or a full-screen quad with a grading shader. For Phase 1, the simplest approach is a shader applied to a full-screen plane in front of the camera, or use `@react-three/postprocessing` in Phase 4.

For Phase 1, add grading as a Leva-controlled overlay that adjusts the renderer's tone mapping:

```tsx
// In Scene.tsx or a dedicated Grading.tsx component
"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useControls } from "leva";

export default function Grading() {
  const { gl } = useThree();

  const params = useControls("Color Grading", {
    exposure:       { value: 1.0, min: 0.5, max: 2.0, step: 0.01 },
    contrast:       { value: 1.05, min: 0.8, max: 1.3, step: 0.01 },
    saturation:     { value: 0.9, min: 0.0, max: 1.5, step: 0.01 },
    highlightTint:  { value: 0.1, min: 0, max: 0.5, step: 0.01 },
    shadowTint:     { value: 0.2, min: 0, max: 0.5, step: 0.01 },
    vignetteStrength: { value: 0.3, min: 0, max: 1.0, step: 0.05 },
  });

  useEffect(() => {
    gl.toneMappingExposure = params.exposure;
  }, [gl, params.exposure]);

  // For contrast, saturation, tints, vignette — use a postprocessing pass
  // In Phase 4, replace with @react-three/postprocessing EffectComposer

  return null;
}
```

**🎨 Artistic moment — the film look (🎨 G):**

| Look | exposure | contrast | saturation | highlightTint | shadowTint | vignette |
|------|----------|----------|------------|---------------|------------|----------|
| Clean digital | 1.0 | 1.0 | 1.0 | 0.0 | 0.0 | 0.0 |
| Film — cool shadows | 1.0 | 1.08 | 0.85 | 0.1 | 0.25 | 0.3 |
| Film — warm nostalgia | 1.05 | 1.1 | 0.8 | 0.2 | 0.1 | 0.35 |
| Cinematic dark | 0.9 | 1.15 | 0.75 | 0.1 | 0.3 | 0.4 |
| Faded vintage | 1.0 | 0.9 | 0.6 | 0.15 | 0.1 | 0.25 |

Start subtle. Less is more.

---

### Step 10 — Create `src/lib/worldMap.ts`

**What:** A TypeScript module that encodes the world map — zones, landmark positions, and packing item locations. This is the code-side mirror of `Plans/03 - world-map.md`.

```typescript
// src/lib/worldMap.ts
// Code-side mirror of Plans/03 - world-map.md
// All coordinates in world units (1 unit = 1 meter, Y is up)

export interface Zone {
  id: string;
  name: string;
  /** Axis-aligned bounding box [minX, minZ, maxX, maxZ] */
  bounds: [number, number, number, number];
  /** Center point [x, y, z] */
  center: [number, number, number];
  description: string;
}

export const ZONES: Zone[] = [
  {
    id: "valley-floor",
    name: "Valley Floor",
    bounds: [-40, -40, 40, 40],
    center: [0, 0, 0],
    description: "Flat valley floor. Cabin, trailhead, gathering area.",
  },
  {
    id: "north-ridge",
    name: "North Ridge",
    bounds: [-60, 40, 60, 120],
    center: [0, 25, 80],
    description: "Jagged peaks with snow caps. Cairn trail marker.",
  },
  {
    id: "frozen-lake",
    name: "Frozen Lake",
    bounds: [-80, -80, -20, -20],
    center: [-50, 0, -50],
    description: "Flat frozen lake bed. Water plane location.",
  },
  {
    id: "east-slope",
    name: "East Slope",
    bounds: [40, -20, 100, 60],
    center: [70, 15, 20],
    description: "Mid-mountain slope. Ski lift pylon. Ski terrain.",
  },
];

export interface LandmarkRef {
  id: string;
  name: string;
  /** Position in the Blender scene [x, y, z] */
  position: [number, number, number];
  zone: string;
  /** What this landmark represents in the packing checklist */
  packingCategory?: string;
}

export const LANDMARK_REFS: LandmarkRef[] = [
  {
    id: "cabin",
    name: "Stabbur Cabin",
    position: [12, 0, -8],
    zone: "valley-floor",
    packingCategory: "Accommodation & indoor gear",
  },
  {
    id: "cairn",
    name: "Trail Cairn",
    position: [-5, 0, 65],
    zone: "north-ridge",
    packingCategory: "Navigation & safety",
  },
  {
    id: "ski-pylon",
    name: "Ski Lift Pylon",
    position: [55, 0, 15],
    zone: "east-slope",
    packingCategory: "Ski & snowboard gear",
  },
];

// World bounds — used for camera clamping and fog tuning
export const WORLD_BOUNDS = {
  minX: -150,
  maxX: 150,
  minZ: -150,
  maxZ: 150,
  maxHeight: 60,
} as const;
```

**Verification:** `worldMap.ts` compiles without errors and exports zones, landmarks, and bounds.

---

### Step 11 — Update the Page & Clean Up

**What:** Replace the placeholder `page.tsx` overlay and remove all procedural terrain code.

**`src/app/page.tsx`:**
```tsx
import Scene from "@/components/Scene";

export default function Home() {
  return (
    <>
      <Scene />
      <main
        className="content-layer"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "var(--space-xl)",
          pointerEvents: "none",
        }}
      >
        <h1
          style={{
            fontSize: "var(--step-5)",
            fontWeight: 700,
            color: "var(--color-text)",
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Hemsedal
        </h1>
        <p
          style={{
            fontSize: "var(--step-1)",
            color: "var(--color-text-muted)",
            margin: 0,
            marginTop: "var(--space-xs)",
          }}
        >
          Phase 1 — Landscape MVP
        </p>
      </main>
    </>
  );
}
```

**Delete files:**
- `src/components/Terrain.tsx`
- `src/components/Landmark.tsx`
- `src/lib/shaders/terrain.vert.ts`
- `src/lib/shaders/terrain.frag.ts`
- `src/lib/terrain/heightmap.ts`
- `src/lib/terrain/constants.ts`
- `src/lib/landmarks.ts` (replaced by `worldMap.ts`)

**Verification:** `npm run dev` → Blender-authored landscape renders with sky, fog, and title overlay. No placeholder text, no procedural terrain.

---

### Step 12 — Performance Check

**What:** Verify the scene runs at 60fps on a mid-tier machine.

```bash
cd websitehemsedal
npm run build
npm run start
# Open localhost:3000, open DevTools → Performance → record 10 seconds
```

**Checklist:**
- [ ] FPS ≥ 60 on your dev machine
- [ ] Total triangles: < 500k (terrain + landmarks combined)
- [ ] glTF payload: < 10 MB (compressed)
- [ ] Draw calls: reasonable (ideally < 50 for the whole scene)
- [ ] No shader compilation errors in console
- [ ] Memory stable (no leaks over 60 seconds)
- [ ] First meaningful paint < 3s on fast connection

**If FPS < 60:**
- Check triangle count — decimate terrain further in Blender
- Reduce `dpr` max from 2 to 1.5
- Reduce fog distance
- Profile with `r3f-perf` (install: `npm install r3f-perf`)
- Consider splitting the glTF into chunks (terrain separate from landmarks) for streaming

---

### Step 13 — Lint, Build, Commit, Deploy

```bash
cd websitehemsedal

npm run format
npm run lint
npm run build
```

Fix any issues. Then commit and push:

```bash
cd "/Users/jakob.behrens/Personal projects/HemsedalPackingWebsite"
git add -A
git commit -m "Phase 1: Blender-authored landscape MVP

- Terrain + landmarks authored in Blender, exported as optimized glTF
- Vertex-color palette baked in Blender, matched to CSS design tokens
- World.tsx replaces procedural Terrain.tsx — loads glTF scene via useGLTF
- Sky dome shader + scene fog + directional lighting
- Free-fly camera for scene scouting
- Color grading via Leva-controlled tone mapping
- World map (Plans/03 - world-map.md) + worldMap.ts define coordinates
- Camera hero shots saved to cameraPositions.ts
- Removed: procedural terrain shader, heightmap, noise params

Generated by Mistral Vibe.
Co-Authored-By: Mistral Vibe <vibe@mistral.ai>"

git push origin 2-landscape-mvp
```

**Deploy:** Vercel auto-deploys the branch. Verify the live URL shows the Blender-authored landscape.

---

## Phase 1 Final Checklist

### Blender
- [ ] `assets/blender/hemsedal-landscape.blend` created
- [ ] Terrain sculpted (valleys, ridges, peaks, frozen lake bed)
- [ ] 2–3 hero landmarks modeled and placed
- [ ] Supporting props scattered (trees, rocks)
- [ ] Vertex colors painted matching CSS palette
- [ ] Lighting baked (AO/lightmap) or deferred to runtime
- [ ] Collections organized (Terrain, Landmarks, Props, Cameras, Markers)
- [ ] Cameras placed at hero shot positions

### Pipeline
- [ ] glTF exported with vertex colors, +Y Up
- [ ] gltf-transform optimization (Draco + KTX2)
- [ ] .glb verified in gltf.report
- [ ] Payload < 10 MB

### Code
- [ ] `World.tsx` — loads glTF scene
- [ ] `Sky.tsx` — gradient sky dome (kept)
- [ ] `FreeFlyCamera.tsx` — dev-only fly controls (kept)
- [ ] `Scene.tsx` — updated composition
- [ ] `src/lib/worldMap.ts` — zones, landmarks, bounds
- [ ] `src/lib/cameraPositions.ts` — hero camera shots
- [ ] Grading controls via Leva
- [ ] `page.tsx` updated with Scene + overlay
- [ ] Removed: Terrain.tsx, Landmark.tsx, terrain shaders, heightmap, constants

### Verification
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] 60fps on dev machine
- [ ] No console errors
- [ ] Deployed to Vercel, live URL confirmed

### Art Direction 🎨
- [ ] **🎨 A** Palette chosen and set in `tokens.css` (5–7 colors, matched in Blender)
- [ ] **🎨 B** Terrain character sculpted in Blender
- [ ] **🎨 C** 2–3 Blender landmarks modeled
- [ ] **🎨 D** Landmarks placed at authored positions (documented in world map)
- [ ] **🎨 E** Atmosphere mood set (sky gradient, fog, lighting)
- [ ] **🎨 F** 3–5 hero camera shots found and saved
- [ ] **🎨 G** Color grading applied (subtle film look)

---

## Phase 1 → Phase 2 Handoff

When Phase 1 is complete, Phase 2 (Camera & Scroll) starts with:

1. **Remove `FreeFlyCamera`** — replace with a `CameraRig` that follows a `CatmullRomCurve3`
2. **Install & configure Lenis** — smooth scroll on the DOM layer
3. **GSAP ScrollTrigger** — scroll progress drives camera `t` along the curve (0→1)
4. **Use saved hero shots** from `cameraPositions.ts` as curve waypoints
5. **DOM sections** — minimal section markers that fade in as the camera arrives
6. **Nav transitions** — clicking a section name flies the camera there
7. **Zone-based sections** — use `worldMap.ts` zones to map DOM sections to world areas

The landscape is the stage. Phase 2 is the choreography.

---

## Blender Asset Pipeline Reference

Quick reference for the Blender → web pipeline used in this phase:

| Step | Tool | Command / Action |
|------|------|-----------------|
| Sculpt terrain | Blender | Sculpt mode on subdivided plane |
| Model landmarks | Blender | Edit mode, stylized low-poly |
| Vertex colors | Blender | Vertex Paint mode, colors from CSS tokens |
| Bake lighting | Blender | Bake AO/lightmap to UV texture (optional) |
| Simplify | Blender | Decimate modifier, target poly count |
| Organize | Blender | Collections: Terrain, Landmarks, Props, Cameras, Markers |
| Export | Blender | File → Export → glTF 2.0 (.glb), +Y Up, vertex colors |
| Optimize | gltf-transform | `npx @gltf-transform/cli optimize in.glb out.glb --compress draco --texture-compress ktx2` |
| Place | Blender | Everything is placed in-scene — no runtime placement |
| Load | R3F `useGLTF` | Auto-loaded from `/public/models/` |

**Tips:**
- Name materials and meshes descriptively in Blender — they carry through to glTF
- Keep the .blend file in `assets/blender/` (use git LFS for .blend and textures)
- Keep texture maps small (512×512 max) or use vertex colors only
- Test the `.glb` in Blender's glTF preview or [gltf.report](https://gltf.report) before loading in R3F
- Update `Plans/03 - world-map.md` whenever you move a landmark or change a zone boundary
- 1 Blender unit = 1 meter = 1 three.js world unit. Y is up in both.
