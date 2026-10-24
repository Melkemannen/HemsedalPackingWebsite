# World Map — Hemsedal 3D Landscape

> **This is the single source of truth for all spatial decisions.** Every coordinate, zone boundary, landmark position, and camera angle in the 3D scene is defined here. When you move something in Blender, update this map. When you place something in code, read from this map.

---

## Coordinate System

| Property | Value |
|---|---|
| **Unit** | 1 Blender unit = 1 meter = 1 three.js world unit |
| **Up axis** | +Y (both Blender and three.js, glTF uses +Y Up) |
| **Origin (0, 0, 0)** | Center of the valley floor — the gathering area |
| **Ground level** | Y = 0 at the valley floor |
| **World extents** | X: −150 to +150, Z: −150 to +150, Y: 0 to +60 |
| **Scale reference** | A cabin is ~3m tall. A pine tree is ~8–12m tall. A person would be ~1.7m. |

### Axis Orientation (top-down view, looking down −Y)

```
                 North (+Z)
                    │
                    │
    West (−X) ──────┼────── East (+X)
                    │
                    │
                 South (−Z)
```

---

## Top-Down Layout (ASCII sketch)

```
                    NORTH RIDGE (+Z: 40 → 120)
              ╔═══════════════════════════════╗
              ║  ▲  ▲      ▲                  ║  ▲ = jagged peaks (Y: 35–55)
              ║      ▲        ▲    ▲          ║  ~ = cairn trail marker
              ║  ▲        ~              ▲    ║  ═ = ridge line
              ║    ▲    ════════    ▲        ║
              ║  ▲   ═           ═      ▲     ║
              ╚════╪═════════════════╪═══════╝
                   │                 │
    WEST SLOPE     │   VALLEY FLOOR   │     EAST SLOPE (+X: 40 → 100)
    (−X: −100→−40) │  (X: −40→+40)   │     ski lift pylon
    ~~~ forest     │  ┌───────────┐   │     ~~~ ski terrain
    ~~~            │  │  🏠 CABIN  │   │     ~~~
                   │  │  (12,−8)  │   │     ⛷️
                   │  └───────────┘   │
                   │  ○ gathering     │
                   │  ○ trailhead     │
                   │                 │
              ╔════╪═════════════════╪═══════╗
              ║  ~~  ~~      ~~  ~~         ║
              ║    ~~   🧊 FROZEN LAKE     ║  🧊 = frozen lake (Y: −0.5)
              ║  ~~   (−50,−50)   ~~       ║  ~~ = flat ice, subtle blue
              ║      ~~          ~~         ║
              ╚═══════════════════════════════╝
                    SOUTH (−Z: −80 → −40)

    Legend:
    🏠 = Stabbur cabin (hero landmark)
    ~  = Stone cairn (trail marker)
    ⛷️  = Ski lift pylon (abandoned)
    🧊 = Frozen lake bed
    ▲  = Mountain peak
    ═  = Ridge line
    ~~ = Forest / tree line
    ○  = Point of interest
```

---

## Zones

Each zone is an axis-aligned bounding box in world coordinates `[minX, minZ, maxX, maxZ]`. The center point is `[x, y, z]`.

### Zone 1 — Valley Floor

| Property | Value |
|---|---|
| **Bounds** | `[−40, −40, 40, 40]` |
| **Center** | `[0, 2, 0]` |
| **Elevation** | Y ≈ 0–5 (flat to gently sloping) |
| **Description** | The heart of the scene. Flat valley floor where the cabin sits, the trailhead begins, and the group gathers. Surrounded by rising terrain on all sides. |
| **Palette** | Valley color (`--color-valley`) with patches of snow (`--color-snow`) |
| **Contents** | Cabin, trailhead marker, gathering area, scattered rocks |
| **Packing category** | Accommodation & indoor gear |

### Zone 2 — North Ridge

| Property | Value |
|---|---|
| **Bounds** | `[−60, 40, 60, 120]` |
| **Center** | `[0, 30, 80]` |
| **Elevation** | Y ≈ 20–55 (peaks) |
| **Description** | Jagged alpine peaks with permanent snow caps. The cairn trail marker sits on a prominent ridge, visible from the valley. Dramatic backdrop for hero shots. |
| **Palette** | Snow (`--color-snow`) on peaks, rock (`--color-rock`) on faces, grass (`--color-grass`) on lower slopes |
| **Contents** | Stone cairn, rocky outcrops, sparse trees at the base |
| **Packing category** | Navigation & safety (map, compass, first aid) |

### Zone 3 — Frozen Lake

| Property | Value |
|---|---|
| **Bounds** | `[−80, −80, −20, −20]` |
| **Center** | `[-50, -0.5, -50]` |
| **Elevation** | Y ≈ −0.5 (slightly below valley floor) |
| **Description** | A flat, frozen lake bed in the southwest. The ice is a subtle blue-white. A water ripple shader plane sits here at runtime. Surrounded by low hills. |
| **Palette** | Pale ice blue (mix of `--color-snow` and `--color-sky-hor`) |
| **Contents** | Flat ice surface, a few pressure ridges (small ice mounds), distant shore trees |
| **Packing category** | Outdoor & après-ski (thermos, sunscreen, lip balm) |

