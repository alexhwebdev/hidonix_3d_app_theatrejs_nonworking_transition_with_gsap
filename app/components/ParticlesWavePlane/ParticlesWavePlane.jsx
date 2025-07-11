"use client";
import * as THREE from "three";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";

export default function ParticlesWavePlane({
  width = 50,
  height = 50,
  segments = 500,
  amplitude = 0.5,
  frequency = 0.5,
  speed = 1.0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const pointsRef = useRef();
  const materialRef = useRef();
  const startTime = useRef(performance.now());

  // 🔵 Positions (grid layout)
  const { positions, count } = useMemo(() => {
    const positions = [];
    const stepX = width / segments;
    const stepY = height / segments;

    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const x = -width / 2 + i * stepX;
        const y = -height / 2 + j * stepY;
        positions.push(x, y, 0); // initial Z = 0
      }
    }

    return {
      positions: new Float32Array(positions),
      count: (segments + 1) * (segments + 1),
    };
  }, [segments, width, height]);

  // 🔴 Animate uTime
  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value =
        (performance.now() - startTime.current) * 0.001;
    }
  });

  return (
    <points ref={pointsRef} position={position} rotation={rotation}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        uniforms={{
          uTime: { value: 0 },
          amplitude: { value: amplitude },
          frequency: { value: frequency },
          speed: { value: speed },
          pointSize: { value: 2.0 },
        }}
        vertexShader={/* glsl */`
          uniform float uTime;
          uniform float amplitude;
          uniform float frequency;
          uniform float speed;
          uniform float pointSize;
          varying float vWave;

          void main() {
            vec3 newPos = position;
            float t = uTime * speed;
            float wave = sin(newPos.x * frequency + t) * amplitude +
                         cos(newPos.y * frequency + t) * amplitude;
            newPos.z += wave;
            vWave = wave;

            vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = pointSize * (30.0 / -mvPosition.z);
          }
        `}
        fragmentShader={/* glsl */`
          varying float vWave;

          void main() {
            float r = length(gl_PointCoord - vec2(0.5));
            float circle = smoothstep(0.5, 0.48, r);
            gl_FragColor = vec4(vec3(1.0), circle);
          }
        `}
      />
    </points>
  );
}




// "use client";
// import * as THREE from "three";
// import { useRef, useMemo } from "react";
// import { useFrame } from "@react-three/fiber";

// export default function ParticlesPlane({
//   width = 50,
//   height = 50,
//   segments = 500,           // Grid resolution
//   amplitude = 0.5,          // Wave height
//   frequency = 0.5,          // Wave frequency
//   speed = 1.0,              // Wave speed
//   position = [0, 0, 0],     // Position in world space
//   rotation = [0, 0, 0],     // Rotation in radians
// }) {
//   const pointsRef = useRef();

//   // 🟠 Generate a circular alpha texture
//   const circleTexture = useMemo(() => {
//     const size = 164;
//     const canvas = document.createElement("canvas");
//     canvas.width = canvas.height = size;
//     const ctx = canvas.getContext("2d");

//     ctx.beginPath();
//     ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
//     ctx.fillStyle = "white";
//     ctx.fill();

//     const texture = new THREE.CanvasTexture(canvas);
//     texture.minFilter = THREE.LinearFilter;
//     texture.magFilter = THREE.LinearFilter;
//     texture.generateMipmaps = false;
//     return texture;
//   }, []);

//   // 🟡 Generate grid of points
//   const { positions, count } = useMemo(() => {
//     const positions = [];
//     const stepX = width / segments;
//     const stepY = height / segments;

//     for (let i = 0; i <= segments; i++) {
//       for (let j = 0; j <= segments; j++) {
//         const x = -width / 2 + i * stepX;
//         const y = -height / 2 + j * stepY;
//         const z = 0;
//         positions.push(x, y, z);
//       }
//     }

//     return {
//       positions: new Float32Array(positions),
//       count: (segments + 1) * (segments + 1),
//     };
//   }, [segments, width, height]);

//   // 🔵 Animate wave effect
//   useFrame(({ clock }) => {
//     const time = clock.getElapsedTime();
//     const pos = pointsRef.current.geometry.attributes.position;

//     for (let i = 0; i < count; i++) {
//       const ix = i * 3;
//       const x = pos.array[ix];
//       const y = pos.array[ix + 1];

//       // Animate Z based on time and position
//       pos.array[ix + 2] =
//         Math.sin(x * frequency + time * speed) * amplitude +
//         Math.cos(y * frequency + time * speed) * amplitude;
//     }

//     pos.needsUpdate = true;
//   });

//   return (
//     <points ref={pointsRef} position={position} rotation={rotation}>
//       <bufferGeometry>
//         <bufferAttribute
//           attach="attributes-position"
//           count={count}
//           array={positions}
//           itemSize={3}
//         />
//       </bufferGeometry>
//       <pointsMaterial
//         size={0.1}
//         map={circleTexture}
//         alphaMap={circleTexture}
//         alphaTest={0.5}
//         transparent
//         color={0xffffff}
//         sizeAttenuation
//         depthWrite={false}
//       />
//     </points>
//   );
// }
