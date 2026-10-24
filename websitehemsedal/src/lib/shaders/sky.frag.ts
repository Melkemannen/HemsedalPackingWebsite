// Sky fragment shader — gradient dome with optional sun glow

export const skyFragmentShader = /* glsl */ `
uniform vec3  uSkyTop;
uniform vec3  uSkyHorizon;
uniform vec3  uSkyBottom;
uniform float uGradientPower;
uniform vec3  uSunDir;
uniform float uSunIntensity;
uniform vec3  uSunColor;

varying vec3 vWorldDirection;

void main() {
  vec3 dir = normalize(vWorldDirection);
  float h = dir.y;

  // Gradient: horizon → zenith
  float t = clamp(pow(max(h, 0.0), uGradientPower), 0.0, 1.0);
  vec3 color = mix(uSkyHorizon, uSkyTop, t);

  // Below horizon: fade to bottom color
  color = mix(uSkyBottom, color, smoothstep(-0.05, 0.02, h));

  // Subtle sun glow near the sun direction
  float sunDot = max(dot(dir, uSunDir), 0.0);
  float glow = pow(sunDot, 128.0) * uSunIntensity * 0.5;
  float halo = pow(sunDot, 8.0) * uSunIntensity * 0.15;
  color += uSunColor * (glow + halo);

  gl_FragColor = vec4(color, 1.0);
}
`;
