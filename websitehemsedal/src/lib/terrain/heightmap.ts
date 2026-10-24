// CPU-side terrain height function — mirrors the GLSL vertex shader logic.
// Used to place landmarks at the correct Y position on the terrain surface.

import { createNoise2D } from "simplex-noise";

// Must match TERRAIN_DEFAULTS in constants.ts
interface NoiseParams {
  frequency: number;
  octaves: number;
  lacunarity: number;
  gain: number;
  warpStrength: number;
  heightScale: number;
  sharpness: number;
}

let params: NoiseParams = {
  frequency: 0.006,
  octaves: 6,
  lacunarity: 2.0,
  gain: 0.5,
  warpStrength: 4.0,
  heightScale: 12,
  sharpness: 1.5,
};

export function setNoiseParams(p: Partial<NoiseParams>) {
  params = { ...params, ...p };
}

function fbmRaw(
  noise2D: (x: number, y: number) => number,
  px: number,
  py: number
): number {
  let amplitude = 1.0;
  let frequency = 1.0;
  let sum = 0.0;
  let norm = 0.0;
  for (let i = 0; i < params.octaves; i++) {
    sum += amplitude * noise2D(px * frequency, py * frequency);
    norm += amplitude;
    amplitude *= params.gain;
    frequency *= params.lacunarity;
  }
  return sum / norm;
}

function fbm(
  noise2D: (x: number, y: number) => number,
  px: number,
  py: number
): number {
  // Domain warping
  const qx = fbmRaw(noise2D, px + 0, py + 0);
  const qy = fbmRaw(noise2D, px + 5.2, py + 1.3);
  const rx = fbmRaw(
    noise2D,
    px + params.warpStrength * qx + 1.7,
    py + params.warpStrength * qy + 9.2
  );
  const ry = fbmRaw(
    noise2D,
    px + params.warpStrength * qx + 8.3,
    py + params.warpStrength * qy + 2.8
  );
  return fbmRaw(
    noise2D,
    px + params.warpStrength * rx,
    py + params.warpStrength * ry
  );
}

const noise2D = createNoise2D();

/**
 * Returns the terrain height (Y) at world position (x, z).
 * Matches the GLSL shader's displacement logic.
 */
export function getTerrainHeight(x: number, z: number): number {
  const uvx = x * params.frequency;
  const uvz = z * params.frequency;
  let h = fbm(noise2D, uvx, uvz);
  h = h * 0.5 + 0.5;
  h = Math.pow(h, params.sharpness);
  return h * params.heightScale;
}
