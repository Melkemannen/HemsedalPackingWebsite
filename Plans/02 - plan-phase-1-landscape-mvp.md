# Phase 1 — Landscape MVP (Detailed Plan)

**Goal:** A living 3D winter landscape in the browser — procedural terrain, authored Blender landmarks, custom palette shader, fog, sky, and a free-fly camera for tuning.
**Output:** Your world exists in the browser. Open the site and you're standing in Hemsedal.
**Branch:** `2-landscape-mvp` (already checked out)
**Estimated time:** 2–3 weeks
**Approach:** Route C — Hybrid (procedural terrain base + Blender-authored landmarks + shader atmosphere)

---

## Phase 0 → Phase 1 Handoff Recap

Phase 0 delivered:
- Next.js 16 + TS + R3F + drei + three + GSAP + Lenis + Motion + Zustand scaffold
- Design tokens in `src/styles/tokens.css` (placeholder palette)
- CSS reset + base layers in `src/styles/base.css`
- Fixed full-screen canvas container (`.canvas-container`) behind DOM content
- Smoke-test `Scene.tsx` with a blue cube — **to be replaced**
- Placeholder `page.tsx` — **to be replaced**
- Deployed to Vercel on `1-setup-initial-framework`

Phase 1 picks up exactly where the handoff left off:
1. Replace the smoke-test cube with a procedural terrain (FBM noise on a `PlaneGeometry`)
2. Custom `ShaderMaterial` mapping height/slope to the palette
3. Exponential fog + gradient sky matching `--color-bg`
4. Free-fly camera for tuning
5. Iterate on the look — **this is the heart of the project**

Plus: Blender-authored landmarks woven into the procedural base (Route C hybrid).

---

## Where Your Artistic Flair Goes

This phase is **80% art direction, 20% engineering**. The code is the canvas; you are the painter. Here is exactly where and when to apply your creative judgment:

| # | Moment | What You Decide | Where in the Plan |
|---|--------|-----------------|------------------|
| 🎨 **A** | **Palette selection** | The 4–6 core colors that define the world. Snow, rock, grass, sky, accent. These become both CSS tokens and shader uniforms. | Step 2 — before any terrain code |
| 🎨 **B** | **Terrain character** | How dramatic are the mountains? Jagged alpine peaks? Rolling fjord hills? Sharp ridges or soft valleys? This is controlled by noise parameters (octaves, frequency, amplitude, domain warping). | Step 4 — terrain tuning loop |
| 🎨 **C** | **Landmark concepts** | What are the 2–3 hero landmarks? A weathered cabin? A stone cairn? A half-buried ski lift? These tell the story of Hemsedal. Sketch them, then model in Blender. | Step 6 — Blender modeling |
| 🎨 **D** | **Landmark placement** | Where do landmarks sit in the terrain? On a ridge overlooking a valley? At a trail junction? Beside a frozen lake? You compose the world. | Step 7 — landmark integration |
| 🎨 **E** | **Atmosphere mood** | Fog density, sky gradient (dawn? overcast? deep twilight?), time-of-day feel. Is this a crisp morning, a moody afternoon, a blue-hour dusk? | Step 5 — atmosphere tuning |
| 🎨 **F** | **Camera vantage points** | Where does the camera rest when idle? What's the "hero shot" of the landscape? You'll set default camera positions that frame the world beautifully. | Step 8 — camera framing |
| 🎨 **G** | **Color grading** | Subtle post-scene color shifts — warm shadows, cool highlights, desaturation, contrast. The "film look." | Step 9 — global shader grading |

> **Rule:** If a parameter is exposed as a uniform or Leva control, it's yours to tune. If it's hardcoded infrastructure, leave it. The tuning loops (Steps 4, 5, 9) are where you spend most of your time — that's intentional.

---

## Architecture Overview

```
websitehemsedal/src/
├── app/
│   ├── layout.tsx              # Unchanged from Phase 0
│   ├── page.tsx                # Updated: mounts Scene + minimal overlay UI
│   └── globals.css             # Unchanged (imports tokens + base)
├── components/
│   ├── Scene.tsx               # REWRITTEN — full landscape scene
│   ├── Terrain.tsx             # NEW — procedural terrain mesh + shader
│   ├── Sky.tsx                 # NEW — gradient sky dome
│   ├── Landmark.tsx            # NEW — loads & places a Blender glTF landmark
│   ├── FreeFlyCamera.tsx       # NEW — dev-only camera controls
│   └── leva/                   # NEW — debug panel (dev only)
│       └── DebugPanel.tsx
├── lib/
│   ├── terrain/                # NEW — terrain generation logic
│   │   ├── noise.ts            # FBM + domain warping (ported to GLSL)
│   │   ├── generateHeightmap.ts # CPU-side heightmap (for landmark placement)
│   │   └── constants.ts        # Terrain size, segments, noise params
│   ├── shaders/                # NEW — GLSL shader files
│   │   ├── terrain.vert.glsl   # Vertex: height displacement, slope calc
│   │   ├── terrain.frag.glsl   # Fragment: palette mapping, fog, lighting
│   │   ├── sky.vert.glsl       # Sky dome vertex
│   │   └── sky.frag.glsl       # Sky gradient fragment
│   └── landmarks.ts            # NEW — landmark definitions (path, position, scale)
├── hooks/
│   └── useTerrainParams.ts     # NEW — Leva-controlled terrain params
└── styles/
    ├── tokens.css              # UPDATED — real palette (🎨 A)
    └── base.css                # Unchanged
```

**New dependencies to install:**
```bash
cd websitehemsedal
npm install leva                    # Live shader/param tuning UI
npm install -D @gltf-transform/cli  # glTF optimization pipeline
npm install -D vite-plugin-glsl     # Import .glsl files as strings
```

