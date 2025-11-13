export const birdFragmentShader = `
varying vec4 vColor;
varying float z;

uniform vec3 color;

void main() {
  // Depth-based shading like reference, but with purple tones
  float z2 = 0.2 + ( 1000. - z ) / 1000. * vColor.x;
  
  // Purple color scheme: adjust the base purple color based on depth
  // Base purple is around (0.5, 0.3, 0.95)
  float purpleR = z2 * 0.5;
  float purpleG = z2 * 0.3;
  float purpleB = z2 * 0.95;
  
  gl_FragColor = vec4( purpleR, purpleG, purpleB, 1. );
}
`
