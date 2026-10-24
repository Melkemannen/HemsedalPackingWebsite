# Plans — Phase-by-Phase Implementation

This directory contains detailed implementation plans for the Hemsedal Packing Website, organized by development phase.

---

## How to Use These Plans

1. **Read the world map first** (`03 - world-map.md`) — it defines the coordinate system and placement of every element in the 3D scene. All Blender work and code placement references it.
2. **Read the master plan** (`0 - planWebsiteHemsedal.md`) for architecture, tech stack rationale, and the full roadmap.
3. **Check the current phase** in the root `AGENTS.md` under "Phase Status".
4. **Read the active phase plan** end-to-end before starting work on that phase.
5. **Follow the step-by-step plan** — each step lists files to create/modify and verification criteria.
6. **Check off items** in the phase's final checklist before moving to the next phase.
7. **Update the world map** whenever you move a landmark, add a zone, or change a camera position.
6. **Update the root `AGENTS.md`** with the phase's completion status and any handoff notes.
7. **Update this README** with any new phase plans or changes to the roadmap.

---

## Plan Index

| File | Phase | Status | Scope |
|---|---|---|---|
| `0 - planWebsiteHemsedal.md` | Master | ✅ Reference | Architecture, tech stack, Blender pipeline, performance budgets, full roadmap |
| `01 - plan-phase-0-setup.md` | 0 — Setup | ✅ Complete | Next.js + TS + R3F scaffold, deps, Prettier, design tokens, Vercel deploy |
| `02 - plan-phase-1-landscape-mvp.md` | 1 — Landscape MVP | 🔄 In progress | Blender-authored terrain + landmarks, glTF pipeline, sky shader, fog, free-fly camera, color grading |
| `03 - world-map.md` | Reference | 📍 Living doc | World coordinate system, zones, landmark positions, camera shots, packing item locations — **the source of truth for all spatial decisions** |

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
