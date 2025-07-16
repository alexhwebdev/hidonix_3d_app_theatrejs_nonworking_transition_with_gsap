"use client";

import { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, extend, useThree, useFrame, invalidate } from "@react-three/fiber";
import { 
  Grid,
  OrbitControls, 
  PerspectiveCamera,
  SoftShadows,
  TransformControls,
  useProgress
} from "@react-three/drei";
import gsap from "gsap";
import './page.scss';
import { useControls, levaStore } from "leva";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { atom, useAtom } from "jotai";
import { Leva } from "leva";

import { UI, transitionAtom } from "./components/UI/UI";
import { Experience } from "./components/Experience";

import { TransitionMaterial } from "./components/ShaderMaterials/TransitionMaterial";
import { TeleportationMaterial } from "./components/ShaderMaterials/TeleportationMaterial";
import { SlidingTransitionMaterial } from "./components/ShaderMaterials/SlidingTransitionMaterial";
import { HexTileTransitionMaterial } from "./components/ShaderMaterials/HexTileTransitionMaterial";
import { GridDissolveTransitionMaterial } from "./components/ShaderMaterials/GridDissolveTransitionMaterial";

extend({
  TransitionMaterial,
  TeleportationMaterial,
  SlidingTransitionMaterial,
  HexTileTransitionMaterial,
  GridDissolveTransitionMaterial
});



// export const transitionAtom = atom(false);
export const sceneGroupAtom = atom("SceneGroupOne");
export const transitionTriggerAtom = atom(false);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const sceneOrder = [
  "Scene1", "Scene2", "Scene3", 
  "Scene4", "Scene5", "Scene6", 
];
// const cameraPositions = {
//   Scene1: { x: -7, y: 5, z: 6.5 },
//   Scene2: { x: -1, y: 14.5, z: -5.05 },
//   Scene3: { x: -4.579, y: 1.697, z: 2.177 },
//   // Scene4: { x: -4.579, y: 1.697, z: 2.177 },
// };
// const cameraTargets = {
//   Scene1: { x: 0, y: -1, z: 0 },
//   Scene2: { x: 0, y: 0, z: -5.043 },
//   Scene3: { x: -2.034, y: 0.464, z: 0.550 },
//   // Scene4: { x: -2.034, y: 0.464, z: 0.550 },
// };

