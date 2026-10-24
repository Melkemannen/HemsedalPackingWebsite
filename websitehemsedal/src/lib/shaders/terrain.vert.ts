// Terrain vertex shader — FBM noise displacement with domain warping
// Includes Ashima's simplex noise 2D implementation

export const terrainVertexShader = /* glsl */ `
// ── Simplex Noise 2D (Ashima Arts / Stefan Gustavson) ──
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
       + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// ── FBM with domain warping ──
uniform float uFrequency;
uniform int   uOctaves;
uniform float uLacunarity;
uniform float uGain;
uniform float uWarpStrength;
uniform vec2  uSeed;
uniform float uHeightScale;
uniform float uSharpness;

float fbmRaw(vec2 p) {
  float amplitude = 1.0;
  float frequency = 1.0;
  float sum = 0.0;
  float norm = 0.0;
  for (int i = 0; i < 8; i++) {
    if (i >= uOctaves) break;
    sum += amplitude * snoise(p * frequency);
    norm += amplitude;
    amplitude *= uGain;
    frequency *= uLacunarity;
  }
  return sum / norm;
}

float fbm(vec2 p) {
  // Domain warping for natural ridges
  vec2 q = vec2(fbmRaw(p + uSeed), fbmRaw(p + uSeed + vec2(5.2, 1.3)));
  vec2 r = vec2(fbmRaw(p + uWarpStrength * q + vec2(1.7, 9.2)),
                fbmRaw(p + uWarpStrength * q + vec2(8.3, 2.8)));
  return fbmRaw(p + uWarpStrength * r);
}

// ── Varyings ──
varying vec3  vWorldPos;
varying float vHeight;
varying float vSlope;
varying vec3  vNormal;
varying vec3  vObjPos;

void main() {
  vec3 pos = position;
  vObjPos = pos;

  vec2 uv = pos.xz * uFrequency;

  // Base height
  float h = fbm(uv);
  // Normalize to roughly 0..1, then sharpen peaks
  h = h * 0.5 + 0.5;
  h = pow(h, uSharpness);
  pos.y += h * uHeightScale;

  // Slope via finite differences
  float eps = 1.0 / uFrequency;
  float hL = fbm((pos.xz + vec2(-eps, 0.0)) * uFrequency);
  float hR = fbm((pos.xz + vec2( eps, 0.0)) * uFrequency);
  float hD = fbm((pos.xz + vec2(0.0, -eps)) * uFrequency);
  float hU = fbm((pos.xz + vec2(0.0,  eps)) * uFrequency);
  hL = pow(hL * 0.5 + 0.5, uSharpness) * uHeightScale;
  hR = pow(hR * 0.5 + 0.5, uSharpness) * uHeightScale;
  hD = pow(hD * 0.5 + 0.5, uSharpness) * uHeightScale;
  hU = pow(hU * 0.5 + 0.5, uSharpness) * uHeightScale;
  float slope = length(vec2(hR - hL, hU - hD)) / (2.0 * eps);

  // Approximate normal from slope derivatives
  vec3 n = normalize(vec3(hL - hR, 2.0 * eps, hD - hU));

  vHeight  = h;
  vSlope   = clamp(slope * 3.0, 0.0, 1.0);
  vNormal  = normalize(normalMatrix * n);
  vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;