---

## Step-by-Step Plan

### Step 1 — Set Up Shader Infrastructure

**What:** Configure the project to import `.glsl` files as strings, so shaders live in their own files (editable, syntax-highlighted, version-controlled).

**Files to create/modify:**

`websitehemsedal/src/types/glsl.d.ts` (new):
```typescript
declare module "*.glsl" {
  const content: string;
  export default content;
}
```

`websitehemsedal/next.config.ts` (modify — add webpack rule):
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    partialPrerendering: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;
```

**Verification:** `npm run dev` — no errors. Create a dummy `.glsl` file, import it in a component, log it — should print the shader source.

---

### Step 2 — Define Your Palette 🎨 A

**What:** This is the single most important art decision in the entire project. Choose 5–7 colors that define the Hemsedal winter world. These will be used in:
- `src/styles/tokens.css` (CSS custom properties)
- Terrain fragment shader (height/slope → color mapping)
- Sky gradient shader
- Fog color
- DOM text/UI colors

**Action:** Open `src/styles/tokens.css` and replace the placeholder palette. Think about the mood:
- **Option 1 — Crisp Nordic:** Cold blue-greys, white snow, muted pine green, warm amber accent (cabin lights)
- **Option 2 — Moody Alpine:** Deep slate, ice blue, desaturated purple shadows, pale gold sky
- **Option 3 — Stark Winter:** Near-black rock, brilliant white snow, single warm accent, pale blue sky

**Suggested token structure** (refine as you go):
```css
:root {
  /* Core palette — 🎨 YOUR DECISION */
  --color-snow:    #f4f6f8;   /* Snow caps, highlights */
  --color-rock:    #2c3440;   /* Exposed rock, dark areas */
  --color-grass:   #3d5a45;   /* Alpine vegetation (muted) */
  --color-valley:  #1a2028;   /* Low areas, shadowed valleys */
  --color-sky-top: #1c2836;   /* Sky zenith */
  --color-sky-hor: #4a6076;   /* Sky horizon */
  --color-fog:     #2a3542;   /* Atmospheric fog */
  --color-accent:  #e8a54b;   /* Warm accent — cabin lights, UI highlights */

  /* Derived — update if core changes */
  --color-bg:      var(--color-valley);
  --color-surface: #151b24;
  --color-text:    #e8edf2;
  --color-text-muted: #7a8a9a;
}
```

**🎨 Artistic moment:** Spend 30–60 minutes on this. Look at reference images of Norwegian winter landscapes, Hemsedal specifically. Take screenshots, extract colors. This palette is the brand.

**Verification:** Run `npm run dev`. The placeholder page should render with your chosen background color.

---

### Step 3 — Create the Terrain Shader

**What:** Write the GLSL shaders that generate and color the terrain on the GPU. This is the core of the landscape.

**Files to create:**

`src/lib/shaders/terrain.vert.glsl`:
```glsl
// Terrain vertex shader
// Displaces vertices by FBM noise, computes slope for coloring

uniform float uTime;
uniform float uHeightScale;      // Max terrain height
uniform float uFrequency;        // Base noise frequency
uniform int   uOctaves;          // FBM octaves (4–8)
uniform float uLacunarity;       // Frequency multiplier per octave
uniform float uGain;             // Amplitude decay per octave
uniform float uWarpStrength;     // Domain warping amount
uniform vec2  uSeed;             // Random seed offset

varying vec3  vWorldPos;
varying float vHeight;          // Normalized 0–1
varying float vSlope;            // 0 = flat, 1 = steep
varying vec3  vNormal;

// Simplex noise 2D (Ashima)
// ... (include standard simplex noise implementation)

// FBM with domain warping
float fbm(vec2 p) {
  // Domain warp
  vec2 q = vec2(fbm2(p + uSeed), fbm2(p + uSeed + 5.2));
  vec2 r = vec2(fbm2(p + uWarpStrength * q + 1.7), fbm2(p + uWarpStrength * q + 9.2));
  return fbm2(p + uWarpStrength * r);
}

