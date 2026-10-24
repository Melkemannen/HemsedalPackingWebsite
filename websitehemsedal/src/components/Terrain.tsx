"use client";

import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { terrainVertexShader } from "@/lib/shaders/terrain.vert";
import { terrainFragmentShader } from "@/lib/shaders/terrain.frag";
import {
  TERRAIN_DEFAULTS,
  GRADING_DEFAULTS,
  TERRAIN_SIZE,
  TERRAIN_SEGMENTS,
} from "@/lib/terrain/constants";
import { setNoiseParams } from "@/lib/terrain/heightmap";

/** Read a CSS custom property as a hex string (for Leva color pickers) */
function getCSSColorHex(name: string): string {
  if (typeof window === "undefined") return "#ffffff";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || "#ffffff";
}

export default function Terrain() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const { gl } = useThree();

  // ── Leva: Terrain shape controls ──
  const shape = useControls("Terrain Shape", {
    heightScale: {
      value: TERRAIN_DEFAULTS.heightScale,
      min: 0,
      max: 30,
      step: 0.5,
    },
    frequency: {
      value: TERRAIN_DEFAULTS.frequency,
      min: 0.001,
      max: 0.05,
      step: 0.001,
    },
    octaves: { value: TERRAIN_DEFAULTS.octaves, min: 1, max: 8, step: 1 },
    lacunarity: {
      value: TERRAIN_DEFAULTS.lacunarity,
      min: 1.0,
      max: 3.0,
      step: 0.1,
    },
    gain: { value: TERRAIN_DEFAULTS.gain, min: 0.3, max: 0.7, step: 0.05 },
    warpStrength: {
      value: TERRAIN_DEFAULTS.warpStrength,
      min: 0,
      max: 8,
      step: 0.1,
    },
    sharpness: {
      value: TERRAIN_DEFAULTS.sharpness,
      min: 0.5,
      max: 4,
      step: 0.1,
    },
    snowLevel: {
      value: TERRAIN_DEFAULTS.snowLevel,
      min: 0,
      max: 1,
      step: 0.01,
    },
    snowBlend: {
      value: TERRAIN_DEFAULTS.snowBlend,
      min: 0.01,
      max: 0.3,
      step: 0.01,
    },
    fogDensity: {
      value: TERRAIN_DEFAULTS.fogDensity,
      min: 0,
      max: 0.05,
      step: 0.001,
    },
  });

  // ── Leva: Palette (reads from CSS tokens) ──
  const palette = useControls("Palette", {
    colorSnow: { value: getCSSColorHex("--color-snow") },
    colorRock: { value: getCSSColorHex("--color-rock") },
    colorGrass: { value: getCSSColorHex("--color-grass") },
    colorValley: { value: getCSSColorHex("--color-valley") },
    colorFog: { value: getCSSColorHex("--color-fog") },
  });

  // ── Leva: Lighting ──
  const lighting = useControls("Lighting", {
    sunIntensity: {
      value: TERRAIN_DEFAULTS.sunIntensity,
      min: 0,
      max: 2,
      step: 0.05,
    },
    sunElevation: { value: 0.8, min: 0.05, max: 1.5, step: 0.05 },
    sunAzimuth: { value: 0.5, min: -3.14, max: 3.14, step: 0.05 },
  });

  // ── Leva: Color grading ──
  const grading = useControls("Color Grading", {
    exposure: {
      value: GRADING_DEFAULTS.exposure,
      min: 0.5,
      max: 2.0,
      step: 0.01,
    },
    gamma: { value: GRADING_DEFAULTS.gamma, min: 0.5, max: 2.0, step: 0.01 },
    lift: { value: GRADING_DEFAULTS.lift, min: -0.2, max: 0.2, step: 0.005 },
    contrast: {
      value: GRADING_DEFAULTS.contrast,
      min: 0.8,
      max: 1.3,
      step: 0.01,
    },
    saturation: {
      value: GRADING_DEFAULTS.saturation,
      min: 0.0,
      max: 1.5,
      step: 0.01,
    },
    highlightTint: {
      value: GRADING_DEFAULTS.highlightTint,
      min: 0,
      max: 0.5,
      step: 0.01,
    },
    shadowTint: {
      value: GRADING_DEFAULTS.shadowTint,
      min: 0,
      max: 0.5,
      step: 0.01,
    },
    vignetteStrength: {
      value: GRADING_DEFAULTS.vignetteStrength,
      min: 0,
      max: 1.0,
      step: 0.05,
    },
  });

  // ── Geometry ──
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      TERRAIN_SIZE,
      TERRAIN_SIZE,
      TERRAIN_SEGMENTS,
      TERRAIN_SEGMENTS
    );
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  // ── Uniforms ──
  const uniforms = useMemo<THREE.ShaderMaterialParameters["uniforms"]>(() => {
    const sunDir = new THREE.Vector3(0, 1, 0)
      .applyAxisAngle(new THREE.Vector3(1, 0, 0), lighting.sunElevation)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), lighting.sunAzimuth)
      .normalize();

    return {
      uFrequency: { value: shape.frequency },
      uOctaves: { value: shape.octaves },
      uLacunarity: { value: shape.lacunarity },
      uGain: { value: shape.gain },
      uWarpStrength: { value: shape.warpStrength },
      uSeed: { value: new THREE.Vector2(42.7, 17.3) },
      uHeightScale: { value: shape.heightScale },
      uSharpness: { value: shape.sharpness },
      uSnowLevel: { value: shape.snowLevel },
      uSnowBlend: { value: shape.snowBlend },
      uFogDensity: { value: shape.fogDensity },
      uColorSnow: { value: new THREE.Color(getCSSColorHex("--color-snow")) },
      uColorRock: { value: new THREE.Color(getCSSColorHex("--color-rock")) },
      uColorGrass: { value: new THREE.Color(getCSSColorHex("--color-grass")) },
      uColorValley: {
        value: new THREE.Color(getCSSColorHex("--color-valley")),
      },
      uColorFog: { value: new THREE.Color(getCSSColorHex("--color-fog")) },
      uSunDir: { value: sunDir },
      uSunColor: {
        value: new THREE.Color(1.0, 0.95, 0.85).multiplyScalar(
          lighting.sunIntensity
        ),
      },
      uAmbientColor: { value: new THREE.Color(0.1, 0.12, 0.18) },
      uExposure: { value: grading.exposure },
      uGamma: { value: grading.gamma },
      uLift: { value: grading.lift },
      uContrast: { value: grading.contrast },
      uSaturation: { value: grading.saturation },
      uHighlightTint: { value: grading.highlightTint },
      uShadowTint: { value: grading.shadowTint },
      uVignetteStrength: { value: grading.vignetteStrength },
      uResolution: {
        value: new THREE.Vector2(gl.domElement.width, gl.domElement.height),
      },
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync Leva params → uniforms each frame ──
  useFrame(() => {
    const m = materialRef.current;
    if (!m) return;
    const u = m.uniforms;

    u.uHeightScale.value = shape.heightScale;
    u.uFrequency.value = shape.frequency;
    u.uOctaves.value = shape.octaves;
    u.uLacunarity.value = shape.lacunarity;
    u.uGain.value = shape.gain;
    u.uWarpStrength.value = shape.warpStrength;
    u.uSharpness.value = shape.sharpness;
    u.uSnowLevel.value = shape.snowLevel;
    u.uSnowBlend.value = shape.snowBlend;
    u.uFogDensity.value = shape.fogDensity;

    u.uColorSnow.value.set(palette.colorSnow);
    u.uColorRock.value.set(palette.colorRock);
    u.uColorGrass.value.set(palette.colorGrass);
    u.uColorValley.value.set(palette.colorValley);
    u.uColorFog.value.set(palette.colorFog);

    const sunDir = new THREE.Vector3(0, 1, 0)
      .applyAxisAngle(new THREE.Vector3(1, 0, 0), lighting.sunElevation)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), lighting.sunAzimuth)
      .normalize();
    (u.uSunDir.value as THREE.Vector3).copy(sunDir);
    (u.uSunColor.value as THREE.Color)
      .setRGB(1.0, 0.95, 0.85)
      .multiplyScalar(lighting.sunIntensity);

    u.uExposure.value = grading.exposure;
    u.uGamma.value = grading.gamma;
    u.uLift.value = grading.lift;
    u.uContrast.value = grading.contrast;
    u.uSaturation.value = grading.saturation;
    u.uHighlightTint.value = grading.highlightTint;
    u.uShadowTint.value = grading.shadowTint;
    u.uVignetteStrength.value = grading.vignetteStrength;

    (u.uResolution.value as THREE.Vector2).set(
      gl.domElement.width,
      gl.domElement.height
    );
  });

  // ── Sync params to CPU heightmap for landmark placement ──
  useEffect(() => {
    setNoiseParams({
      frequency: shape.frequency,
      octaves: shape.octaves,
      lacunarity: shape.lacunarity,
      gain: shape.gain,
      warpStrength: shape.warpStrength,
      heightScale: shape.heightScale,
      sharpness: shape.sharpness,
    });
  }, [
    shape.frequency,
    shape.octaves,
    shape.lacunarity,
    shape.gain,
    shape.warpStrength,
    shape.heightScale,
    shape.sharpness,
  ]);

  // ── Handle resize for vignette resolution ──
  useEffect(() => {
    const handleResize = () => {
      if (materialRef.current) {
        (materialRef.current.uniforms.uResolution.value as THREE.Vector2).set(
          gl.domElement.width,
          gl.domElement.height
        );
      }
    };
    gl.domElement.addEventListener("resize", handleResize);
    // Also listen to window resize since R3F canvas may not fire it
    window.addEventListener("resize", handleResize);
    return () => {
      gl.domElement.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, [gl]);

  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={terrainVertexShader}
        fragmentShader={terrainFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
