# HemsedalPackingWebsite
Let's see if this gets done in time



This project is has a twofold purpose:
1. I, being a hungry nerd, want to try to learn 3d web development. I found it cool 2 years ago and i still do. 
2. Me and my collagues are heading to Hemsedal this winter, and i want to make sure that everyone brings the things they need. From experience, people going on an organised trip tend to act a bit like chickens at times, which i don´t particularly enjoy.  

It is heavily inspired by basement.studios, make sure to check them out for how to do it properly!

---

## Where to Apply Your Artistic Flair

The code is the canvas — you are the painter. These are the moments where you stop engineering and start art-directing. Each one maps to a specific step in the phase plans.

| # | Decision | What You Choose | Where | Phase |
|---|----------|-----------------|-------|-------|
| 🎨 **A** | **Palette** | 5–7 core colors that define the world (snow, rock, grass, sky, fog, accent). These become CSS tokens and shader uniforms. | `websitehemsedal/src/styles/tokens.css` | 1 |
| 🎨 **B** | **Terrain character** | How dramatic are the mountains? Jagged peaks, rolling hills, wide valleys? You sculpt this directly in Blender. | Blender → `assets/blender/hemsedal-landscape.blend` | 1 |
| 🎨 **C** | **Landmark concepts** | What are the 2–3 hero landmarks? A cabin, a stone cairn, a ski lift pylon? Sketch, then model in Blender. | Blender → `assets/blender/` → `public/models/` | 1 |
| 🎨 **D** | **Landmark placement** | Where does each landmark sit? On a ridge, in a valley, beside a trail? Compose the world in Blender, documented in the world map. | Blender + `Plans/03 - world-map.md` | 1 |
| 🎨 **E** | **Atmosphere mood** | Fog density, sky gradient, time-of-day feel. Crisp morning, moody dusk, blue hour? | Leva → "Sky" + scene fog | 1 |
| 🎨 **F** | **Camera framing** | Where does the camera rest? What are the hero shots that frame the landscape beautifully? | `websitehemsedal/src/lib/cameraPositions.ts` | 1 |
| 🎨 **G** | **Color grading** | The "film look" — warm highlights, cool shadows, contrast, vignette. Subtle or bold. | Leva → "Color Grading" | 1 |
| 🎨 **H** | **Typography** | Display font, body font. Geist is the default — replace with something that has more character. | `websitehemsedal/src/app/layout.tsx` | 4 |
| 🎨 **I** | **Copy & voice** | What does the site say? Playful, practical, poetic? The packing checklist needs a tone. | `websitehemsedal/src/app/` content | 3 |
| 🎨 **J** | **Motion personality** | How does the camera move? Smooth and cinematic, snappy and playful? Easing curves define the feel. | Phase 2 — GSAP timeline tuning | 2 |
| 🎨 **K** | **Postprocessing style** | Bloom intensity, grain amount, depth-of-field strength. The difference between "film" and "WebGL demo." | Phase 4 — postprocessing stack | 4 |

> **Rule of thumb:** If a parameter is exposed in the Leva panel or a CSS token, it's yours to tune. If it's baked into the Blender scene, change it in Blender and re-export. The Blender scene is the canvas — `Plans/03 - world-map.md` is the map. The tuning loops are where the magic happens — budget time for them.