void main() {
  vec3 pos = position;

  // Generate height from noise
  vec2 uv = pos.xz * uFrequency;
  float h = fbm(uv);
  h = pow(h, 1.5); // Sharpen peaks
  pos.y += h * uHeightScale;

  // Compute slope from neighboring heights (finite difference)
  float eps = 1.0;
  float hL = fbm((pos.xz + vec2(-eps, 0.0)) * uFrequency);
  float hR = fbm((pos.xz + vec2( eps, 0.0)) * uFrequency);
  float hD = fbm((pos.xz + vec2(0.0, -eps)) * uFrequency);
  float hU = fbm((pos.xz + vec2(0.0,  eps)) * uFrequency);
  float slope = length(vec2(hR - hL, hU - hD)) / (2.0 * eps);

  vHeight = h;
  vSlope = clamp(slope * 2.0, 0.0, 1.0);
  vWorldPos = pos;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

`src/lib/shaders/terrain.frag.glsl`:
```glsl
// Terrain fragment shader
// Maps height + slope to the palette, applies fog and simple lighting

uniform vec3  uColorSnow;        // Snow caps (high altitude)
uniform vec3  uColorRock;        // Steep rock faces
uniform vec3  uColorGrass;       // Mid-altitude ground
uniform vec3  uColorValley;      // Low areas
uniform vec3  uColorFog;         // Fog color
uniform float uFogDensity;       // Exponential fog density
uniform float uSnowLevel;        // Height above which snow appears
uniform float uSnowBlend;        // Blend range for snow transition
uniform vec3  uSunDir;           // Sun direction (normalized)
uniform vec3  uSunColor;         // Sun light color
uniform vec3  uAmbientColor;     // Ambient fill light

varying vec3  vWorldPos;
varying float vHeight;
varying float vSlope;
varying vec3  vNormal;

void main() {
  // Base color by height + slope
  vec3 color = mix(uColorValley, uColorGrass, smoothstep(0.1, 0.4, vHeight));
  color = mix(color, uColorRock, vSlope * 0.7);
  color = mix(color, uColorSnow, smoothstep(uSnowLevel - uSnowBlend, uSnowLevel + uSnowBlend, vHeight));

  // Simple directional lighting
  float NdotL = max(dot(vNormal, uSunDir), 0.0);
  vec3 lighting = uAmbientColor + uSunColor * NdotL;
  color *= lighting;

  // Exponential fog
  float dist = length(vWorldPos - cameraPosition);
  float fogFactor = 1.0 - exp(-uFogDensity * dist * dist);
  color = mix(color, uColorFog, clamp(fogFactor, 0.0, 1.0));

  gl_FragColor = vec4(color, 1.0);
}
```

**Note:** The simplex noise GLSL code is ~60 lines (Ashima's webgl-noise). Include it at the top of `terrain.vert.glsl` or as a separate `#include`-style string concatenation in the component.

**🎨 Artistic moment:** The `pow(h, 1.5)` exponent and the height thresholds (`smoothstep` ranges) control terrain character. Higher exponent = sharper peaks. Adjust `uSnowLevel` to control where snow caps appear.

---

### Step 4 — Build the Terrain Component + Tuning Loop 🎨 B

**What:** Create the `Terrain.tsx` React component that generates a `PlaneGeometry`, attaches the custom shader material, and exposes all parameters via Leva for live tuning.

`src/components/Terrain.tsx` (new):
```tsx
"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useControls } from "leva";
import { PlaneGeometry } from "three";
import terrainVert from "@/lib/shaders/terrain.vert.glsl";
import terrainFrag from "@/lib/shaders/terrain.frag.glsl";

// Read palette from CSS custom properties
const getCSSColor = (name: string): THREE.Color => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name).trim();
  return new THREE.Color(value);
};

export default function Terrain() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  // 🎨 Leva controls — these are YOUR tuning knobs
  const params = useControls("Terrain", {
    heightScale:   { value: 8,  min: 0, max: 30, step: 0.5 },
    frequency:     { value: 0.008, min: 0.001, max: 0.05, step: 0.001 },
    octaves:       { value: 6,  min: 1, max: 8, step: 1 },
    lacunarity:    { value: 2.0, min: 1.0, max: 3.0, step: 0.1 },
    gain:          { value: 0.5, min: 0.3, max: 0.7, step: 0.05 },
    warpStrength:  { value: 3.0, min: 0, max: 8, step: 0.1 },
    snowLevel:     { value: 0.65, min: 0, max: 1, step: 0.01 },
    snowBlend:     { value: 0.1, min: 0.01, max: 0.3, step: 0.01 },
    fogDensity:    { value: 0.008, min: 0, max: 0.05, step: 0.001 },
    sunIntensity:  { value: 1.0, min: 0, max: 2, step: 0.05 },
  });

  // Palette from CSS tokens (🎨 A — updates live if you edit tokens.css)
  const palette = useControls("Palette", {
    colorSnow:   { value: getCSSColor("--color-snow") },
    colorRock:   { value: getCSSColor("--color-rock") },
    colorGrass:  { value: getCSSColor("--color-grass") },
    colorValley: { value: getCSSColor("--color-valley") },
    colorFog:    { value: getCSSColor("--color-fog") },
  });

  const geometry = useMemo(() => {
    const geo = new PlaneGeometry(500, 500, 256, 256);
    geo.rotateX(-Math.PI / 2); // Lay flat
    return geo;
  }, []);

  const uniforms = useMemo(() => ({
    uTime:        { value: 0 },
    uHeightScale: { value: params.heightScale },
    uFrequency:   { value: params.frequency },
    uOctaves:     { value: params.octaves },
    uLacunarity:  { value: params.lacunarity },
    uGain:        { value: params.gain },
    uWarpStrength:{ value: params.warpStrength },
    uSeed:        { value: new THREE.Vector2(Math.random() * 100, Math.random() * 100) },
    uSnowLevel:   { value: params.snowLevel },
    uSnowBlend:   { value: params.snowBlend },
    uFogDensity:  { value: params.fogDensity },
    uColorSnow:   { value: new THREE.Color(palette.colorSnow) },
    uColorRock:   { value: new THREE.Color(palette.colorRock) },
    uColorGrass:  { value: new THREE.Color(palette.colorGrass) },
    uColorValley: { value: new THREE.Color(palette.colorValley) },
    uColorFog:    { value: new THREE.Color(palette.colorFog) },
    uSunDir:      { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() },
    uSunColor:    { value: new THREE.Color(1.0, 0.95, 0.85).multiplyScalar(params.sunIntensity) },
    uAmbientColor:{ value: new THREE.Color(0.15, 0.18, 0.25) },
  }), []);

  // Sync Leva params → uniforms each frame
  useFrame(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uHeightScale.value = params.heightScale;
    materialRef.current.uniforms.uFrequency.value = params.frequency;
    materialRef.current.uniforms.uOctaves.value = params.octaves;
    materialRef.current.uniforms.uLacunarity.value = params.lacunarity;
    materialRef.current.uniforms.uGain.value = params.gain;
    materialRef.current.uniforms.uWarpStrength.value = params.warpStrength;
    materialRef.current.uniforms.uSnowLevel.value = params.snowLevel;
    materialRef.current.uniforms.uSnowBlend.value = params.snowBlend;
    materialRef.current.uniforms.uFogDensity.value = params.fogDensity;
  });

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={terrainVert}
        fragmentShader={terrainFrag}
        uniforms={uniforms}
      />
    </mesh>
  );
}

// Need useFrame import:
// import { useFrame } from "@react-three/fiber";
```

**🎨 THE TUNING LOOP — where you spend hours:**

This is the heart of Phase 1. The workflow is:

1. Run `npm run dev`
2. Open `localhost:3000`
3. Leva panel appears (top-right) with all terrain + palette controls
4. **Tweak → observe → tweak.** Every change is live.
5. When you find a look you love, **save the values** (Leva has a "Save" button, or copy them from the panel)

**What to tune for different terrain characters:**

| Look | heightScale | frequency | octaves | warpStrength | snowLevel |
|------|------------|-----------|---------|-------------|-----------|
| Gentle rolling hills | 3–5 | 0.003–0.005 | 4 | 1–2 | 0.7 |
| Dramatic alpine peaks | 15–25 | 0.008–0.015 | 6–7 | 4–6 | 0.55 |
| Jagged ridges | 10–18 | 0.012–0.02 | 7–8 | 5–8 | 0.6 |
| Wide valley + distant peaks | 8–12 | 0.004–0.006 | 5 | 3–4 | 0.75 |

**When you're happy with the terrain:** Copy the Leva values into `src/lib/terrain/constants.ts` as defaults, so they persist on reload.

**Verification:** Terrain renders as a colored landscape. Leva panel responds to input. No console errors.

---

### Step 5 — Sky + Atmosphere 🎨 E

**What:** Add a gradient sky dome and scene-level fog that matches the palette. This is where the mood is set.

`src/lib/shaders/sky.vert.glsl`:
```glsl
varying vec3 vWorldDirection;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldDirection = worldPosition.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

`src/lib/shaders/sky.frag.glsl`:
```glsl
uniform vec3 uSkyTop;       // Zenith color
uniform vec3 uSkyHorizon;   // Horizon color
uniform vec3 uSkyBottom;    // Below horizon (rarely visible)
uniform float uGradientPower; // How quickly top→horizon transitions

varying vec3 vWorldDirection;

void main() {
  float h = normalize(vWorldDirection).y;
  float t = clamp(pow(max(h, 0.0), uGradientPower), 0.0, 1.0);
  vec3 color = mix(uSkyHorizon, uSkyTop, t);
  // Below horizon: fade to fog/ground color
  color = mix(uSkyBottom, color, smoothstep(-0.05, 0.0, h));
  gl_FragColor = vec4(color, 1.0);
}
```

`src/components/Sky.tsx` (new):
```tsx
"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useControls } from "leva";
import { BackSide } from "three";
import skyVert from "@/lib/shaders/sky.vert.glsl";
import skyFrag from "@/lib/shaders/sky.frag.glsl";

const getCSSColor = (name: string): THREE.Color => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name).trim();
  return new THREE.Color(value);
};

