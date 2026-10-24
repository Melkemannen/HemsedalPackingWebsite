# Plans — Phase-by-Phase Implementation

This directory contains detailed implementation plans for the Hemsedal Packing Website, organized by development phase.

---

## How to Use These Plans

1. **Read the master plan first** (`0 - planWebsiteHemsedal.md`) for architecture, tech stack rationale, and the full roadmap.
2. **Check the current phase** in the root `AGENTS.md` under "Phase Status".
3. **Read the active phase plan** end-to-end before starting work on that phase.
4. **Follow the step-by-step plan** — each step lists files to create/modify and verification criteria.
5. **Check off items** in the phase's final checklist before moving to the next phase.
6. **Update the root `AGENTS.md`** with the phase's completion status and any handoff notes.
7. **Update this README** with any new phase plans or changes to the roadmap.

---

## Plan Index

| File | Phase | Status | Scope |
|---|---|---|---|
| `0 - planWebsiteHemsedal.md` | Master | ✅ Reference | Architecture, tech stack, landscape routes, performance budgets, full roadmap |
| `01 - plan-phase-0-setup.md` | 0 — Setup | ✅ Complete | Next.js + TS + R3F scaffold, deps, Prettier, design tokens, Vercel deploy |
| `02 - plan-phase-1-landscape-mvp.md` | 1 — Landscape MVP | 🔄 In progress | Procedural terrain, palette shader, sky, fog, Blender landmarks, free-fly camera, color grading |

---

## Future Phase Plans (not yet written)

| Phase | Scope | Output |
|---|---|---|
| 2 — Camera & Scroll | Lenis + GSAP scroll-driven camera spline, nav transitions, section reveals | The "basement feel" |
| 3 — Content & CMS | Packing checklist sections, copy, contact form, MDX or CMS wiring | A real website |
| 4 — Art Direction & Polish | Postprocessing stack, loading screen, typography, audio | A distinctive site |
| 5 — Perf & Launch | Mobile degradation, fallbacks, SEO, analytics, OG images | Shipped |

---

## Conventions

- Each phase plan has: goal, output, branch name, estimated time, current state, step-by-step instructions, final checklist, and handoff notes.
- Art-direction decision points are marked with 🎨 A–K and defined in the root `README.md`.
- When a phase is complete, update the "Phase Status" table in the root `AGENTS.md`.
