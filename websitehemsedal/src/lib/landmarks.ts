// Landmark definitions — positions are in world space [x, z].
// Y is auto-computed from the terrain height at each position.
//
// 🎨 D — Adjust positions, rotations, and scales after scouting
// the terrain with the FreeFlyCamera (Step 8).

export interface LandmarkDef {
  id: string;
  modelPath: string;
  position: [number, number]; // [x, z]
  rotation: number; // Y-axis rotation in radians
  scale: number;
}

export const LANDMARKS: LandmarkDef[] = [
  // No landmarks yet — add after modeling in Blender (Step 6).
  // Example:
  // {
  //   id: "cabin",
  //   modelPath: "/models/cabin.glb",
  //   position: [12, -8],
  //   rotation: 0.5,
  //   scale: 1.0,
  // },
];
