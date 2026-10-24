<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# AGENTS.md — websitehemsedal (Next.js App)

> **Read the root `AGENTS.md` first** for full project context, conventions, art direction, and phase status. This file covers app-level specifics.

---

## App Structure

```
websitehemsedal/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout — fonts, metadata, globals.css import
│   │   ├── page.tsx            # Home — mounts <Scene /> + title overlay
│   │   ├── globals.css         # Imports tokens.css + base.css
│   │   └── favicon.ico
│   ├── components/             # React components (all 3D ones are "use client")
│   │   ├── Scene.tsx           # Canvas mount + scene composition + Leva
│   │   ├── Terrain.tsx         # Procedural terrain + shader + Leva controls
│   │   ├── Sky.tsx             # Gradient sky dome + sun glow
│   │   ├── FreeFlyCamera.tsx   # Dev-only WASD fly camera
│   │   └── Landmark.tsx        # glTF landmark loader
│   ├── lib/
│   │   ├── shaders/            # GLSL as TS template strings
│   │   │   ├── terrain.vert.ts
│   │   │   ├── terrain.frag.ts
│   │   │   ├── sky.vert.ts
│   │   │   └── sky.frag.ts
│   │   ├── terrain/
│   │   │   ├── constants.ts    # Baked defaults (terrain, grading, sky)
│   │   │   └── heightmap.ts    # CPU-side height function (landmark Y)
│   │   ├── landmarks.ts        # Landmark definitions
│   │   └── cameraPositions.ts  # Hero camera shots
│   └── styles/
│       ├── tokens.css          # Design tokens (palette, type, spacing, z-index)
│       └── base.css            # Reset + base + canvas/content layers
├── public/
│   └── models/                 # Blender .glb landmarks
├── next.config.ts
├── tsconfig.json
├── .prettierrc
└── eslint.config.mjs
```

---

## Next.js / App Router Conventions

- **App Router** with `cacheComponents: true` and `partialPrefetching: true` in `next.config.ts`.
- **React Compiler** is enabled (`reactCompiler: true`). Don't fight it — let it optimize.
- **Server Components by default.** Add `"use client"` only when needed (hooks, browser APIs, event handlers, R3F).
- **Path alias:** `@/*` → `./src/*`.
- **`LayoutProps<"/">`** is a global type (Next.js 16) — use it for typed layouts.
- **Fonts:** Geist Sans + Geist Mono via `next/font/google`, exposed as CSS variables `--font-geist-sans` / `--font-geist-mono`.

---

## R3F / Three.js Conventions

- **One `<Canvas>`** mounted once in `Scene.tsx`. Never mount multiple canvases.
- **Canvas container** is `.canvas-container` — `position: fixed; inset: 0; z-index: var(--z-canvas)`.
- **DOM content** scrolls over the canvas via `.content-layer` (`z-index: var(--z-content)`).
- **Shaders** are TS template strings in `src/lib/shaders/*.ts`, imported into components. No `.glsl` file imports needed.
- **Leva** (`useControls`) is the tuning UI. All visual parameters go through Leva.
- **Default values** for Leva controls come from `src/lib/terrain/constants.ts`.
- **Palette colors** are read from CSS custom properties at init via `getComputedStyle(document.documentElement).getPropertyValue(...)`.
- **dpr** is clamped to `[1, 2]`.
- **Landmarks** use `useGLTF` from drei, cloned per-instance, placed at terrain height via `getTerrainHeight(x, z)`.

---

## CSS Conventions

- **No Tailwind, no CSS-in-JS, no styled-components.** Plain CSS only.
- **Design tokens** in `src/styles/tokens.css` — palette, fluid type scale (`--step-0` to `--step-5`), spacing (`--space-xs` to `--space-2xl`), z-index layers, easing curves.
- **Cascade layers:** `@layer reset, base, components, utilities` (declared in `base.css`).
- **Canvas/content separation:** `.canvas-container` is `position: fixed; z-index: var(--z-canvas); pointer-events: none`. The canvas itself gets `pointer-events: auto`. Content layer sits at `z-index: var(--z-content)`.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` is handled in `base.css`.
- **CSS Modules** for component-scoped styles (colocated `.module.css` files).

---

## Commands

Run all commands from `websitehemsedal/`:

```bash
npm run dev          # Dev server at localhost:3000
npm run build        # Production build + type check
npm run lint         # ESLint (flat config)
npm run format       # Prettier --write
npm run format:check # Prettier --check
```

---

## Phase 1 Tuning Loop

1. `npm run dev` → `localhost:3000`
2. Leva panel (top-right) — tweak terrain shape, palette, lighting, sky, color grading
3. Click viewport → pointer lock → **WASD + Space/Shift** to fly
4. Note camera positions for hero shots → save to `src/lib/cameraPositions.ts`
5. Bake tuned values into `src/lib/terrain/constants.ts`

---

## Don'ts

- ❌ Don't install Tailwind, Sass, or any CSS framework
- ❌ Don't mount a second `<Canvas>`
- ❌ Don't hardcode visual parameters — use Leva + `constants.ts`
- ❌ Don't change the palette in tokens.css without updating shader uniforms (and vice versa)
- ❌ Don't change noise params in GLSL without updating `heightmap.ts`
- ❌ Don't remove the `<!-- BEGIN:nextjs-agent-rules -->` block above
- ❌ Don't add `"use client"` to server components unnecessarily
