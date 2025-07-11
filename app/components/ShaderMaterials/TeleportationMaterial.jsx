import { shaderMaterial } from "@react-three/drei";

export const TeleportationMaterial = shaderMaterial(
  {
    progression: 0,
    tex1: null,
    tex2: null,
    tex3: null,
  },
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */ `
varying vec2 vUv;

uniform float progression;
uniform sampler2D tex1;
uniform sampler2D tex2;
uniform sampler2D tex3;

vec2 distort(vec2 uv, float strength) {
  vec2 p = uv * 2.0 - 1.0;
  float len = length(p);
  vec2 distorted = p / (1.0 - strength * len);
  return (distorted + 1.0) * 0.5;
}

void main() {
  vec2 uv = vUv;
  vec4 finalColor;

  if (progression < 1.0) {
    float p = clamp(progression, 0.0, 1.0);
    
    // Eased progression
    float eased = p * p * (3.0 - 2.0 * p); // easeInOutQuad

    // Distortion strongest at middle
    float dStrength = 1.0 - abs(0.5 - eased) * 2.0;
    float distortion = dStrength * 10.0;

    vec2 uv1 = distort(uv, -distortion);
    vec2 uv2 = distort(uv, distortion);

    vec4 t1 = texture2D(tex1, uv1);
    vec4 t2 = texture2D(tex2, uv2);
    finalColor = mix(t1, t2, eased);

  } else {
    float p = clamp(progression - 1.0, 0.0, 1.0);
    float eased = p * p * (3.0 - 2.0 * p); // easeInOutQuad

    float dStrength = 1.0 - abs(0.5 - eased) * 2.0;
    float distortion = dStrength * 10.0;

    vec2 uv2 = distort(uv, -distortion);
    vec2 uv3 = distort(uv, distortion);

    vec4 t2 = texture2D(tex2, uv2);
    vec4 t3 = texture2D(tex3, uv3);
    finalColor = mix(t2, t3, eased);
  }

  if (progression >= 1.9999) {
    finalColor = texture2D(tex3, uv);
  }

  gl_FragColor = finalColor;
}


  `
);

