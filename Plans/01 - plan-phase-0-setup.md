# Phase 0 — Setup (Detailed Plan)

**Goal:** Next.js + TS + CSS + R3F scaffold, lint, deploy pipeline to Vercel on day one.
**Output:** Empty site live on a URL.
**Branch:** `1-setup-initial-framework` (already checked out)
**Estimated time:** 0.5 week

---

## Current State

The project at `websitehemsedal/` is a fresh `create-next-app` scaffold with:

| Layer | Status |
|---|---|
| Next.js 16.4.3 (App Router) | ✅ Done |
| TypeScript (strict) | ✅ Done |
| React 19.3.0 + React Compiler | ✅ Done |
| ESLint (flat config, core-web-vitals + typescript) | ✅ Done |
| CSS Modules | ✅ Done (default `page.module.css` exists) |
| `cacheComponents` + `partialPrefetching` | ✅ Enabled in `next.config.ts` |
| Geist fonts (sans + mono) | ✅ In `layout.tsx` |
| `src/app/` structure | ✅ Done |
| Path alias `@/*` → `./src/*` | ✅ In `tsconfig.json` |
| three / @react-three/fiber / @react-three/drei | ❌ Not installed |
| Lenis (smooth scroll) | ❌ Not installed |
| GSAP + @gsap/react | ❌ Not installed |
| Motion (UI animations) | ❌ Not installed |
| Zustand | ❌ Not installed |
| Prettier | ❌ Not installed |
| Design tokens (`styles/tokens.css`) | ❌ Not created |
| Base reset (`styles/base.css`) | ❌ Not created |
| Project folder structure (`components/`, `styles/`, `lib/`, `hooks/`) | ❌ Not created |
| Vercel deployment | ❌ Not configured |
| Default create-next-app boilerplate page | 🗑️ Needs removal |

---

## Step-by-Step Plan

### Step 1 — Install 3D & Motion Dependencies

```bash
cd websitehemsedal

# Core 3D
npm install three @react-three/fiber @react-three/drei

# Scroll & motion
npm install lenis gsap @gsap/react motion

# State
npm install zustand

# Dev tooling
npm install -D prettier @types/three
```

**Why these versions:** Let npm resolve latest compatible. R3F v9+ requires React 19 (we have 19.3.0). drei v10+ matches. Pin after first successful install.

**Post-install check:** Run `npm run dev` and confirm no peer dependency warnings in the terminal.

---

### Step 2 — Configure Prettier

Create `websitehemsedal/.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "plugins": []
}
```

Add to `package.json` scripts:
```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

Add `.prettierignore`:
```
.next/
node_modules/
package-lock.json
```

---

### Step 3 — Create Project Folder Structure

Inside `websitehemsedal/src/`, create:

```
src/
├── app/                    # App Router (existing)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── favicon.ico
├── components/             # Shared React components
│   └── .gitkeep
├── styles/                 # Global styles & design tokens
│   ├── tokens.css          # Design system custom properties
│   └── base.css            # Modern CSS reset
├── lib/                    # Utilities, helpers, constants
│   └── .gitkeep
├── hooks/                  # Custom React hooks
│   └── .gitkeep
└── store/                  # Zustand stores
    └── .gitkeep
```

---

### Step 4 — Create Design Tokens (`src/styles/tokens.css`)

This file defines the entire visual identity as CSS custom properties. It will evolve as the palette is finalized in Phase 1, but establish the structure now:

```css
/* ============================================
   DESIGN TOKENS — Hemsedal Packing Website
   This file IS the brand. Mirror shader palette here.
   ============================================ */

:root {
  /* ── Palette (placeholder — refine in Phase 1) ── */
  --color-bg: #0a0f14;
  --color-surface: #111820;
  --color-text: #e8edf2;
  --color-text-muted: #8a97a5;
  --color-accent: #4da3ff;
  --color-snow: #f0f4f8;
  --color-rock: #3a4250;
  --color-grass: #2d4a3e;

  /* ── Typography ── */
  --font-display: var(--font-geist-sans), system-ui, sans-serif;
  --font-body: var(--font-geist-sans), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), monospace;

  /* Fluid type scale */
  --step--1: clamp(0.75rem, 0.73rem + 0.11vw, 0.8rem);
  --step-0: clamp(1rem, 0.96rem + 0.22vw, 1.125rem);
  --step-1: clamp(1.25rem, 1.19rem + 0.33vw, 1.5rem);
  --step-2: clamp(1.563rem, 1.43rem + 0.65vw, 1.999rem);
  --step-3: clamp(1.953rem, 1.71rem + 1.21vw, 2.666rem);
  --step-4: clamp(2.441rem, 2.05rem + 1.96vw, 3.552rem);
  --step-5: clamp(3.052rem, 2.46rem + 2.96vw, 4.736rem);

  /* ── Spacing rhythm ── */
  --space-xs: clamp(0.25rem, 0.23rem + 0.11vw, 0.375rem);
  --space-s: clamp(0.5rem, 0.46rem + 0.22vw, 0.75rem);
  --space-m: clamp(1rem, 0.89rem + 0.54vw, 1.5rem);
  --space-l: clamp(1.5rem, 1.28rem + 1.09vw, 2.25rem);
  --space-xl: clamp(2rem, 1.61rem + 1.96vw, 3.5rem);
  --space-2xl: clamp(3rem, 2.21rem + 3.91vw, 5.5rem);

  /* ── Z-index layers ── */
  --z-canvas: -1;
  --z-content: 1;
  --z-nav: 10;
  --z-overlay: 100;
  --z-modal: 1000;

  /* ── Easing ── */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);

  /* ── Breakpoints (for JS consumption if needed) ── */
  --bp-mobile: 480px;
  --bp-tablet: 768px;
  --bp-desktop: 1024px;
  --bp-wide: 1440px;

  /* ── Layout ── */
  --content-max: 72rem;
  --content-padding: clamp(1rem, 4vw, 3rem);
}
```

---

### Step 5 — Create Base Reset (`src/styles/base.css`)

```css
/* ============================================
   BASE — Modern CSS reset with cascade layers
   ============================================ */

