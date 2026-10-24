// Terrain fragment shader — palette mapping, lighting, fog, color grading

export const terrainFragmentShader = /* glsl */ `
// ── Palette uniforms (from CSS design tokens) ──
uniform vec3  uColorSnow;
uniform vec3  uColorRock;
uniform vec3  uColorGrass;
uniform vec3  uColorValley;
uniform vec3  uColorFog;

// ── Terrain shape uniforms ──
uniform float uSnowLevel;
uniform float uSnowBlend;

// ── Lighting uniforms ──
uniform vec3  uSunDir;
uniform vec3  uSunColor;
uniform vec3  uAmbientColor;

// ── Fog uniform ──
uniform float uFogDensity;

// ── Color grading uniforms ──
uniform float uExposure;
uniform float uGamma;
uniform float uLift;
uniform float uContrast;
uniform float uSaturation;
uniform float uHighlightTint;
uniform float uShadowTint;
uniform float uVignetteStrength;
uniform vec2  uResolution;

// ── Varyings ──
varying vec3  vWorldPos;
varying float vHeight;
varying float vSlope;
varying vec3  vNormal;
varying vec3  vObjPos;

void main() {
  // ── Base color by height + slope ──
  vec3 color = mix(uColorValley, uColorGrass, smoothstep(0.05, 0.4, vHeight));
  color = mix(color, uColorRock, vSlope * 0.7);
  // Snow caps on high ground
  color = mix(color, uColorSnow,
    smoothstep(uSnowLevel - uSnowBlend, uSnowLevel + uSnowBlend, vHeight));
  // Rock on very steep slopes even at lower altitudes
  color = mix(color, uColorRock, smoothstep(0.5, 0.9, vSlope) * 0.5);

  // ── Lighting ──
  vec3 N = normalize(vNormal);
  float NdotL = max(dot(N, uSunDir), 0.0);
  // Hemisphere ambient — sky tint from above, ground tint from below
  float hemi = 0.5 + 0.5 * N.y;
  vec3 ambient = mix(uColorValley * 0.3, uColorFog * 0.15, hemi);
  vec3 lighting = ambient + uSunColor * NdotL + uAmbientColor;
  color *= lighting;

  // ── Exponential fog ──
  float dist = length(vWorldPos - cameraPosition);
  float fogFactor = 1.0 - exp(-uFogDensity * dist * dist);
  color = mix(color, uColorFog, clamp(fogFactor, 0.0, 1.0));

  // ── Color grading (film look) ──
  // Exposure
  color *= uExposure;
  // Gamma
  color = pow(max(color, 0.0), vec3(1.0 / uGamma));
  // Lift (shadow lift)
  color += uLift;

  // Split toning — warm highlights, cool shadows
  float luminance = dot(color, vec3(0.299, 0.587, 0.114));
  vec3 warmTone = vec3(1.05, 0.98, 0.90);
  vec3 coolTone = vec3(0.90, 0.95, 1.05);
  color = mix(color, color * coolTone, (1.0 - luminance) * uShadowTint);
  color = mix(color, color * warmTone, luminance * uHighlightTint);

  // Saturation
  float gray = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(gray), color, uSaturation);

  // Contrast (S-curve)
  color = (color - 0.5) * uContrast + 0.5;

  // Vignette
  vec2 uv = gl_FragCoord.xy / uResolution;
  float vig = 1.0 - dot(uv - 0.5, uv - 0.5) * uVignetteStrength;
  color *= clamp(vig, 0.0, 1.0);

  // Clamp
  color = clamp(color, 0.0, 1.0);

  gl_FragColor = vec4(color, 1.0);
}
`;
