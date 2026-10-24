"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

const MODEL_PATH = "/models/hemsedal-landscape.glb";

export default function World() {
  const { scene } = useGLTF(MODEL_PATH);

  // Clone the scene so we can mutate materials without affecting the cached original
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
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
    return clone;
  }, [scene]);

  return <primitive object={clonedScene} />;
}

// Preload the model so Suspense resolves quickly
useGLTF.preload(MODEL_PATH);
