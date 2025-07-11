export default `
// ----- Blue Particles
// uniform float time;
// uniform sampler2D texture1;
// uniform vec4 resolution;
// varying vec2 vUv;
// varying vec3 vPosition;
// varying float vOpacity;

// float PI = 3.14159265359;

// void main() {
//   vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);  // Flip the Y coordinate
//   vec2 cUV = 2.0 * uv - 1.0;  // Map the UV to a range [-1, 1]

//   vec3 originalColor = vec3(4.0 / 255.0, 10.0 / 255.0, 20.0 / 255.0);  // Base color (dark red)

//   vec4 color = vec4(0.08 / length(cUV));  // Color intensity based on distance from the center
//   color.rgb = min(vec3(10.0), color.rgb);  // Clamp the color to prevent it from getting too bright
//   color.rgb *= originalColor * 120.0;  // Multiply with the base color
//   color *= vOpacity;  // Apply opacity based on the vertex shader

//   color.a = min(1.0, color.a) * 10.0;  // Clamp alpha to make sure it's within range

//   float disc = length(cUV);  // Calculate the distance from the center of the point

//   gl_FragColor = vec4(1.0 - disc, 0.0, 0.0, 1.0) * vOpacity;  // Red to create the final color
//   gl_FragColor = vec4(color.rgb, color.a);  // Final color output
// }



// ----- White Particles
uniform float uOpacity;
varying float vOpacity;

void main() {
  vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
  vec2 cUV = 2.0 * uv - 1.0;

  vec4 color = vec4(0.08 / length(cUV));
  color.rgb = min(vec3(10.0), color.rgb);
  color.rgb *= vec3(1.0) * 120.0;
  color *= vOpacity * uOpacity; // 🔥 apply global opacity here
  color.a = min(1.0, color.a) * 10.0;

  gl_FragColor = vec4(color.rgb, color.a);
}



`;
