// Code-side mirror of Plans/03 - world-map.md
// All coordinates in world units (1 unit = 1 meter, Y is up)

export interface Zone {
  id: string;
  name: string;
  /** Axis-aligned bounding box [minX, minZ, maxX, maxZ] */
  bounds: [number, number, number, number];
  /** Center point [x, y, z] */
  center: [number, number, number];
  description: string;
}

export const ZONES: Zone[] = [
  {
    id: "valley-floor",
    name: "Valley Floor",
    bounds: [-40, -40, 40, 40],
    center: [0, 2, 0],
    description:
      "The heart of the scene. Flat valley floor where the cabin sits, the trailhead begins, and the group gathers.",
  },
  {
    id: "north-ridge",
    name: "North Ridge",
    bounds: [-60, 40, 60, 120],
    center: [0, 30, 80],
    description:
      "Jagged alpine peaks with permanent snow caps. The cairn trail marker sits on a prominent ridge.",
  },
  {
    id: "frozen-lake",
    name: "Frozen Lake",
    bounds: [-80, -80, -20, -20],
    center: [-50, -0.5, -50],
    description:
      "A flat, frozen lake bed in the southwest. The ice is a subtle blue-white.",
  },
  {
    id: "east-slope",
    name: "East Slope",
    bounds: [40, -20, 100, 60],
    center: [70, 18, 20],
    description:
      "The ski slope. A half-buried, rusted ski lift pylon marks the abandoned lift line.",
  },
  {
    id: "west-slope",
    name: "West Slope (Forest)",
    bounds: [-100, -40, -40, 40],
    center: [-70, 8, 0],
    description:
      "Dense pine forest on a gentle slope. A narrow trail winds through.",
  },
];

export interface LandmarkRef {
  id: string;
  name: string;
  /** Position in the Blender scene [x, y, z] */
  position: [number, number, number];
  /** Y-axis rotation in degrees (as authored in Blender) */
  rotationY: number;
  scale: number;
  zone: string;
  /** What this landmark represents in the packing checklist */
  packingCategory: string;
}

export const LANDMARK_REFS: LandmarkRef[] = [
  {
    id: "cabin",
    name: "Stabbur Cabin",
    position: [12, 0, -8],
    rotationY: 30,
    scale: 1.0,
    zone: "valley-floor",
    packingCategory: "Accommodation & indoor gear",
  },
  {
    id: "cairn",
    name: "Trail Cairn",
    position: [-5, 28, 65],
    rotationY: 0,
    scale: 1.5,
    zone: "north-ridge",
    packingCategory: "Navigation & safety",
  },
  {
    id: "ski-pylon",
    name: "Ski Lift Pylon",
    position: [55, 12, 15],
    rotationY: -15,
    scale: 1.0,
    zone: "east-slope",
    packingCategory: "Ski & snowboard gear",
  },
];

// World bounds — used for camera clamping and fog tuning
export const WORLD_BOUNDS = {
  minX: -150,
  maxX: 150,
  minZ: -150,
  maxZ: 150,
  maxHeight: 60, // Highest peak Y
  lakeLevel: -0.5, // Frozen lake surface Y
} as const;
