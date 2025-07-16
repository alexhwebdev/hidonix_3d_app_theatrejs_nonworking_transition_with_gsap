import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

export const HexTileTransitionMaterial = shaderMaterial(
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
    #define PI 3.141592654
    #define TAU (2.0 * PI)
    #define HEXTILE_SIZE 0.125
    #define RANDOMNESS 0.75

    varying vec2 vUv;

    uniform float progression;
    uniform sampler2D tex1;
    uniform sampler2D tex2;
    uniform vec2 resolution;

    float hash(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    vec2 hextile(inout vec2 p) {
      const vec2 sz = vec2(1.0, sqrt(3.0));
      const vec2 hsz = 0.5 * sz;

      vec2 p1 = mod(p, sz) - hsz;
      vec2 p2 = mod(p - hsz, sz) - hsz;
      vec2 p3 = dot(p1, p1) < dot(p2, p2) ? p1 : p2;
      vec2 n = ((p3 - p + hsz) / sz);
      p = p3;
      return round(n * 2.0) / 2.0;
    }

    float hex(vec2 p, float r) {
      p.xy = p.yx;
      const vec3 k = vec3(-sqrt(3.0/4.0), 0.5, 1.0/sqrt(3.0));
      p = abs(p);
      p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
      p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
      return length(p) * sign(p.y);
    }

    float tanh_approx(float x) {
      float x2 = x * x;
      return clamp(x * (27.0 + x2) / (27.0 + 9.0 * x2), -1.0, 1.0);
    }

    vec3 hexTransition(vec2 uv, float aa, vec3 from, vec3 to, float m) {
      m = clamp(m, 0.0, 1.0);
      const float hz = HEXTILE_SIZE;
      const float rz = RANDOMNESS;
      vec2 hp = uv / hz;
      vec2 hn = hextile(hp) * hz * -vec2(-1.0, sqrt(3.0));
      float r = hash(hn + 123.4);

      const float off = 3.0;
      float fi = smoothstep(0.0, 0.1, m);
      float fo = smoothstep(0.9, 1.0, m);

      float sz = 0.45 * (0.5 + 0.5 * tanh_approx((rz * r + hn.x + hn.y - off + m * off * 2.0) * 2.0));
      float hd = (hex(hp, sz) - 0.1 * sz) * hz;

      float mm = smoothstep(-aa, aa, -hd);
      mm = mix(0.0, mm, fi);
      mm = mix(mm, 1.0, fo);

      return mix(from, to, mm);
    }

    vec3 postProcess(vec3 col, vec2 uv) {
      col = pow(clamp(col, 0.0, 1.0), vec3(0.75));
      col = col * 0.6 + 0.4 * col * col * (3.0 - 2.0 * col);
      col = mix(col, vec3(dot(col, vec3(0.33))), -0.4);
      col *= 0.5 + 0.5 * pow(19.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y), 0.7);
      return col;
    }

    void main() {
      vec2 q = vUv;
      vec2 p = -1.0 + 2.0 * q;
      p.x *= resolution.x / resolution.y;
      float aa = 2.0 / resolution.y;

      vec3 col1 = texture2D(tex1, q).rgb;
      vec3 col2 = texture2D(tex2, q).rgb;

      vec3 color = hexTransition(p, aa, col1, col2, progression);
      color = postProcess(color, q);

      gl_FragColor = vec4(color, 1.0);
    }
  `
);
