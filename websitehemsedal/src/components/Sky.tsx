"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { skyVertexShader } from "@/lib/shaders/sky.vert";
import { skyFragmentShader } from "@/lib/shaders/sky.frag";
import { SKY_DEFAULTS } from "@/lib/terrain/constants";

function getCSSColorHex(name: string): string {
  if (typeof window === "undefined") return "#ffffff";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || "#ffffff";
}

export default function Sky() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const params = useControls("Sky", {
    gradientPower: {
      value: SKY_DEFAULTS.gradientPower,
      min: 0.1,
      max: 3.0,
      step: 0.05,
    },
  });

  const palette = useControls("Sky Colors", {
    skyTop: { value: getCSSColorHex("--color-sky-top") },
    skyHorizon: { value: getCSSColorHex("--color-sky-hor") },
    skyBottom: { value: getCSSColorHex("--color-fog") },
  });

  const lighting = useControls("Sky Lighting", {
    sunIntensity: { value: 1.0, min: 0, max: 3, step: 0.05 },
    sunElevation: { value: 0.8, min: 0.05, max: 1.5, step: 0.05 },
    sunAzimuth: { value: 0.5, min: -3.14, max: 3.14, step: 0.05 },
  });

  // Large sphere surrounding the scene
  const geometry = useMemo(() => new THREE.SphereGeometry(400, 32, 16), []);

  const uniforms = useMemo<THREE.ShaderMaterialParameters["uniforms"]>(() => {
    const sunDir = new THREE.Vector3(0, 1, 0)
      .applyAxisAngle(new THREE.Vector3(1, 0, 0), lighting.sunElevation)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), lighting.sunAzimuth)
      .normalize();

    return {
      uSkyTop: { value: new THREE.Color(getCSSColorHex("--color-sky-top")) },
      uSkyHorizon: {
        value: new THREE.Color(getCSSColorHex("--color-sky-hor")),
      },
      uSkyBottom: { value: new THREE.Color(getCSSColorHex("--color-fog")) },
      uGradientPower: { value: params.gradientPower },
      uSunDir: { value: sunDir },
      uSunIntensity: { value: lighting.sunIntensity },
      uSunColor: { value: new THREE.Color(1.0, 0.9, 0.75) },
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(() => {
    const m = materialRef.current;
    if (!m) return;
    const u = m.uniforms;

    u.uGradientPower.value = params.gradientPower;
    u.uSkyTop.value.set(palette.skyTop);
    u.uSkyHorizon.value.set(palette.skyHorizon);
    u.uSkyBottom.value.set(palette.skyBottom);
    u.uSunIntensity.value = lighting.sunIntensity;

    const sunDir = new THREE.Vector3(0, 1, 0)
      .applyAxisAngle(new THREE.Vector3(1, 0, 0), lighting.sunElevation)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), lighting.sunAzimuth)
      .normalize();
    (u.uSunDir.value as THREE.Vector3).copy(sunDir);
  });

  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={skyVertexShader}
        fragmentShader={skyFragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