export default function Sky() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const params = useControls("Sky", {
    gradientPower: { value: 0.6, min: 0.1, max: 3.0, step: 0.05 },
  });

  const palette = useControls("Sky Palette", {
    skyTop:     { value: getCSSColor("--color-sky-top") },
    skyHorizon: { value: getCSSColor("--color-sky-hor") },
    skyBottom:  { value: getCSSColor("--color-fog") },
  });

  const geometry = useMemo(() => new THREE.SphereGeometry(400, 32, 16), []);

  const uniforms = useMemo(() => ({
    uSkyTop:        { value: new THREE.Color(palette.skyTop) },
    uSkyHorizon:    { value: new THREE.Color(palette.skyHorizon) },
    uSkyBottom:     { value: new THREE.Color(palette.skyBottom) },
    uGradientPower: { value: params.gradientPower },
  }), []);

  useFrame(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uGradientPower.value = params.gradientPower;
  });

  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={skyVert}
        fragmentShader={skyFrag}
        uniforms={uniforms}
        side={BackSide}
      />
    </mesh>
  );
}
```

**Update `Scene.tsx`:**
```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Terrain from "./Terrain";
import Sky from "./Sky";
import FreeFlyCamera from "./FreeFlyCamera";

export default function Scene() {
  return (
    <div className="canvas-container">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 15, 30], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#0a0f14"]} />
        <fog attach="fog" args={["#2a3542", 50, 300]} />

        <Suspense fallback={null}>
          <Sky />
          <Terrain />
        </Suspense>

        {/* Dev-only free-fly camera — remove or gate behind env var in Phase 2 */}
        <FreeFlyCamera />
      </Canvas>
    </div>
  );
}
```

**🎨 Artistic moment — atmosphere mood:**

| Mood | skyTop | skyHorizon | fogDensity | sunIntensity |
|------|--------|-----------|------------|-------------|
| Crisp winter morning | `#d4e4f0` | `#8fb8d4` | 0.004 | 1.2 |
| Overcast afternoon | `#3a4a5a` | `#5a6a7a` | 0.012 | 0.6 |
| Blue-hour dusk | `#1a2035` | `#4a5a7a` | 0.008 | 0.8 |
| Stormy dramatic | `#1a1f28` | `#3a4555` | 0.015 | 0.4 |
| Golden alpenglow | `#2a3040` | `#c47a4a` | 0.006 | 1.0 |

Also tune `gradientPower` — lower = wider horizon band, higher = tighter zenith.

**Verification:** Sky renders as a smooth gradient. Fog blends distant terrain into the horizon. The whole scene feels cohesive.

---

### Step 6 — Blender Landmarks 🎨 C

**What:** Model 2–3 hero landmarks in Blender that will be placed in the terrain. These are the "authored" elements that give the landscape its unique identity — the things that make it *yours* and not a generic noise terrain.

**Prerequisites:** Blender 4.x installed on your machine.

**Landmark concepts — pick 2–3 that tell the Hemsedal story:**

