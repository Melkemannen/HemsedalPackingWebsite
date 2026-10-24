# AGENTS.md — Hemsedal Packing Website

> **Purpose:** A scroll-driven, 3D-first winter landscape website for a Hemsedal ski trip packing checklist. Inspired by basement.studio — one persistent 3D scene behind DOM content, camera choreography driven by scroll.

---

## Project Overview

Two goals: (1) learn 3D web development, (2) make sure trip-mates pack properly. The site is a 3D winter landscape of Hemsedal, Norway, with a packing checklist layered on top. The landscape is the brand; the checklist is the utility.

**Current phase:** Phase 1 — Landscape MVP (terrain and landmarks authored in Blender, exported as glTF, loaded into the browser; sky shader + fog + free-fly camera working).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript (strict) + React Compiler |
| 3D | three.js + @react-three/fiber v9 + @react-three/drei v10 |
| Shaders | GLSL (stored as TS template strings in `src/lib/shaders/`) |
| Tuning UI | Leva (dev-only live parameter panel) |
| Scroll / motion | Lenis + GSAP (installed, not yet wired) |
| State | Zustand (installed, not yet used) |
| Styling | CSS custom properties (design tokens) + CSS Modules — **no Tailwind** |
| Lint / format | ESLint (flat config, core-web-vitals + TS) + Prettier |
| Terrain | Authored in Blender (sculpted landscape), exported as glTF with baked vertex colors |
| Assets | Blender → glTF 2.0 (.glb) → gltf-transform (Draco/KTX2) |

---

## Repository Structure

```
HemsedalPackingWebsite/
├── AGENTS.md                    # This file
├── README.md                    # Project vision + art direction decision points
├── .cursorrules                 # Cursor IDE rules
├── assets/
│   └── blender/
│       └── hemsedal-landscape.blend  # The Blender scene (source of truth for geometry)
├── Plans/                       # Phase-by-phase implementation plans
│   ├── README.md                # Plan navigation guide
│   ├── 0 - planWebsiteHemsedal.md       # Master plan (architecture, stack, roadmap)
│   ├── 01 - plan-phase-0-setup.md        # Phase 0: scaffold (complete)
│   ├── 02 - plan-phase-1-landscape-mvp.md # Phase 1: Blender-authored landscape (in progress)
│   └── 03 - world-map.md        # World map — coordinate system, zones, landmark positions
└── websitehemsedal/             # The Next.js app
    ├── AGENTS.md                # App-level agent rules (Next.js specifics)
    ├── package.json
    ├── next.config.ts
    ├── tsconfig.json
    ├── .prettierrc
    ├── eslint.config.mjs
    ├── public/
    │   └── models/
    │       └── hemsedal-landscape.glb  # Optimized Blender export
    └── src/
        ├── app/                 # App Router (layout.tsx, page.tsx, globals.css)
        ├── components/          # React components (World, Scene, Sky, etc.)
        ├── lib/
        │   ├── shaders/         # GLSL shaders (sky + grading only — no terrain shader)
        │   ├── worldMap.ts      # World coordinates, zones, landmark references
        │   └── cameraPositions.ts # Saved hero camera shots
        └── styles/
            ├── tokens.css       # Design tokens (palette, type, spacing, z-index)
            └── base.css         # CSS reset + base layers
```

---

## Code Conventions

### TypeScript
- Strict mode is on. No `any` without a comment explaining why.
- Use `import type` for type-only imports.
- Path alias: `@/*` → `./src/*`.

### React / R3F
- All 3D components are client components (`"use client"`).
- Shaders live in `src/lib/shaders/*.ts` as exported template strings. Only **sky** and **grading** shaders exist — terrain is a Blender-authored mesh, not a shader.
- The **Blender scene** (`assets/blender/hemsedal-landscape.blend`) is the source of truth for all geometry. Export → optimize → load via `useGLTF` in `World.tsx`.
- Leva `useControls` is used for tunable visual parameters (sky colors, fog, grading). Never hardcode a value that should be tunable.
- The `<Canvas>` is mounted once in `Scene.tsx`, fixed full-screen behind DOM content (`.canvas-container`).
- DOM content scrolls over the canvas (`.content-layer`).
- **World map:** `Plans/03 - world-map.md` defines all coordinates, zones, and landmark positions. `src/lib/worldMap.ts` mirrors it in code. Always update both when moving something.

