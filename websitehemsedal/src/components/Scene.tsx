"use client";

import { Canvas } from "@react-three/fiber";

export default function Scene() {
  return (
    <div className="canvas-container">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 2, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#4da3ff" />
        </mesh>
      </Canvas>
    </div>
  );
}
