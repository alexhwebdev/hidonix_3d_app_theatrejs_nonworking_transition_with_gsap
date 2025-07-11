export default `
// Vertex Shader (vertex.glsl)
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
varying float vOpacity;  // Pass opacity from vertex to fragment shader as varying

// Attribute for opacity (passed in via bufferAttribute)
attribute float opacity;

void main() {
  vUv = uv;
  vPosition = position;

  // Pass opacity from the attribute to the varying
  vOpacity = opacity;

  // Compute the model-view position
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  // Adjust point size based on camera distance
  gl_PointSize = 10.0 * (1.0 / -mvPosition.z);  

  // Final position of the point (clip space)
  gl_Position = projectionMatrix * mvPosition;
}

// uniform float time;
// attribute float opacity;
// varying float vOpacity;

// void main() {
//   vOpacity = opacity;
//   vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
//   gl_PointSize = 25.0 * (1.0 / -mvPosition.z);
//   gl_Position = projectionMatrix * mvPosition;
// }

`;
