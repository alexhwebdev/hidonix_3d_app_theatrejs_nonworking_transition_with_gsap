import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

export const GridDissolveTransitionMaterial = shaderMaterial(
  {
    progression: 0,             // Goes from 0 to 1
    tex1: null,                 // From texture
    tex2: null,                 // To texture
    tex3: null,
    resolution: new THREE.Vector2(),
    size: new THREE.Vector2(10.0, 10.0),
    smoothness: 0.5,            // Between 0 and 1
  },
  // Vertex Shader
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  /* glsl */ `
    varying vec2 vUv;

    uniform float progression;
    uniform sampler2D tex1;
    uniform sampler2D tex2;
    uniform sampler2D tex3;
    uniform vec2 resolution;
    uniform vec2 size;
    uniform float smoothness;

    float rand(vec2 co) {
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;

      // Discretize the UV grid
      vec2 grid = floor(size * uv);
      float r = rand(grid);

      // Smoothstep control based on progression
      float m = smoothstep(0.0, -smoothness, r - progression * (1.0 + smoothness));

      vec4 color1 = texture2D(tex1, uv);
      vec4 color2 = texture2D(tex2, uv);
      vec4 color3 = texture2D(tex3, uv);
      gl_FragColor = mix(color1, color2, m);
    }
  `
);
