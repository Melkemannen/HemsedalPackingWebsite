// Hero camera shots — positions and rotations from Plans/03 - world-map.md
// Coordinate system: 1 unit = 1 meter, Y is up
// Used as waypoints for the Phase 2 camera spline.

export interface CameraShot {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number]; // Euler XYZ in radians
  label: string;
}

export const CAMERA_HERO_SHOTS: CameraShot[] = [
  {
    id: "overview",
    position: [0, 30, 80],
    rotation: [-0.35, 0, 0],
    label: "Valley Overview — wide establishing shot",
  },
  {
    id: "cabin",
    position: [-15, 4, 12],
    rotation: [-0.1, -0.5, 0],
    label: "Cabin Foreground — ground-level with peaks behind",
  },
  {
    id: "ridge",
    position: [35, 14, -25],
    rotation: [-0.4, 2.5, 0],
    label: "Ridge Overlook — from east slope looking back across the valley",
  },
  {
    id: "lake",
    position: [-50, 3, -30],
    rotation: [-0.05, 3.14, 0],
    label: "Frozen Lake — low across the ice toward the valley",
  },
  {
    id: "forest",
    position: [-60, 6, -10],
    rotation: [-0.05, 0.3, 0],
    label: "Forest Trail — among the pines looking toward the valley",
  },
];
