# Implementation Plan: 3D Landscape Website

A scroll-driven, 3D-first studio site in the spirit of basement.studio — but with **your own landscape and identity**.

> **Rule of thumb:** borrow the *architecture*, never the *art direction*. Basement's edge is their scene art + shaders + motion choreography. Studying their open-source code is fine; the landscape, palette, typography, and copy must be yours.

---

## 1. Anatomy of basement.studio (what you're replicating)

Basement's site is open source ([github.com/basementstudio/website-2k25](https://github.com/basementstudio/website-2k25)), which makes it the best reference available. Key facts:

- **One persistent 3D scene** rendered behind/around the DOM content. Navigation doesn't load a new page — it flies the camera to another spot in the same scene.
- The landscape is **not one giant model**: it's a composed scene (terrain, props, buildings) with **baked lightmaps** (no real-time shadows), plus a **custom global GLSL shader** that applies grading/fog across the scene.
- **Scroll and nav both drive camera animation** between "areas" that map to site sections (home, showcase, services, etc.).
- Extras (games, pets, inspectable objects) are layered on top of the same scene graph.

So "a website like basement.studio" = *a small 3D world + a camera choreography system + conventional web content floating over it.*

---

## 2. Recommended Tech Stack

| Layer | Choice | Why |
| --- | --- | --- |
| **Framework** | Next.js (App Router) + TypeScript | Same choice as basement; R3F-friendly, static export possible, great DX |
| **3D engine** | three + @react-three/fiber + @react-three/drei | Declarative Three.js; the entire ecosystem (postprocessing, rapier, etc.) builds on it |
| **Postprocessing** | @react-three/postprocessing (or basement's `@basementstudio/shader-lab`) | Bloom, DOF, grain, vignette — the "film look" |
| **Scroll / motion** | Lenis (smooth scroll) + GSAP ScrollTrigger (camera timeline) + Motion for UI | Scroll drives a GSAP timeline that scrubs camera position along a path |
| **3D assets (if modeling)** | Blender → glTF + Draco + KTX2 textures | Industry standard pipeline; basement does exactly this |
| **State** | Zustand | Lightweight; basement uses it to bridge DOM ↔ 3D state |
| **Styling** | CSS Modules + design tokens in CSS custom properties | Zero runtime, zero dependencies, fully custom art direction (see §2.1) |
| **CMS / content** | Sanity (or Basehub) — or plain MDX to start | Sections, blog posts, showcase entries editable without deploys |
| **Backend needs** | Minimal: server actions / API routes for contact form + email (e.g. Resend), optional newsletter | A studio site is 95% static; don't build a real backend until needed |
| **Analytics** | Vercel Analytics or PostHog | Lightweight, privacy-friendly |
| **Hosting** | Vercel (or Netlify) | Zero-ops, edge CDN, preview deploys |
| **Dev tooling** | ESLint, Prettier, `r3f-perf` (in-dev FPS/draw-call meter), git LFS for heavy assets | Keep 3D perf visible during development |

**Backend reality check:** the "backend" for this site is mostly a CDN. Content comes from the CMS, the contact form is one serverless function, and everything else is static assets. Spend your effort on the frontend and the scene, not on servers.

### 2.1 Styling: CSS Modules + CSS custom properties (no Tailwind)

Utility CSS fights you on art-directed sites anyway — this project needs bespoke layout, typography, and scroll-linked animation, not utility classes.

**Structure:**

- **`styles/tokens.css`** (global, imported once in the root layout): the entire design system as CSS custom properties — palette, type scale (`--font-display`, `--step-0…--step-6`), spacing rhythm, z-index layers (`--z-canvas`, `--z-content`, `--z-nav`), easing curves, breakpoints. This file *is* the brand, mirroring the shader palette.
- **CSS Modules** per component (`Hero.module.css`, `Nav.module.css`) — scoped class names, colocated with components, zero runtime cost.
- **`styles/base.css`**: a modern reset (`@layer reset, base, components, utilities`) — native cascade layers avoid specificity wars.
- **Modern CSS does the heavy lifting:** `clamp()` fluid type, container queries, `color-mix()`, `:has()`, grid/flexbox. Nothing that needed a preprocessor or utility framework in 2019 still does in 2026.

**Why not the other candidates:**

| Alternative | Verdict |
| --- | --- |
| Sass/SCSS | Fine, but modern CSS covers ~95% of it; adds a build step for little gain |
| vanilla-extract / PandaCSS | Type-safe CSS-in-TS; good libraries, but overkill for a single art-directed site and their APIs slow down freeform design iteration |
| styled-components / Emotion | Runtime cost and SSR friction in App Router; legacy choice now |

If you later miss type-safety on tokens, generate TypeScript constants from `tokens.css` in a build step — but start with the plain CSS setup; it's the least machinery that fully does the job.

---

## 3. Creating Your Own Landscape — Blender-Authored (Route B)

**Everything in the scene is authored in Blender.** Terrain, landmarks, props, cameras — the entire world is sculpted, composed, and lit in Blender, then exported as optimized glTF and loaded into the browser. This is the basement.studio approach, and it gives you full art direction over every pixel of the landscape.

> **Why not procedural?** Procedural terrain looks "generated" and gives you no precise control over composition. With Blender, you decide exactly where every ridge, valley, cabin, and camera angle sits. The world map in `Plans/03 - world-map.md` documents the coordinate system and placement of every element.

### The Blender → Web Pipeline

1. **Model the terrain:** sculpt the Hemsedal landscape in Blender — valleys, ridges, peaks, a frozen lake bed. Low-poly stylized. Target < 150k–300k triangles for the hero terrain mesh.
2. **Author landmarks & props:** cabins, stone cairns, ski lift pylons, trees, rocks — all placed directly in the terrain scene at their final world positions (see the world map).
3. **UV + vertex colors:** use vertex colors for the palette (snow, rock, grass, valley). Keep it stylized — photoreal textures blow the payload budget. Hand-painted textures only where vertex colors aren't enough.
4. **Bake lighting:** bake an AO/lightmap into a texture instead of using real-time shadows (exactly what basement did — shadows off, baked light in the texture).
5. **Organize with collections:** use Blender collections to separate terrain, landmarks, skybox markers, and camera targets. Name everything descriptively.
6. **Export & compress:** export glTF → run `gltf-transform` (Draco or Meshopt compression) → convert textures to KTX2/Basis (`toktx`) so the GPU download is small. Budget: 5–10 MB total.
7. **Load in R3F:** `useGLTF` with `Suspense`. The terrain and landmarks arrive as one composed scene (or split into chunks for streaming).

### What stays in shaders (not Blender)

| Element | Why it's code |
|---|---|
| **Sky dome** | Gradient sky + sun glow — a simple sphere shader, cheap and infinitely tunable |
| **Fog** | Exponential fog in the scene, color matched to the palette |
| **Color grading** | Global post-process shader (exposure, contrast, split-toning, vignette) — the "film look" |
| **Water** (optional) | A flat plane with a ripple shader at the frozen lake location |

These are atmosphere, not geometry. They layer on top of the authored scene.

- ✅ Full art direction, unique identity, "authored" feel, precise composition control
- ✅ Every landmark and camera angle is placed exactly where you want it
- ❌ Requires Blender skills + asset pipeline; heavier payload (budget 5–10 MB total)
- ❌ Terrain changes require a Blender round-trip (export → optimize → reload)

---

## 4. Scene & Interaction Architecture

```mermaid
flowchart TD
  subgraph DOM["React DOM layer"]
    Content["Sections / nav / overlay UI"]
    Lenis["Lenis smooth scroll"]
  end
  subgraph Store["Zustand store"]
    State["scroll progress, active section, loaded state"]
  end
  subgraph R3F["R3F Canvas (persistent)"]
    Scene["Landscape scene graph"]
    Cam["CameraRig (path + look-at targets)"]
    FX["Postprocessing / global shader"]
  end
  Lenis -->|"scroll progress"| State
  Content -->|"nav clicks: target section"| State
  State -->|"scrub t 0..1"| Cam
  Cam --> Scene
  Scene --> FX
```

Core ideas to implement:

1. **One `<Canvas>` mounted once**, fixed full-screen behind content. Sections are plain DOM that fades/slides in as the camera arrives at their area.
2. **Camera path:** define a `CatmullRomCurve3` through the landscape with per-point look-at targets. GSAP timeline scrubs `t` along the curve from scroll progress (and from nav clicks, with smooth easing). This one system powers both scroll-telling and page navigation, just like basement.
3. **Global shader:** one material wrapper (basement's "global shader material" pattern) that applies grading/fog uniformly so every asset matches the palette.
4. **Postprocessing stack:** subtle bloom → depth of field → film grain → vignette. Restraint here is what separates "film" from "WebGL demo."
5. **Optional later:** raycast hover on props, ambient audio, small physics gags (`@react-three/rapier`).

---

## 5. Performance & Fallbacks (non-negotiable)

- **Budgets:** JS < ~300 KB gz (excluding three/assets), 3D assets < 8 MB, 60 fps on a mid-tier laptop, first meaningful paint < 3 s on fast 4G.
- **Loading:** preload screen with real progress (`useProgress` from drei) — make it part of the brand, not an apology.
- **Rendering hygiene:** clamp `dpr` to `[1, 2]`, prefer baked light over real-time shadows, instance repeated props, frustum-cull by default, `frameloop="demand"` if nothing animates when idle.
- **Mobile:** detect weak GPUs (`navigator.hardwareConcurrency`, WebGL stats, or drei's `PerformanceMonitor`) and degrade — fewer postprocessing passes, lower dpr, no DOF. Worst case: static poster render of the landscape + normal DOM site.
- **Accessibility & motion:** respect `prefers-reduced-motion` (static camera per section), full keyboard navigation, WebGL-missing fallback page.
- **SEO:** the DOM content layer is real HTML — keep it semantic and crawlable even though visuals are canvas-driven.

---

## 6. Roadmap

| Phase | Scope | Output |
| --- | --- | --- |
| **0 — Setup** (0.5 wk) | Next.js + TS + CSS + R3F scaffold, lint, deploy pipeline to Vercel on day one | Empty site live on a URL |
| **1 — Landscape MVP** (3–4 wk) | Blender-authored terrain + landmarks, baked lighting, glTF pipeline; sky shader + fog; free-fly camera | Your world exists in the browser |
| **2 — Camera & scroll** (1–2 wk) | Lenis + GSAP timeline, spline camera rig, nav transitions, section reveal logic | The "basement feel" |
| **3 — Content & CMS** (1–2 wk) | Sections (work/services/about/contact), CMS or MDX wiring, contact form server action | A real website |
| **4 — Art direction & polish** (2 wk) | Landmark props, postprocessing pass, loading screen, fonts/copy, audio (optional) | A distinctive site |
| **5 — Perf & launch** (1 wk) | Budget enforcement, mobile degradation, fallbacks, SEO, analytics, OG images | Shipped |

Phases 1–2 are the project's heart; everything after is conventional web work. Phase 1 is now Blender-heavy — expect the terrain sculpting and landmark modeling to take most of the time. The look-development loop (sculpt in Blender → export → view in browser → adjust) is slower than shader tweaking but gives far more control.

---

## 7. Key Risks

- **Scope creep in the scene** — every prop is a mini-project. Ship 3 great landmarks, not 20 mediocre ones.
- **Blender round-trip time** — terrain changes require sculpt → export → optimize → reload. Keep the world map (`Plans/03 - world-map.md`) updated so you don't lose track of positions between iterations.
- **Payload budget** — Blender-authored scenes with textures can blow past 10 MB. Use gltf-transform aggressively (Draco + KTX2). Profile with `r3f-perf`.
- **Mobile performance** — test on a real mid-range phone from week 2, not at the end.
- **Shader debugging time** — sky and grading shaders iterate slowly if you rebuild constantly; use Leva for live uniform tuning.
- **Copying too closely** — basement's scene is recognizable; the further your palette, terrain, and camera language are from theirs, the better the site will do its job for you.

---

## 8. Starter Checklist

- [ ] Scaffold Next.js + R3F + Lenis + GSAP; deploy skeleton
- [ ] Define world map & coordinate system (`Plans/03 - world-map.md`)
- [ ] Model terrain + landmarks in Blender; bake lighting & vertex colors
- [ ] Export glTF → optimize with gltf-transform → load in R3F
- [ ] Fog + gradient sky; establish the palette (this *is* the brand)
- [ ] Camera spline with 3 waypoint "areas"; scrub with scroll
- [ ] DOM sections tied to camera arrival
- [ ] Preload screen with progress
- [ ] Postprocessing (bloom/DOF/grain — restrained)
- [ ] Contact form + CMS content
- [ ] Mobile degradation path + reduced-motion support
- [ ] Perf budget pass, SEO, analytics, launch