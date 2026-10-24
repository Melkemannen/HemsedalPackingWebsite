// Saved hero camera shots — found during Phase 1 scouting with FreeFlyCamera.
// Used as waypoints for the Phase 2 camera spline.
//
// 🎨 F — Fill these in after flying around the terrain.

export interface CameraShot {
  position: [number, number, number];
  rotation: [number, number, number]; // Euler XYZ in radians
}

export const CAMERA_HERO_SHOTS: CameraShot[] = [
  // Default overview
  {
    position: [0, 20, 50],
    rotation: [-0.3, 0, 0],
  },
];