### Zone 4 — East Slope

| Property | Value |
|---|---|
| **Bounds** | `[40, −20, 100, 60]` |
| **Center** | `[70, 18, 20]` |
| **Elevation** | Y ≈ 5–35 (mid-mountain) |
| **Description** | The ski slope. A half-buried, rusted ski lift pylon marks the abandoned lift line. The terrain here is the most "used" — ski tracks, a small terrain park area. |
| **Palette** | Grass (`--color-grass`) with snow patches (`--color-snow`), rust accents on the pylon |
| **Contents** | Ski lift pylon, ski tracks in snow, a small terrain park jump, lift cable remnants |
| **Packing category** | Ski & snowboard gear (skis, boots, poles, helmet, goggles) |

### Zone 5 — West Slope (Forest)

| Property | Value |
|---|---|
| **Bounds** | `[−100, −40, −40, 40]` |
| **Center** | `[-70, 8, 0]` |
| **Elevation** | Y ≈ 2–20 (forested hillside) |
| **Description** | Dense pine forest on a gentle slope. The tree line — below this you see the valley, above it opens to rock and snow. A narrow trail winds through. |
| **Palette** | Dark pine green (darker than `--color-grass`), snow on the ground between trees |
| **Contents** | Pine trees (scattered, ~15–20), a winding trail, a small stream crossing (stone bridge) |
| **Packing category** | Clothing & layers (base layers, mid layers, shell, gloves, hat) |

---

## Landmarks (Hero Elements)

These are the 2–3 hero landmarks — the "authored" elements that give the landscape its identity. Each is placed at an exact world position in Blender.

### 🏠 Cabin — Stabbur

| Property | Value |
|---|---|
| **Position** | `[12, 0, -8]` (valley floor, slightly east of center) |
| **Rotation** | Y-axis: ~30° (facing the valley opening toward the north ridge) |
| **Scale** | 1.0 (a real stabbur is ~3m tall, ~4m × 5m footprint) |
| **Zone** | Valley Floor |
| **Poly target** | 5–15k triangles |
| **Vertex colors** | Warm wood brown (logs), grass green (roof), amber (`--color-accent`) for window glow |
| **Story** | "Someone lives here. This is a place." The cabin is the emotional center — warm light in a cold landscape. |
| **Packing category** | Accommodation & indoor gear (sleeping bag, toiletries, indoor shoes, board games) |

### 🗿 Cairn — Trail Marker

| Property | Value |
|---|---|
| **Position** | `[-5, 28, 65]` (on the north ridge, visible from the valley) |
| **Rotation** | Y-axis: 0° (facing the valley) |
| **Scale** | 1.5 (a cairn is ~1.5m tall, slightly exaggerated for visibility) |
| **Zone** | North Ridge |
| **Poly target** | 1–3k triangles |
| **Vertex colors** | Weathered grey stones (`--color-rock` lightened), patches of snow (`--color-snow`) |
| **Story** | "A marker on the trail. Human presence in the wild." Guides the eye up from the valley to the peaks. |
| **Packing category** | Navigation & safety (map, compass, headlamp, first aid kit, emergency whistle) |

### ⛷️ Ski Lift Pylon

| Property | Value |
|---|---|
| **Position** | `[55, 12, 15]` (on the east slope, mid-mountain) |
| **Rotation** | Y-axis: ~-15° (slightly tilted, as if abandoned and weather-beaten) |
| **Scale** | 1.0 (a lift pylon is ~8–10m tall) |
| **Zone** | East Slope |
| **Poly target** | 3–8k triangles |
| **Vertex colors** | Rust orange, dark metal grey, bent and weathered |
| **Story** | "The mountain is used. Winter sports history." A relic of the ski area — cables sag, metal rusts, snow half-buries the base. |
| **Packing category** | Ski & snowboard gear (skis/snowboard, boots, bindings, poles, helmet, goggles, ski pass) |

---

## Camera Positions (Hero Shots)

Place these as cameras in Blender's `Cameras` collection. Export their coordinates to `src/lib/cameraPositions.ts`. These become the Phase 2 camera spline waypoints.

### Cam 1 — Valley Overview

| Property | Value |
|---|---|
| **Position** | `[0, 30, 80]` |
| **Rotation (Euler XYZ)** | `[-0.35, 0, 0]` (looking slightly down toward the valley) |
| **Framing** | Wide establishing shot. The whole valley floor visible, cabin in the lower third, north ridge peaks in the background, frozen lake in the lower-left. |
| **Mood** | "You are here. This is Hemsedal." |

### Cam 2 — Cabin Foreground

| Property | Value |
|---|---|
| **Position** | `[-15, 4, 12]` |
| **Rotation (Euler XYZ)** | `[-0.1, -0.5, 0]` (looking toward the cabin with peaks behind) |
| **Framing** | Ground-level shot. The cabin fills the lower-right, its warm windows glowing. The north ridge rises behind it. Snow in the foreground. |
| **Mood** | "Warmth in the cold. Someone lives here." |

