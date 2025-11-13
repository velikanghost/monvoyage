export const particleFragmentShader = `
varying vec3 vColor;
varying float vAlpha;

void main() {
  // Calculate distance from center of point
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  
  // Sharp circular shape - discard pixels outside the circle
  if (dist > 0.5) {
    discard;
  }
  
  gl_FragColor = vec4(vColor, vAlpha);
}
`
