"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { LandmarkDef } from "@/lib/landmarks";

interface LandmarkProps {
  def: LandmarkDef;
  terrainHeightFn: (x: number, z: number) => number;
}

export default function Landmark({ def, terrainHeightFn }: LandmarkProps) {
  const { scene } = useGLTF(def.modelPath);

  // Clone so multiple instances don't share mutations
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // Apply materials: use vertex colors if present, enable fog
  useMemo(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false;
        child.receiveShadow = false;

        const hasVertexColors = child.geometry.attributes.color !== undefined;

        child.material = new THREE.MeshStandardMaterial({
          vertexColors: hasVertexColors,
          color: hasVertexColors ? undefined : new THREE.Color("#8a97a5"),
          roughness: 0.9,
          metalness: 0.0,
          fog: true,
        });
      }
    });
  }, [clonedScene]);

  const y = terrainHeightFn(def.position[0], def.position[1]);

  return (
    <group
      position={[def.position[0], y, def.position[1]]}
      rotation={[0, def.rotation, 0]}
      scale={def.scale}
    >
      <primitive object={clonedScene} />
    </group>
  );
}
