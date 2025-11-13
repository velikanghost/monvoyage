export const particleVertexShader = `
attribute float size;
attribute vec3 customColor;

varying vec3 vColor;
varying float vAlpha;

uniform float time;

void main() {
  vColor = customColor;
  
  // Calculate position with subtle animation
  vec3 pos = position;
  
  // Gentle drift animation based on position
  pos.x += sin(time * 0.2 + position.y * 0.1) * 0.5;
  pos.y += cos(time * 0.15 + position.x * 0.1) * 0.3;
  pos.z += sin(time * 0.1 + position.x * 0.05 + position.y * 0.05) * 0.4;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  
  // Size based on depth for atmospheric perspective
  float depth = -mvPosition.z;
  float depthFade = smoothstep(20.0, 5.0, depth);
  
  // Smaller, tighter size for tiny circles
  gl_PointSize = size * (50.0 / -mvPosition.z) * depthFade;
  gl_Position = projectionMatrix * mvPosition;
  
  // Alpha based on depth for atmospheric fade
  vAlpha = depthFade * 0.9;
}
`