### Cam 3 — Ridge Overlook

| Property | Value |
|---|---|
| **Position** | `[35, 14, -25]` |
| **Rotation (Euler XYZ)** | `[-0.4, 2.5, 0]` (looking back across the valley from the east slope) |
| **Framing** | From the ski slope looking back. The cairn on the north ridge is visible in the distance. The valley floor and cabin are below. The ski pylon is in the mid-ground. |
| **Mood** | "The mountain is vast. You are small. Pack accordingly." |

### Cam 4 — Frozen Lake (optional)

| Property | Value |
|---|---|
| **Position** | `[-50, 3, -30]` |
| **Rotation (Euler XYZ)** | `[-0.05, 3.14, 0]` (looking across the lake toward the valley) |
| **Framing** | Low, across the ice. The cabin's warm light is a small glow in the distance. The north ridge towers behind. The ice has subtle blue reflections. |
| **Mood** | "Silence. Cold. Beauty." |

### Cam 5 — Forest Trail (optional)

| Property | Value |
|---|---|
| **Position** | `[-60, 6, -10]` |
| **Rotation (Euler XYZ)** | `[-0.05, 0.3, 0]` (looking along the trail toward the valley) |
| **Framing** | Among the pines. The trail winds ahead, dappled light through the trees, snow on the ground. The valley opens up ahead. |
| **Mood** | "The approach. Getting there." |

---

## Packing Checklist → Scene Location Map

The site's purpose is a packing checklist for the Hemsedal trip. Each category of items maps to a location in the 3D scene. In Phase 3, DOM sections will appear as the camera flies to these locations.

| # | Category | Scene Location | Zone | Landmark | Camera Shot |
|---|---|---|---|---|---|
| 1 | **Accommodation & indoor gear** | Cabin interior/exterior | Valley Floor | 🏠 Stabbur | Cam 2 — Cabin Foreground |
| 2 | **Ski & snowboard gear** | Ski slope, near the lift pylon | East Slope | ⛷️ Ski Lift Pylon | Cam 3 — Ridge Overlook |
| 3 | **Clothing & layers** | Forest trail, among the pines | West Slope | Pine forest | Cam 5 — Forest Trail |
| 4 | **Navigation & safety** | Ridge cairn, the high point | North Ridge | 🗿 Trail Cairn | Cam 3 — Ridge Overlook |
| 5 | **Food & drinks** | Frozen lake, picnic on ice | Frozen Lake | 🧊 Ice surface | Cam 4 — Frozen Lake |
| 6 | **Après-ski & social** | Valley gathering area, near cabin | Valley Floor | 🏠 Cabin (exterior) | Cam 1 — Valley Overview |

---

## Blender Scene Organization

Collections in `assets/blender/hemsedal-landscape.blend`:

```
📁 Terrain
   └── terrain_main                  # The sculpted landscape mesh

📁 Landmarks
   ├── cabin_stabbur                 # [12, 0, -8], rot Y: 30°
   ├── cairn_trail_marker            # [-5, 28, 65], rot Y: 0°
   └── ski_lift_pylon                # [55, 12, 15], rot Y: -15°

📁 Props
   ├── pine_tree_01 … pine_tree_05   # Scattered in West Slope + valley edges
   ├── rock_01 … rock_08             # Scattered on ridges + valley floor
   ├── bridge_stone                  # Over stream in West Slope
   └── ice_pressure_ridge_01 … 03    # On frozen lake

📁 Cameras (NOT exported)
   ├── cam_overview                  # [0, 30, 80]
   ├── cam_cabin                     # [-15, 4, 12]
   ├── cam_ridge                     # [35, 14, -25]
   ├── cam_lake                      # [-50, 3, -30]
   └── cam_forest                    # [-60, 6, -10]

📁 Markers (empties, NOT exported)
   ├── marker_valley_center          # [0, 0, 0]
   ├── marker_lake_center            # [-50, -0.5, -50]
   ├── marker_trail_start            # [0, 0, 10]
   └── marker_gathering_area         # [5, 0, 5]
```

---

## World Bounds (for code)

```typescript
// src/lib/worldMap.ts — WORLD_BOUNDS
export const WORLD_BOUNDS = {
  minX: -150,
  maxX: 150,
  minZ: -150,
  maxZ: 150,
  maxHeight: 60,  // Highest peak Y
  lakeLevel: -0.5, // Frozen lake surface Y
} as const;
```

---

## Maintenance Rules

1. **When you move a landmark in Blender**, update its position here AND in `src/lib/worldMap.ts`.
2. **When you add a zone**, update the zone table here AND `worldMap.ts`.
3. **When you add a camera**, update the camera table here AND `src/lib/cameraPositions.ts`.
4. **When you change the palette**, update `src/styles/tokens.css` AND repaint vertex colors in Blender.
5. **This map is the source of truth.** If code and this map disagree, the map wins — fix the code.
