export const birdFragmentShader = `
varying vec4 vColor;
varying float z;

uniform vec3 color;

void main() {
  // Purple themed birds for dark background
  float z2 = 0.3 + ( 1000. - z ) / 1000. * vColor.x * 0.5;
  
  // Purple color: mix between dark purple and lighter purple based on depth
  float purpleR = 0.4 + z2 * 0.3; // 0.4 to 0.7 (purple-red component)
  float purpleG = 0.2 + z2 * 0.2; // 0.2 to 0.4 (purple-green component)  
  float purpleB = 0.6 + z2 * 0.4; // 0.6 to 1.0 (purple-blue component)
  
  gl_FragColor = vec4( purpleR, purpleG, purpleB, 0.7 + z2 * 0.3 );
}
`