@layer reset, base, components, utilities;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    -webkit-text-size-adjust: 100%;
    scroll-behavior: smooth;
  }

  body {
    min-height: 100vh;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  img,
  picture,
  video,
  canvas,
  svg {
    display: block;
    max-width: 100%;
  }

  input,
  button,
  textarea,
  select {
    font: inherit;
    color: inherit;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
  }

  ul,
  ol {
    list-style: none;
  }
}

@layer base {
  html {
    height: 100%;
  }

  body {
    height: 100%;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-body);
    font-size: var(--step-0);
  }

  /* The persistent 3D canvas lives behind everything */
  .canvas-container {
    position: fixed;
    inset: 0;
    z-index: var(--z-canvas);
    pointer-events: none;
  }

  .canvas-container canvas {
    pointer-events: auto;
  }

  /* Content scrolls over the canvas */
  .content-layer {
    position: relative;
    z-index: var(--z-content);
  }

  /* Respect reduced motion */
  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }

    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

---

### Step 6 — Update `globals.css`

Replace the current `src/app/globals.css` with imports for the new style system:

```css
@import "../styles/tokens.css";
@import "../styles/base.css";
```

This keeps `globals.css` as the single entry point imported by `layout.tsx`, while the actual styles live in `src/styles/`.

---

### Step 7 — Update Root Layout (`src/app/layout.tsx`)

Update metadata and keep the Geist font setup. The layout stays minimal — no nav or canvas yet:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hemsedal Packing",
  description: "A 3D packing checklist for the Hemsedal winter trip.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

---

### Step 8 — Replace Default Page with Minimal Scaffold

Replace `src/app/page.tsx` with a minimal placeholder:

```tsx
export default function Home() {
  return (
    <main className="content-layer">
      <h1>Hemsedal Packing</h1>
      <p>Setup complete. Landscape coming in Phase 1.</p>
    </main>
  );
}
```

Delete `src/app/page.module.css` (no longer needed for the placeholder).

---

### Step 9 — Verify R3F Can Mount (Smoke Test)

Create a minimal client component to verify three.js + R3F works:

**`src/components/Scene.tsx`** (new file):

```tsx
"use client";

import { Canvas } from "@react-three/fiber";

export default function Scene() {
  return (
    <div className="canvas-container">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 2, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#4da3ff" />
        </mesh>
      </Canvas>
    </div>
  );
}
```

Temporarily add it to `page.tsx` to verify it renders, then comment it out (or remove it) — the real scene comes in Phase 1. This step just proves the dependency chain works.

**Verification:** `npm run dev` → open `localhost:3000` → see a blue cube on dark background.

---

### Step 10 — Lint & Build Verification

```bash
cd websitehemsedal

# Lint
npm run lint

# Type check (via build)
npm run build
```

Fix any issues. The build should succeed with the static placeholder page.

---

### Step 11 — Deploy to Vercel

1. Push the branch to GitHub:
   ```bash
   git add -A
   git commit -m "Phase 0: scaffold with R3F, motion deps, design tokens, Prettier"
   git push origin 1-setup-initial-framework
   ```

2. Go to [vercel.com/new](https://vercel.com/new), import the GitHub repo.
3. Set the **Root Directory** to `websitehemsedal`.
4. Framework preset: Next.js (auto-detected).
5. Click **Deploy**.
6. Once deployed, verify the URL loads the placeholder page.
7. Set the production branch to `1-setup-initial-framework` so every push auto-deploys.

---

### Step 12 — Final Checklist

- [ ] All dependencies installed (three, R3F, drei, lenis, gsap, motion, zustand, prettier)
- [ ] Prettier configured and `npm run format` works
- [ ] `src/styles/tokens.css` created with design tokens
- [ ] `src/styles/base.css` created with reset + base layers
- [ ] `src/app/globals.css` updated to import tokens + base
- [ ] `src/app/layout.tsx` updated with correct metadata
- [ ] `src/app/page.tsx` replaced with minimal scaffold
- [ ] `src/app/page.module.css` deleted
- [ ] Project folders created: `components/`, `styles/`, `lib/`, `hooks/`, `store/`
- [ ] R3F smoke test passes (blue cube renders)
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] Deployed to Vercel, live URL confirmed
- [ ] Branch pushed to GitHub

---

## Phase 0 → Phase 1 Handoff

When Phase 0 is complete, Phase 1 (Landscape MVP) starts with:

1. Replace the smoke-test cube with a procedural terrain (FBM noise on a `PlaneGeometry`)
2. Custom `ShaderMaterial` mapping height/slope to the palette in `tokens.css`
3. Exponential fog + gradient sky matching `--color-bg`
4. Free-fly camera (drei `OrbitControls` or custom) for tuning
5. Iterate on the look — this is the heart of the project

The design tokens in `tokens.css` should be refined during Phase 1 to match whatever palette emerges from the terrain shader work.
