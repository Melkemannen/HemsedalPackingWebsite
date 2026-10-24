// Default terrain + grading parameters
// These are starting values — tune via Leva and bake back here.

export const TERRAIN_DEFAULTS = {
  heightScale: 12,
  frequency: 0.006,
  octaves: 6,
  lacunarity: 2.0,
  gain: 0.5,
  warpStrength: 4.0,
  sharpness: 1.5,
  snowLevel: 0.6,
  snowBlend: 0.12,
  fogDensity: 0.006,
  sunIntensity: 1.0,
} as const;

export const GRADING_DEFAULTS = {
  exposure: 1.0,
  gamma: 1.0,
  lift: -0.02,
  contrast: 1.08,
  saturation: 0.85,
  highlightTint: 0.1,
  shadowTint: 0.25,
  vignetteStrength: 0.3,
} as const;

export const SKY_DEFAULTS = {
  gradientPower: 0.6,
} as const;

export const TERRAIN_SIZE = 500;
export const TERRAIN_SEGMENTS = 256;
