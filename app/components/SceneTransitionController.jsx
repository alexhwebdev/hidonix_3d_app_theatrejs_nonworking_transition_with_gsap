// components/SceneTransitionController.jsx
"use client";
import { useFBO, Hud } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import { TransitionMaterial } from "./ShaderMaterials/TransitionMaterial";
import { extend } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

extend({ TransitionMaterial });

function SceneTransitionController({
  sceneGroupOneRef,
  sceneGroupTwoRef,
  triggerTransitionRef
}) {
  const matRef = useRef();
  const [active, setActive] = useState(false);
  const rt1 = useFBO(); const rt2 = useFBO();
  const { gl, camera } = useThree();

  // 🔁 Triggered externally via ref
  triggerTransitionRef.current = () => {
    sceneGroupOneRef.current.visible = true;
    sceneGroupTwoRef.current.visible = true;
    setActive(true);
  };

  // 🔧 Safely start shader animation
  useEffect(() => {
    if (!active || !matRef.current) return;

    gsap.set(matRef.current, { progression: 0 });
    gsap.to(matRef.current, {
      progression: 1,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        setActive(false);
        sceneGroupTwoRef.current.visible = true;
      }
    });
  }, [active]);

  // 📷 Offscreen rendering of both scenes
  useFrame(() => {
    if (!active) return;

    gl.setRenderTarget(rt1);
    gl.render(sceneGroupOneRef.current, camera);

    gl.setRenderTarget(rt2);
    gl.render(sceneGroupTwoRef.current, camera);

    gl.setRenderTarget(null);
  });

  return active ? (
    <Hud>
      <mesh>
        <planeGeometry args={[2, 2]} />
        <transitionMaterial
          ref={matRef}
          tex1={rt1.texture}
          tex2={rt2.texture}
          transition={0}
          transparent
        />
      </mesh>
    </Hud>
  ) : null;
}
export default SceneTransitionController;