export default function App() {
  const [currentScene, setCurrentScene] = useState("Scene1");
  const initialCameraRef = useRef();
  const cameraOffsetGroupRef = useRef();
  const cameraControlTarget = useRef();
  const lookAtControlTarget = useRef();
  const currentSceneRef = useRef("Scene1");
  
  const scrollLock = useRef(false);
  const forceUiUpdateRef = useRef(null);
  const particlesRef = useRef();

  const [transition, setTransition] = useAtom(transitionAtom);

  const prevSceneRef = useRef("Scene1");
  const [transitionTrigger, setTransitionTrigger] = useAtom(transitionTriggerAtom);

  // const { progress } = useProgress();
  // useEffect(() => {
  //   if (progress === 100) {
  //     setTransition(false);
  //   }
  // }, [progress]);


  const [sceneGroup, setSceneGroup] = useAtom(sceneGroupAtom);

  // INITIAL PAGE LOAD ANIMATION
  // const initialCameraPosition = { x: -7, y: 5, z: 6.5 };
  // useEffect(() => {
  //   let raf;

  //   function tryAnimateCamera() {
  //     const cam = initialCameraRef.current;
  //     if (!cam) {
  //       raf = requestAnimationFrame(tryAnimateCamera);
  //       return;
  //     }
  //     // Starting position, before Scene1
  //     cam.position.set(12, 2, 7);

  //     gsap.to(cam.position, {
  //       // ...cameraPosition,
  //       ...initialCameraPosition,
  //       duration: 2,
  //       ease: "power2.inOut",
  //       onUpdate: () => invalidate(),
  //       onComplete: () => {
  //         // cam.lookAt(
  //         //   initialCameraTarget.x,
  //         //   initialCameraTarget.y,
  //         //   initialCameraTarget.z
  //         // );
  //         TriggerUiChange();
  //         particlesRef.current?.resetMouse?.();
  //       }
  //     });
  //   }

  //   tryAnimateCamera();

  //   return () => cancelAnimationFrame(raf);
  // }, []);

  function TriggerUiChange() {
    forceUiUpdateRef.current?.(); // 🔁 this will re-render SceneUI
  }

  // function CameraAnimator({ particlesRef }) {    
  //   // ---------- Handle scene transitions ----------
  //   const { camera } = useThree();
  //   const activeScene = useRef(null);
  //   const lookAtTarget = useRef(new THREE.Vector3()); // store lookAt separately for animation

  //   // Always make camera look at the animated target
  //   useFrame(() => {
  //     camera.lookAt(lookAtTarget.current);
  //   });

  //   useFrame(() => {
  //     const target = currentSceneRef.current;
  //     if (!target || activeScene.current === target) return;
  //     activeScene.current = target;

  //     const camPos = cameraPositions[target];
  //     const camTarget = cameraTargets[target];
  //     if (!camPos || !camTarget) return;

  //     const fromTarget = lookAtTarget.current.clone();
  //     const toTarget = new THREE.Vector3(camTarget.x, camTarget.y, camTarget.z);

  //     // Animate camera position
  //     gsap.to(camera.position, {
  //       x: camPos.x,
  //       y: camPos.y,
  //       z: camPos.z,
  //       duration: 2,
  //       ease: "power2.inOut",
  //       onUpdate: () => invalidate(),
  //     });

  //     // Animate camera lookAt target
  //     gsap.to(fromTarget, {
  //       x: toTarget.x,
  //       y: toTarget.y,
  //       z: toTarget.z,
  //       duration: 2,
  //       ease: "power2.inOut",
  //       onUpdate: () => {
  //         camera.lookAt(fromTarget);
  //         invalidate();
  //       },
  //       onComplete: () => {
  //         lookAtTarget.current.copy(toTarget);
  //         particlesRef.current?.resetMouse();
  //         // TriggerUiChange();
  //       }
  //     });

  //     // Animate lookAt target
  //     gsap.to(lookAtTarget.current, {
  //       x: camTarget.x,
  //       y: camTarget.y,
  //       z: camTarget.z,
  //       duration: 2,
  //       ease: "power2.inOut",
  //       onUpdate: () => invalidate(),
  //       onComplete: () => {
  //         particlesRef.current?.resetMouse?.();
  //         // TriggerUiChange();
  //       },
  //     });
  //   });
  //   return null;
  // }

  // Scroll-based scene switching
  
  useEffect(() => {
    let scrollLockTimeout;

    const handleWheel = (e) => {
      if (scrollLock.current) return;

      const direction = e.deltaY > 0 ? 1 : -1;
      const currentIdx = sceneOrder.indexOf(currentSceneRef.current);
      const newIdx = Math.max(0, Math.min(sceneOrder.length - 1, currentIdx + direction));

      if (newIdx === currentIdx) return;

      const nextScene = sceneOrder[newIdx];
      const prevScene = currentSceneRef.current;

      scrollLock.current = true;
      currentSceneRef.current = nextScene;
      setCurrentScene(nextScene); // 🔁 React state triggers CameraAnimator

      // Scroll snap:
      window.scrollTo({
        top: newIdx * window.innerHeight,
        behavior: "smooth"
      });

      if (prevScene === "Scene3" && nextScene === "Scene4") {
        setTransitionTrigger(true);
      }

      TriggerUiChange();

      scrollLockTimeout = setTimeout(() => {
        scrollLock.current = false;
      }, 1500); // shorter lock — prevents double fire
    };

    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      clearTimeout(scrollLockTimeout);
    };
  }, []);



  return (
    <>
      {/* Scrollable page: 1 full-height div per scene */}
      <div style={{ height: "600vh", position: "absolute", top: 0, left: 0, width: "100%", zIndex: -5 }} />
     
      <Leva hidden />
     
      <UI
        currentSceneRef={currentSceneRef} // read-only
        forceUiUpdateRef={forceUiUpdateRef}
      />

      <Canvas
        style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          width: '100%',
          height: '100%',
          zIndex: 1 
        }}
        frameloop="always"
        shadows
        gl={{ preserveDrawingBuffer: true }}
        // camera={{ position: [0, 1.8, 5], fov: 42 }}
      >
        {/* <OrbitControls /> */}
        {/* <color attach="background" args={[backgroundColor]} /> */}

        <axesHelper args={[5]} />

        {/* <CameraMovement 
          cameraGroupRef={cameraOffsetGroupRef} 
          intensity={2.0} 
          sceneNameRef={currentSceneRef}
        /> */}

        {/* <CameraAnimator particlesRef={particlesRef} /> */}

        <Experience
          // currentSceneRef={currentSceneRef} 
          // forceUiUpdateRef={forceUiUpdateRef}
          // sceneGroup={sceneGroup}
          currentScene={currentScene}
        />

      </Canvas>
    </>
  );
}
