// ---------------- ORIGINAL CODE ----------------
import { shaderMaterial } from "@react-three/drei";

export const TransitionMaterial = shaderMaterial(
  {
    progression: 1,
    tex1: undefined,
    tex2: undefined,
    tex3: undefined,
    transition: 0,
  },
  /*glsl*/ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
  /*glsl*/ ` 
    varying vec2 vUv;
    uniform sampler2D tex1;
    uniform sampler2D tex2;
    uniform sampler2D tex3;
    uniform float progression;
    uniform int transition;

    void main() {
      vec2 uv = vUv;

      vec4 _texture1 = texture2D(tex1, uv);
      vec4 _texture2 = texture2D(tex2, uv);
      vec4 _texture3 = texture2D(tex3, uv);
      
      vec4 finalTexture;
      // if (transition == 0) { // HORIZONTAL
      //   // finalTexture = mix(_texture1, _texture2, step(progression, 1.0 - uv.x));
      //   vec4 finalTexture = mix(_texture1, _texture2, step(p, uv.x));
      //   finalTexture = mix(finalTexture, _texture3, step(p2, uv.x));
      // }
      // if (transition == 1) { // VERTICAL
      //   finalTexture = mix(_texture1, _texture2, step(progression, uv.y));
      // }

      if (transition == 0) {
        if (progression < 1.0) {
          // float blend = smoothstep(0.0, 1.0, progression);
          // finalTexture = mix(_texture1, _texture2, blend);
float p = clamp(progression, 0.0, 1.0);
float blend = step(1.0 - p, uv.x); // scene1 to scene2
finalTexture = mix(_texture1, _texture2, blend);
        } else {
          // float blend = smoothstep(1.0, 2.0, progression);
          // finalTexture = mix(_texture2, _texture3, blend);
float p = clamp(progression - 1.0, 0.0, 1.0);  // value from 0 → 1
float blend = step(1.0 - p, uv.x); // exactly like Scene1→2
finalTexture = mix(_texture2, _texture3, blend);
        }
      }

      if (transition == 1) {
        float blend = smoothstep(0.0, 1.0, progression);
        finalTexture = mix(_texture1, _texture3, blend);
      }
      gl_FragColor = finalTexture;
      // #include <tonemapping_fragment>
      // #include <encodings_fragment>
    }
    `
);
