"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Leva } from "leva";
import Terrain from "./Terrain";
import Sky from "./Sky";
import Landmark from "./Landmark";
import FreeFlyCamera from "./FreeFlyCamera";
import { LANDMARKS } from "@/lib/landmarks";
import { getTerrainHeight } from "@/lib/terrain/heightmap";

export default function Scene() {
  return (
    <div className="canvas-container">
      {/* Leva debug panel — dev only, hidden in production via CSS or env */}
      <Leva collapsed fill={false} oneLineLabels={false} />

      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 15, 40], fov: 60, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Scene background matches fog color */}
        <color attach="background" args={["#1a2028"]} />

        {/* Lighting for landmarks (terrain uses its own shader lighting) */}
        <ambientLight intensity={0.3} color="#334455" />
        <directionalLight
          position={[50, 80, 30]}
          intensity={1.2}
          color="#fff5e0"
        />

        <Suspense fallback={null}>
          <Sky />
          <Terrain />
          {LANDMARKS.map((lm) => (
            <Landmark key={lm.id} def={lm} terrainHeightFn={getTerrainHeight} />
          ))}
        </Suspense>

        {/* Dev-only free-fly camera — remove in Phase 2 */}
        <FreeFlyCamera />
      </Canvas>
    </div>
  );
}
