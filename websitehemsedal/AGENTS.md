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
│   │   ├── World.tsx           # Loads Blender glTF scene (terrain + landmarks)
│   │   ├── Sky.tsx             # Gradient sky dome + sun glow shader
│   │   └── FreeFlyCamera.tsx   # Dev-only WASD fly camera
│   ├── lib/
│   │   ├── shaders/            # GLSL as TS template strings (sky + grading only)
│   │   │   ├── sky.vert.ts
│   │   │   └── sky.frag.ts
│   │   ├── worldMap.ts         # World coordinates, zones, landmark refs
│   │   └── cameraPositions.ts  # Hero camera shots
│   └── styles/
│       ├── tokens.css          # Design tokens (palette, type, spacing, z-index)
│       └── base.css            # Reset + base + canvas/content layers
├── public/
│   └── models/
│       └── hemsedal-landscape.glb  # Optimized Blender export
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
- **Geometry comes from Blender.** The terrain, landmarks, and props are authored in `assets/blender/hemsedal-landscape.blend` and loaded as a glTF scene in `World.tsx` via `useGLTF`. Do NOT generate geometry in code.
- **Shaders** are TS template strings in `src/lib/shaders/*.ts`. Only sky and grading shaders exist — no terrain shader.
- **Leva** (`useControls`) is the tuning UI for sky colors, fog, and grading. All shader parameters go through Leva.
- **Palette colors** are read from CSS custom properties at init via `getComputedStyle(document.documentElement).getPropertyValue(...)`.
- **dpr** is clamped to `[1, 2]`.
- **World map:** `Plans/03 - world-map.md` (repo root) defines all coordinates. `src/lib/worldMap.ts` mirrors it in code.

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

## Phase 1 Workflow (Blender → Browser)

1. Open `assets/blender/hemsedal-landscape.blend` (repo root)
2. Sculpt terrain, place landmarks, paint vertex colors matching `tokens.css`
3. Export glTF → `npx @gltf-transform/cli optimize` → save to `public/models/hemsedal-landscape.glb`
4. `npm run dev` → `localhost:3000`
5. Leva panel (top-right) — tune sky colors, fog, grading
6. Click viewport → pointer lock → **WASD + Space/Shift** to fly and scout camera positions
7. Update `Plans/03 - world-map.md` and `src/lib/worldMap.ts` if you moved anything
8. Save camera positions to `src/lib/cameraPositions.ts`

---

## Don'ts

- ❌ Don't install Tailwind, Sass, or any CSS framework
- ❌ Don't mount a second `<Canvas>`
- ❌ Don't generate terrain or landmark geometry in code — it's all in Blender
- ❌ Don't hardcode shader parameters — use Leva
- ❌ Don't change the palette in tokens.css without repainting vertex colors in Blender
- ❌ Don't move a landmark without updating `Plans/03 - world-map.md` and `src/lib/worldMap.ts`
- ❌ Don't remove the `<!-- BEGIN:nextjs-agent-rules -->` block above
- ❌ Don't add `"use client"` to server components unnecessarily