### CSS / Design Tokens
- **No Tailwind, no CSS-in-JS.** All styling is CSS custom properties + CSS Modules.
- `src/styles/tokens.css` defines the entire design system: palette, fluid type scale, spacing rhythm, z-index layers, easing curves, breakpoints.
- The palette in `tokens.css` **must mirror** the Blender vertex colors and shader colors. When you change a color in one place, change it in all three.
- Use `clamp()` for fluid values. Use cascade layers (`@layer reset, base, components, utilities`).
- Component-scoped styles go in CSS Modules colocated with the component (e.g., `Hero.module.css`).

### Shaders (GLSL)
- Only **sky** and **grading** shaders exist. Terrain is a Blender-authored mesh with baked vertex colors — no terrain shader.
- Sky shader: gradient dome + sun glow. Grading shader: exposure, contrast, split-toning, vignette (the "film look").
- All palette colors come from CSS custom properties (read via `getComputedStyle` at init, exposed in Leva).
- When the palette changes in `tokens.css`, repaint vertex colors in Blender and re-export the glTF.

### Prettier
- Config in `websitehemsedal/.prettierrc`: semi-colons, double quotes, 2-space indent, 80 char width, trailing commas (es5).
- Run `npm run format` before committing.

### Git
- Commit messages: short imperative subject, blank line, bullet-point body for multi-line changes.
- Always include the Mistral Vibe co-author trailer:
  ```
  Generated by Mistral Vibe.
  Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  ```

---

## Development Workflow

### Commands (run inside `websitehemsedal/`)

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build (also type-checks)
npm run lint         # ESLint
npm run format       # Prettier write
npm run format:check # Prettier check
```

### The Blender → Browser Loop (Phase 1 heart)

1. Open `assets/blender/hemsedal-landscape.blend`
2. Sculpt terrain, place landmarks, paint vertex colors
3. Export glTF → optimize with gltf-transform → save to `public/models/`
4. `npm run dev` → see the result in the browser
5. Tune sky, fog, and grading in the Leva panel
6. **Update `Plans/03 - world-map.md`** if you moved anything
7. Repeat

### Free-Fly Camera (dev only)

| Input | Action |
|---|---|
| Click viewport | Lock pointer (mouse look) |
| `W` `A` `S` `D` | Move horizontally |
| `Space` | Ascend |
| `Shift` | Descend |
| `Esc` | Release pointer lock |

Remove or gate `FreeFlyCamera` behind `NODE_ENV` in Phase 2.

---

## Art Direction Framework (🎨)

The project has 11 explicit art-direction decision points. Each maps to a specific file or Leva panel. **If a parameter is exposed in Leva or a CSS token, it's yours to tune. If it's hardcoded infrastructure, leave it.**

| # | Decision | Where |
|---|---|---|
| 🎨 A | **Palette** (5–7 core colors) | `src/styles/tokens.css` + shader uniforms |
| 🎨 B | **Terrain character** (peaks vs. hills) | Blender sculpt → `assets/blender/hemsedal-landscape.blend` |
| 🎨 C | **Landmark concepts** (2–3 hero landmarks) | Blender → `assets/blender/` → `public/models/` |
| 🎨 D | **Landmark placement** (where in the world) | Blender + `Plans/03 - world-map.md` |
| 🎨 E | **Atmosphere mood** (fog, sky, time-of-day) | Leva → "Sky" + scene fog |
| 🎨 F | **Camera framing** (hero shots) | `src/lib/cameraPositions.ts` |
| 🎨 G | **Color grading** (film look) | Leva → "Color Grading" |
| 🎨 H | **Typography** | `src/app/layout.tsx` |
| 🎨 I | **Copy & voice** | `src/app/` content |
| 🎨 J | **Motion personality** (camera easing) | Phase 2 — GSAP timeline |
| 🎨 K | **Postprocessing style** (bloom, grain, DOF) | Phase 4 — postprocessing stack |

### Current Palette (🎨 A — refine freely)

| Token | Value | Role |
|---|---|---|
| `--color-snow` | `#e8edf2` | Snow caps, highlights |
| `--color-rock` | `#3a4250` | Exposed rock, steep faces |
| `--color-grass` | `#2d4a3e` | Alpine ground |
| `--color-valley` | `#1a2028` | Low areas, valleys |
| `--color-fog` | `#2a3542` | Atmospheric fog |
| `--color-sky-top` | `#1c2836` | Sky zenith |
| `--color-sky-hor` | `#4a6076` | Sky horizon |
| `--color-accent` | `#e8a54b` | Warm amber — cabin lights, UI |

