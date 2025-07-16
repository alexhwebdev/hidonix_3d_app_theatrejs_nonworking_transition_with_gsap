import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const SlidingTransitionMaterial = shaderMaterial(
  {
    progression: 0,
    tex1: null,
    tex2: null,
    resolution: new THREE.Vector2(),
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
    uniform sampler2D tex1;
    uniform sampler2D tex2;
    uniform float progression;
    uniform vec2 resolution;

    void main() {
      vec2 p = vUv;

      float x = clamp(progression, 0.0, 1.0); 
      float blend = smoothstep(0.0, 1.0, x * 2.0 + p.x - 1.0);

      vec2 uv1 = (p - 0.5) * (1.0 - blend) + 0.5;
      vec2 uv2 = (p - 0.5) * blend + 0.5;

      vec4 color1 = texture2D(tex1, uv1);
      vec4 color2 = texture2D(tex2, uv2);

      gl_FragColor = mix(color1, color2, blend);
    }
  `
);
