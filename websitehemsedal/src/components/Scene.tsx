"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Leva } from "leva";
import World from "./World";
import Sky from "./Sky";
import FreeFlyCamera from "./FreeFlyCamera";

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

        {/* Scene fog */}
        <fog attach="fog" args={["#2a3542", 80, 400]} />

        {/* Lighting — vertex colors carry the palette, this adds depth */}
        <ambientLight intensity={0.4} color="#334455" />
        <directionalLight
          position={[50, 80, 30]}
          intensity={1.0}
          color="#fff5e0"
        />

        <Suspense fallback={null}>
          <Sky />
          <World />
        </Suspense>

        {/* Dev-only free-fly camera — remove in Phase 2 */}
        <FreeFlyCamera />
      </Canvas>
    </div>
  );
}