| Landmark | Story | Difficulty | Poly target |
|----------|-------|-----------|-------------|
| Weathered wooden cabin | "Someone lives here. This is a place." | Medium | 5–15k tris |
| Stone cairn (steinhaufen) | "A marker on the trail. Human presence in the wild." | Easy | 1–3k tris |
| Half-buried ski lift pylon | "The mountain is used. Winter sports history." | Medium | 3–8k tris |
| Frozen waterfall / ice formation | "Nature's architecture." | Easy (procedural-ish) | 2–5k tris |
| Small stone bridge over a stream | "A path crosses here." | Medium | 4–10k tris |

**Blender workflow for each landmark:**

1. **Model** in Blender. Keep it stylized/low-poly — this is a web asset, not a film render.
2. **UV unwrap** — even if using vertex colors, UVs are needed for potential textures later.
3. **Assign materials** — use Principled BSDF with viewport colors matching your palette. Bake vertex colors.
4. **Bake vertex colors** to a color attribute:
   - Add a Color Attribute named `Cd` (or `color`)
   - In Edit Mode, select all, then in the Object Data Properties → Color Attributes, set values
   - Or use the "Bake" approach: render viewport colors to a texture, then bake that to vertex colors
5. **Simplify** — target the poly counts above. Use Decimate modifier (planar areas collapse well).
6. **Origin at base** — set the 3D cursor to the bottom-center of the model so placement in R3F is intuitive.
7. **Export as glTF 2.0** (`.glb`):
   - File → Export → glTF 2.0
   - Format: **glTF Binary (.glb)**
   - Transform: **+Y Up** (glTF standard)
   - Geometry: ✅ Apply Modifiers, ✅ Normals, ✅ Colors (vertex colors)
   - Compression: None (we'll compress with gltf-transform next)
8. **Optimize with gltf-transform:**
   ```bash
   npx @gltf-transform/cli optimize input.glb output.glb --compress draco --texture-compress ktx2
   ```
9. **Place in `websitehemsedal/public/models/`:**
   ```
   public/models/
   ├── cabin.glb
   ├── cairn.glb
   └── ski-pylon.glb
   ```

**🎨 Artistic moment — landmark design:**

This is where you imprint your personality on the world. Don't make generic assets — make *Hemsedal* assets:
- The cabin should look like a real Norwegian stabbur (log cabin) — horizontal logs, grass roof, small windows with warm light
- The cairn should look hand-stacked, slightly irregular, weathered grey stones
- The ski pylon should show rust, bent metal, cables sagging with disuse

Reference photos of Hemsedal and Norwegian mountain architecture. The more specific, the better.

**Landmark definition file** — `src/lib/landmarks.ts`:
```typescript
// Landmark definitions — positions are in world space (x, z), y is auto-computed from terrain
export interface LandmarkDef {
  id: string;
  modelPath: string;       // Path in /public/models/
  position: [number, number]; // [x, z] in world units
  rotation: number;        // Y-axis rotation in radians
  scale: number;           // Uniform scale
}

export const LANDMARKS: LandmarkDef[] = [
  // 🎨 D — YOU decide positions. Use the FreeFlyCamera (Step 8) to scout locations.
  // Fly to a spot you like, note the x/z coordinates, enter them here.
  {
    id: "cabin",
    modelPath: "/models/cabin.glb",
    position: [12, -8],     // 🎨 Place on a flat-ish area near a "valley"
    rotation: 0.5,
    scale: 1.0,
  },
  {
    id: "cairn",
    modelPath: "/models/cairn.glb",
    position: [-25, 15],    // 🎨 Place on a ridge or hilltop
    rotation: 0,
    scale: 1.5,
  },
  // Add more landmarks here as you model them
];
```

---

### Step 7 — Landmark Integration 🎨 D

**What:** Load the Blender glTF models into the R3F scene and place them at authored positions. Auto-compute Y position from the terrain height at each (x, z).

`src/components/Landmark.tsx` (new):
```tsx
"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { LandmarkDef } from "@/lib/landmarks";

interface LandmarkProps {
  def: LandmarkDef;
  terrainHeightFn: (x: number, z: number) => number;
}

export default function Landmark({ def, terrainHeightFn }: LandmarkProps) {
  const { scene } = useGLTF(def.modelPath);
  const groupRef = useRef<THREE.Group>(null!);

  // Compute Y position from terrain height
  const y = terrainHeightFn(def.position[0], def.position[1]);

  // Clone the scene so multiple instances don't share mutations
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Apply vertex colors if present, fallback to a material matching palette
  useMemo(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        // If the glTF has vertex colors, use them
        if (child.geometry.attributes.color) {
          child.material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.9,
            metalness: 0.0,
          });
        }
        // Enable fog on landmark materials
        if (child.material instanceof THREE.Material) {
          child.material.fog = true;
        }
      }
    });
  }, [clonedScene]);

  return (
    <group
      ref={groupRef}
      position={[def.position[0], y, def.position[1]]}
      rotation={[0, def.rotation, 0]}
      scale={def.scale}
    >
      <primitive object={clonedScene} />
    </group>
  );
}
```

**Update `src/components/Terrain.tsx`** to expose a height function:

Add to the Terrain component (or extract to a shared module):
```typescript
// src/lib/terrain/heightmap.ts (new)
// CPU-side replica of the terrain shader's height function
// Used to place landmarks at correct Y positions

import { createNoise2D } from "simplex-noise";

// Must match the GLSL noise params exactly
let noiseParams = {
  frequency: 0.008,
  octaves: 6,
  lacunarity: 2.0,
  gain: 0.5,
  warpStrength: 3.0,
  heightScale: 8,
};

export function setNoiseParams(params: typeof noiseParams) {
  noiseParams = { ...noiseParams, ...params };
}

export function getTerrainHeight(x: number, z: number): number {
  // Simplified CPU version of the GLSL fbm + domain warping
  // For landmark placement, approximate is fine — we'll snap to terrain visually
  // ... implement matching the GLSL logic ...
  const nx = x * noiseParams.frequency;
  const nz = z * noiseParams.frequency;
  // Use simplex-noise library for CPU-side height
  // Apply domain warping approximation
  const h = fbmCPU(nx, nz);
  return Math.pow(h, 1.5) * noiseParams.heightScale;
}
```

**Update `Scene.tsx`** to include landmarks:
```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Terrain from "./Terrain";
import Sky from "./Sky";
import Landmark from "./Landmark";
import FreeFlyCamera from "./FreeFlyCamera";
import { LANDMARKS } from "@/lib/landmarks";
import { getTerrainHeight } from "@/lib/terrain/heightmap";

export default function Scene() {
  return (
    <div className="canvas-container">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 15, 30], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#0a0f14"]} />
        <fog attach="fog" args={["#2a3542", 50, 300]} />

        {/* Lighting for landmarks (terrain uses shader lighting) */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[50, 80, 30]}
          intensity={1.0}
          color="#fff5e0"
        />

        <Suspense fallback={null}>
          <Sky />
          <Terrain />
          {LANDMARKS.map((lm) => (
            <Landmark
              key={lm.id}
              def={lm}
              terrainHeightFn={getTerrainHeight}
            />
          ))}
        </Suspense>

        <FreeFlyCamera />
      </Canvas>
    </div>
  );
}
```

**🎨 Artistic moment — landmark placement (🎨 D):**

Use the FreeFlyCamera (next step) to scout the terrain. Fly around, find spots that feel right:
- Cabin: in a sheltered valley, near "flat" ground, with a view of peaks
- Cairn: on a ridge or hilltop, visible from afar, marking a trail
- Ski pylon: on a slope, mid-mountain, slightly tilted as if abandoned

Note the x/z coordinates from the camera position readout, enter them in `landmarks.ts`. Adjust rotation so the landmark faces an interesting direction. Adjust scale so it feels right in the world (a cabin should be small — human-scale against a vast landscape).

**Verification:** Landmarks appear in the scene at their authored positions, sitting on the terrain surface, affected by fog.

---

### Step 8 — Free-Fly Camera for Tuning 🎨 F

**What:** A dev-only camera controller so you can fly around the landscape and find the perfect vantage points. This is your director's chair.

`src/components/FreeFlyCamera.tsx` (new):
```tsx
"use client";

import { useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useControls } from "leva";

export default function FreeFlyCamera() {
  const { camera } = useThree();
  const keys = useRef({ forward: false, back: false, left: false, right: false, up: false, down: false });
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const velocity = useRef(new THREE.Vector3());

  const params = useControls("Camera", {
    speed: { value: 20, min: 1, max: 100, step: 1 },
    sensitivity: { value: 0.002, min: 0.0005, max: 0.005, step: 0.0001 },
    showPosition: { value: true }, // Display current x,y,z in Leva
  }, { collapsed: true });

  // Keyboard input
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW": keys.current.forward = true; break;
        case "KeyS": keys.current.back = true; break;
        case "KeyA": keys.current.left = true; break;
        case "KeyD": keys.current.right = true; break;
        case "Space": keys.current.up = true; break;
        case "ShiftLeft": keys.current.down = true; break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW": keys.current.forward = false; break;
        case "KeyS": keys.current.back = false; break;
        case "KeyA": keys.current.left = false; break;
        case "KeyD": keys.current.right = false; break;
        case "Space": keys.current.up = false; break;
        case "ShiftLeft": keys.current.down = false; break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Mouse look
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== document.body) return;
      euler.current.y -= e.movementX * params.sensitivity;
      euler.current.x -= e.movementY * params.sensitivity;
      euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [params.sensitivity]);

  // Click to lock pointer
  useEffect(() => {
    const onClick = () => {
      document.body.requestPointerLock();
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  useFrame((_, delta) => {
    // Apply rotation
    camera.quaternion.setFromEuler(euler.current);

    // Movement direction
    const direction = new THREE.Vector3();
    if (keys.current.forward) direction.z -= 1;
    if (keys.current.back) direction.z += 1;
    if (keys.current.left) direction.x -= 1;
    if (keys.current.right) direction.x += 1;
    if (keys.current.up) direction.y += 1;
    if (keys.current.down) direction.y -= 1;
    direction.normalize();

    // Transform to world space
    direction.applyQuaternion(camera.quaternion);

    // Smooth velocity
    const targetVel = direction.multiplyScalar(params.speed);
    velocity.current.lerp(targetVel, Math.min(delta * 5, 1));

    // Apply movement
    camera.position.add(velocity.current.clone().multiplyScalar(delta));
  });

  return null; // This component renders nothing — it's a camera controller
}

// Need useEffect import:
// import { useEffect } from "react";
```

**How to use:**
1. Open the site in dev mode
2. Click anywhere on the page → pointer locks (mouse controls camera look)
3. **WASD** to move, **Space** to rise, **Shift** to descend
4. **Esc** to release the mouse
5. Check the Leva panel for your current camera position — use these coordinates for landmark placement (🎨 D) and hero shots (🎨 F)

**🎨 Artistic moment — finding the hero shot (🎨 F):**

Fly around until you find 3–5 camera positions that frame the landscape beautifully:
- A wide establishing shot (high, distant, whole valley visible)
- A ground-level shot (standing in the snow, looking up at peaks)
- A shot framed by a landmark (cabin in foreground, mountains behind)
- A dramatic low angle (looking up at a ridge)

**Save these positions.** They become the default camera positions and Phase 2 camera path waypoints. Write them down:

```
Hero shot 1: pos [0, 20, 50], rot [-0.3, 0, 0]
Hero shot 2: pos [-15, 5, 10], rot [-0.1, -0.5, 0]  (cabin foreground)
Hero shot 3: pos [30, 8, -20], rot [-0.4, 2.5, 0]  (ridge overlook)
```

Save these to `src/lib/cameraPositions.ts` for Phase 2.

---

### Step 9 — Global Color Grading Shader 🎨 G

**What:** A subtle post-process-style color grading applied directly in the terrain fragment shader (or as a full-screen pass). This is the "film look" — the difference between "WebGL demo" and "authored experience."

**Approach:** Add grading functions to the terrain fragment shader (simplest for Phase 1). In Phase 4, move to a proper postprocessing stack.

Add to `terrain.frag.glsl` (before `gl_FragColor`):
```glsl
// ── Color grading (🎨 G — your film look) ──

// Lift/gamma/gain (LGG)
color = color * uGain;           // Overall exposure
color = pow(color, vec3(1.0 / uGamma)); // Gamma correction
color += uLift;                  // Shadow lift (adds mood)

// Color balance (split toning)
// Warm highlights, cool shadows (or vice versa)
float luminance = dot(color, vec3(0.299, 0.587, 0.114));
vec3 warmColor  = vec3(1.05, 0.98, 0.90);  // Warm tint
vec3 coolColor  = vec3(0.90, 0.95, 1.05);  // Cool tint
color = mix(color, color * coolColor, (1.0 - luminance) * uShadowTint);
color = mix(color, color * warmColor, luminance * uHighlightTint);

// Saturation
float sat = dot(color, vec3(0.299, 0.587, 0.114));
color = mix(vec3(sat), color, uSaturation);

// Contrast (S-curve)
color = (color - 0.5) * uContrast + 0.5;

// Vignette (subtle darkening at edges)
vec2 uv = gl_FragCoord.xy / uResolution;
float vignette = 1.0 - dot(uv - 0.5, uv - 0.5) * uVignetteStrength;
color *= vignette;
```

Add corresponding uniforms and Leva controls:
```typescript
// In Terrain.tsx Leva controls:
const grading = useControls("Color Grading", {
  exposure:       { value: 1.0, min: 0.5, max: 2.0, step: 0.01 },
  gamma:          { value: 1.0, min: 0.5, max: 2.0, step: 0.01 },
  lift:           { value: 0.0, min: -0.2, max: 0.2, step: 0.005 },
  contrast:       { value: 1.05, min: 0.8, max: 1.3, step: 0.01 },
  saturation:     { value: 0.9, min: 0.0, max: 1.5, step: 0.01 },
  highlightTint:  { value: 0.15, min: 0, max: 0.5, step: 0.01 },
  shadowTint:     { value: 0.2, min: 0, max: 0.5, step: 0.01 },
  vignetteStrength: { value: 0.3, min: 0, max: 1.0, step: 0.05 },
});
```

**🎨 Artistic moment — the film look (🎨 G):**

This is subtle but transformative. Try these starting points:

| Look | exposure | gamma | lift | contrast | saturation | highlightTint | shadowTint | vignette |
|------|----------|-------|------|----------|------------|---------------|------------|----------|
| Clean digital | 1.0 | 1.0 | 0.0 | 1.0 | 1.0 | 0.0 | 0.0 | 0.0 |
| Film — cool shadows | 1.0 | 1.0 | -0.02 | 1.08 | 0.85 | 0.1 | 0.25 | 0.3 |
| Film — warm nostalgia | 1.05 | 0.95 | 0.01 | 1.1 | 0.8 | 0.2 | 0.1 | 0.35 |
| Cinematic dark | 0.9 | 1.1 | -0.03 | 1.15 | 0.75 | 0.1 | 0.3 | 0.4 |
| Faded vintage | 1.0 | 0.85 | 0.03 | 0.9 | 0.6 | 0.15 | 0.1 | 0.25 |

Start subtle. The difference between 0 and 0.1 on tint is noticeable; 0.5 is heavy-handed. Less is more.

---

### Step 10 — Update the Page & Remove Placeholder

**What:** Replace the placeholder `page.tsx` with a minimal overlay that mounts the Scene and shows the project title.

`src/app/page.tsx`:
```tsx
import Scene from "@/components/Scene";

export default function Home() {
  return (
    <>
      <Scene />
      <main className="content-layer" style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "var(--space-xl)",
        pointerEvents: "none", // Let clicks pass through to canvas
      }}>
        <h1 style={{
          fontSize: "var(--step-5)",
          fontWeight: 700,
          color: "var(--color-text)",
          textShadow: "0 2px 20px rgba(0,0,0,0.5)",
          margin: 0,
        }}>
          Hemsedal
        </h1>
        <p style={{
          fontSize: "var(--step-1)",
          color: "var(--color-text-muted)",
          margin: 0,
        }}>
          Phase 1 — Landscape MVP
        </p>
      </main>
    </>
  );
}
```

**Delete `src/components/Scene.tsx` old version** — it's been replaced.

**Verification:** `npm run dev` → full-screen 3D landscape with title overlay. No placeholder text.

---

### Step 11 — Save Defaults & Clean Up

**What:** Once you're happy with the look, bake the Leva values into code defaults so they persist. Remove or hide the Leva panel for production.

**Create `src/lib/terrain/constants.ts`:**
```typescript
// 🎨 Final tuned values — bake from Leva after tuning
export const TERRAIN_DEFAULTS = {
  heightScale:  12,
  frequency:    0.006,
  octaves:      6,
  lacunarity:   2.0,
  gain:         0.5,
  warpStrength: 4.0,
  snowLevel:    0.6,
  snowBlend:    0.12,
  fogDensity:   0.008,
  sunIntensity: 1.0,
} as const;

export const GRADING_DEFAULTS = {
  exposure:         1.0,
  gamma:            1.0,
  lift:             -0.02,
  contrast:         1.08,
  saturation:       0.85,
  highlightTint:    0.1,
  shadowTint:       0.25,
  vignetteStrength: 0.3,
} as const;

export const CAMERA_HERO_SHOTS = [
  { position: [0, 20, 50], rotation: [-0.3, 0, 0] },
  { position: [-15, 5, 10], rotation: [-0.1, -0.5, 0] },
  { position: [30, 8, -20], rotation: [-0.4, 2.5, 0] },
] as const;
```

**Update components to use defaults:** All Leva `value:` fields should reference these constants instead of hardcoded numbers.

**Gate Leva behind dev mode:**
```typescript
// In Terrain.tsx, Sky.tsx, etc.:
const isDev = process.env.NODE_ENV === "development";

// Only render Leva in dev:
// Option A: Conditional useControls (causes hook order issues — avoid)
// Option B: Wrap in a component that returns null in prod
// Option C: Use leva's `hidden` prop

// Simplest: Add to next.config.ts
// Hide Leva in production builds by tree-shaking
```

Actually, the simplest approach: Leva is dev-only by convention. In Phase 2, wrap all Leva usage in a `<Leva hidden={!isDev} />` and set `hidden` based on env. For now, leave it visible — you need it.

---

### Step 12 — Performance Check

**What:** Verify the scene runs at 60fps on a mid-tier machine. Check draw calls, triangle count, and memory.

```bash
cd websitehemsedal
npm run build
npm run start
# Open localhost:3000, open DevTools → Performance → record 10 seconds
```

**Checklist:**
- [ ] FPS ≥ 60 on your dev machine
- [ ] Terrain draw calls: 1 (single mesh)
- [ ] Terrain triangles: ~131k (256×256 segments × 2 tris) — acceptable for GPU-displaced terrain
- [ ] Landmark draw calls: 1 per landmark (or merged later)
- [ ] No shader compilation errors in console
- [ ] Memory stable (no leaks over 60 seconds)

**If FPS < 60:**
- Reduce terrain segments from 256×256 to 128×128
- Reduce `dpr` max from 2 to 1.5
- Reduce fog distance (less fragment work)
- Profile with `r3f-perf` (install: `npm install r3f-perf`)

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
git commit -m "Phase 1: Landscape MVP — procedural terrain, Blender landmarks, palette shader, sky, free-fly camera

- GLSL terrain shader with FBM noise + domain warping
- Height/slope palette mapping matching CSS design tokens
- Gradient sky dome with fog
- 2-3 Blender-authored landmarks (glTF + Draco)
- Leva live-tuning panel for all visual params
- Free-fly camera for scene scouting
- Color grading (exposure, contrast, split-toning, vignette)

Generated by Mistral Vibe.
Co-Authored-By: Mistral Vibe <vibe@mistral.ai>"

git push origin 2-landscape-mvp
```

**Deploy:** Vercel auto-deploys the branch. Verify the live URL shows the landscape.

---

## Phase 1 Final Checklist

### Engineering
- [ ] GLSL shader infrastructure (`.glsl` imports via webpack)
- [ ] `Terrain.tsx` — procedural terrain with FBM + domain warping shader
- [ ] `Sky.tsx` — gradient sky dome
- [ ] `Landmark.tsx` — glTF landmark loader + placement
- [ ] `FreeFlyCamera.tsx` — dev-only fly controls
- [ ] `src/lib/shaders/` — terrain.vert/frag, sky.vert/frag
- [ ] `src/lib/terrain/` — heightmap, constants
- [ ] `src/lib/landmarks.ts` — landmark definitions
- [ ] `src/lib/cameraPositions.ts` — saved hero shots
- [ ] Leva tuning panel wired to all visual params
- [ ] Defaults baked into constants files
- [ ] `page.tsx` updated with Scene + minimal overlay
- [ ] Old `Scene.tsx` smoke-test replaced
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] 60fps on dev machine
- [ ] Deployed to Vercel, live URL confirmed

### Art Direction 🎨
- [ ] **🎨 A** Palette chosen and set in `tokens.css` (5–7 colors)
- [ ] **🎨 B** Terrain character tuned (height, frequency, warping, snow line)
- [ ] **🎨 C** 2–3 Blender landmarks modeled, exported, optimized
- [ ] **🎨 D** Landmarks placed at authored positions in the terrain
- [ ] **🎨 E** Atmosphere mood set (sky gradient, fog density, lighting)
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

The landscape is the stage. Phase 2 is the choreography.

---

## Blender Asset Pipeline Reference

Quick reference for the Blender → web pipeline used in this phase:

| Step | Tool | Command / Action |
|------|------|-----------------|
| Model | Blender | Sculpt/model, stylized low-poly |
| UV + Color | Blender | Unwrap, assign vertex colors or bake to color attribute |
| Simplify | Blender | Decimate modifier, target poly count |
| Export | Blender | File → Export → glTF 2.0 (.glb), +Y Up |
| Optimize | gltf-transform | `npx @gltf-transform/cli optimize in.glb out.glb --compress draco` |
| Place | `src/lib/landmarks.ts` | Define position, rotation, scale |
| Load | R3F `useGLTF` | Auto-loaded from `/public/models/` |

**Tips:**
- Name materials and meshes descriptively in Blender — they carry through to glTF
- Origin at the base of the model (bottom-center) for intuitive placement
- Keep texture maps small (512×512 max) or use vertex colors only
- Test the `.glb` in Blender's glTF preview or [gltf.report](https://gltf.report) before loading in R3F