---

## Key Files Reference

| File | Purpose |
|---|---|
| `Plans/03 - world-map.md` | **World map** — coordinate system, zones, landmark positions, camera shots, packing item locations |
| `assets/blender/hemsedal-landscape.blend` | **Blender scene** — source of truth for all geometry |
| `websitehemsedal/public/models/hemsedal-landscape.glb` | Optimized glTF export of the Blender scene |
| `websitehemsedal/src/components/Scene.tsx` | Canvas mount, scene composition, Leva panel |
| `websitehemsedal/src/components/World.tsx` | Loads the Blender glTF scene via `useGLTF` |
| `websitehemsedal/src/components/Sky.tsx` | Gradient sky dome + sun glow shader |
| `websitehemsedal/src/components/FreeFlyCamera.tsx` | Dev-only fly camera (WASD + mouse look) |
| `websitehemsedal/src/lib/shaders/sky.vert.ts` | GLSL: sky dome vertex |
| `websitehemsedal/src/lib/shaders/sky.frag.ts` | GLSL: sky gradient + sun glow |
| `websitehemsedal/src/lib/worldMap.ts` | Code mirror of the world map: zones, landmarks, bounds |
| `websitehemsedal/src/lib/cameraPositions.ts` | Saved hero camera shots (for Phase 2 spline) |
| `websitehemsedal/src/styles/tokens.css` | Design tokens — the brand |
| `websitehemsedal/src/styles/base.css` | CSS reset + base layers + canvas/content z-index |
| `websitehemsedal/src/app/page.tsx` | Home page: mounts Scene + title overlay |
| `websitehemsedal/src/app/layout.tsx` | Root layout, fonts, metadata |

---

## Phase Status

| Phase | Status | Description |
|---|---|---|
| 0 — Setup | ✅ Complete | Next.js + TS + R3F + deps + design tokens + Prettier |
| 1 — Landscape MVP | 🔄 In progress | Blender-authored terrain + landmarks, glTF pipeline, sky shader, fog, free-fly camera, color grading. See `Plans/03 - world-map.md`. |
| 2 — Camera & Scroll | ⬜ Not started | Lenis + GSAP scroll-driven camera spline, nav transitions |
| 3 — Content & CMS | ⬜ Not started | Packing checklist sections, copy, contact form |
| 4 — Art Direction & Polish | ⬜ Not started | Postprocessing, loading screen, fonts, audio |
| 5 — Perf & Launch | ⬜ Not started | Mobile degradation, SEO, analytics, launch |

---

## Rules for AI Agents

1. **Read before you write.** Always read the target file and its imports before editing.
2. **Read the world map.** `Plans/03 - world-map.md` is the source of truth for all spatial decisions. Check it before placing or moving anything.
3. **Preserve the Next.js agent block** in `websitehemsedal/AGENTS.md` — it's auto-generated and re-added by `next dev`.
4. **Tune via Leva for shaders.** Sky, fog, and grading parameters go through Leva. Never hardcode them.
5. **Geometry changes happen in Blender.** Terrain, landmarks, and props are authored in `assets/blender/hemsedal-landscape.blend`. Export → optimize → reload. Don't try to generate geometry in code.
6. **CSS tokens mirror Blender vertex colors and shader colors.** Change all three or none.
7. **Update the world map when you move something.** Both `Plans/03 - world-map.md` (docs) and `src/lib/worldMap.ts` (code).
8. **Run `npm run format` and `npm run lint`** before considering any change done.
9. **Don't install new dependencies** without a clear reason stated in the commit message.
10. **The landscape is the brand.** Every visual decision should make the world feel more like Hemsedal, not more generic.
11. **Phase plans are in `Plans/`.** Read the relevant phase plan before starting work on that phase.
12. **Commit with the Mistral Vibe trailer** (see Git section above).
