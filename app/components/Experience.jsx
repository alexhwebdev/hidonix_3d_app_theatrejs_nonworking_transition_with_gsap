import {
  CameraControls,
  Environment,
  OrbitControls,
  PerspectiveCamera,
  useEnvironment,
  useFBO,
  useGLTF,
} from "@react-three/drei";
import { extend, invalidate, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { MathUtils, Vector3 } from "three";
import { DEG2RAD } from "three/src/math/MathUtils";
import * as THREE from "three";
import gsap from "gsap";

import ParticlesHoverPlane from "./ParticlesHoverPlane/ParticlesHoverPlane";
import SceneTwo from "./SceneTwo";
import SceneOne from "./SceneOne";
import SceneThree from "./SceneThree";

const nbModes = 2;

const cameraPositions = {
  Scene1: { x: -7, y: 5, z: 6.5 },
  Scene2: { x: -1, y: 14.5, z: -5.05 },
  Scene3: { x: -4.579, y: 1.697, z: 2.177 },
  // Scene4: { x: -4.579, y: 1.697, z: 2.177 },
};

const cameraTargets = {
  Scene1: { x: 0, y: -1, z: 0 },
  Scene2: { x: 0, y: 0, z: -5.043 },
  Scene3: { x: -2.034, y: 0.464, z: 0.550 },
  // Scene4: { x: -2.034, y: 0.464, z: 0.550 },
};

export const Experience = ({ 
  // sceneGroup,
  currentScene
}) => {
  // // NOT SURE IF THIS IS NEEDED WITH sceneGroup
  // const focusTargetRef = useRef(new Vector3(0, 0, 0));
  // const focusTargetVisualizerRef = useRef();
  // useFrame(() => {
  //   if (focusTargetVisualizerRef.current) {
  //     focusTargetRef.current.copy(focusTargetVisualizerRef.current.position);
  //   }
  // });

  
  const { scene: modernStadiumScene } = useGLTF("/models/vallourec_stadium_draco.glb");
  const environmentMap = useEnvironment({ preset: "city" });

  const viewport = useThree((state) => state.viewport);
  const firstScene = useRef();
  const secondScene = useRef();
  const thirdScene = useRef();

  const firstRenderScene = useRef(new THREE.Scene());
  const secondRenderScene = useRef(new THREE.Scene());
  const thirdRenderScene = useRef(new THREE.Scene());

  const renderTarget1 = useFBO();
  const renderTarget2 = useFBO();
  const renderTarget3 = useFBO();
  const renderMaterial = useRef();
  // const [mode, setMode] = useState(0);
  // const [prevMode, setPrevMode] = useState(0);
  
  // First scene camera
  const firstSceneCamera = useRef();
  const renderCamera = useRef();
  const controls = useRef();

  const progressionRef = useRef({ value: 0 }); // 0 to 1
  const prevSceneRef = useRef(null);
  const particlesRef = useRef();
  const scrollSpeed = 0.9;

  // Scene setup, environment configuration
  // Add contents to those scenes (with useEffect to avoid rerenders)
  // 1. Attaching Scene Contents to Render Scenes
  useEffect(() => {
    if (firstScene.current) firstRenderScene.current.add(firstScene.current);
    if (secondScene.current) secondRenderScene.current.add(secondScene.current);
    if (thirdScene.current) thirdRenderScene.current.add(thirdScene.current);
  }, []);
  // 2. Setting Environment & Background for Each Render Scene
  useEffect(() => {
    [firstRenderScene, secondRenderScene, thirdRenderScene].forEach((sceneRef) => {
      sceneRef.current.environment = environmentMap;
      sceneRef.current.background = new THREE.Color(0x000000);
    });
  }, [environmentMap]);

  // useEffect(() => {
  //   if (firstSceneCamera.current) {
  //     firstRenderScene.current.add(firstSceneCamera.current);
  //     // firstSceneCamera.current.lookAt(0, 0, 0);
  //   }
  // }, []);









  const lookAtTarget = useRef(new THREE.Vector3());

  // Animate camera using GSAP on scene change
useEffect(() => {
  if (!currentScene) return;

  const cam = firstSceneCamera.current;
  const prevScene = prevSceneRef.current;
  prevSceneRef.current = currentScene;

  const pRef = progressionRef.current;
  const timeline = gsap.timeline();

  // ✅ TransitionMaterial animation logic (Scene3 ↔ Scene4)
  if ((currentScene === "Scene3" && prevScene === "Scene4") ||
      (currentScene === "Scene4" && prevScene === "Scene3")) {
    
    if (currentScene === "Scene3") {
      // Scene4 → Scene3 (reverse)
      pRef.value = 2.0;
      timeline.to(pRef, {
        value: 1.0,
        duration: 2,
        ease: "power2.inOut",
      }).to(pRef, {
        value: 0.0,
        duration: 2,
        ease: "power2.inOut",
        delay: 0.3,
      });
    }

    if (currentScene === "Scene4") {
      // Scene3 → Scene4 (forward)
      pRef.value = 0.0;
      timeline.to(pRef, {
        value: 1.0,
        duration: 2,
        ease: "power2.inOut",
      }).to(pRef, {
        value: 2.0,
        duration: 2,
        ease: "power2.inOut",
        delay: 0.3,
      });
    }

    return () => timeline.kill();
  }

  // ✅ Skip camera animation if no camera data exists for this scene
  const toPos = cameraPositions[currentScene];
  const toLook = cameraTargets[currentScene];
  if (!cam || !toPos || !toLook) return;

  const fromPos = { x: cam.position.x, y: cam.position.y, z: cam.position.z };
  const fromLook = lookAtTarget.current.clone();
  const toLookVec = new THREE.Vector3(toLook.x, toLook.y, toLook.z);

  // ✅ Camera GSAP animation (only when valid)
  gsap.to(fromPos, {
    ...toPos,
    duration: 2,
    ease: "power2.inOut",
    onUpdate: () => {
      cam.position.set(fromPos.x, fromPos.y, fromPos.z);
      cam.lookAt(lookAtTarget.current);
      invalidate();
    },
  });

  gsap.to(fromLook, {
    x: toLookVec.x,
    y: toLookVec.y,
    z: toLookVec.z,
    duration: 2,
    ease: "power2.inOut",
    onUpdate: () => {
      lookAtTarget.current.copy(fromLook);
      cam.lookAt(lookAtTarget.current);
      invalidate();
    },
  });

  return () => timeline.kill();
}, [currentScene]);





  useEffect(() => {
    if (!currentScene) return;
    const prevScene = prevSceneRef.current;
    prevSceneRef.current = currentScene;

    const timeline = gsap.timeline();
    const pRef = progressionRef.current;

    console.log('Current Scene:', currentScene);
    console.log('Previous Scene:', prevScene);

    if (currentScene === "Scene3" && prevScene === "Scene4") {
      pRef.value = 2.0;
      timeline.to(pRef, {
        value: 1.0,
        duration: 2,
        ease: "power2.inOut"
      }).to(pRef, {
        value: 0.0,
        duration: 2,
        ease: "power2.inOut",
        delay: 0.3
      });
    }

    if (currentScene === "Scene4" && prevScene === "Scene3") {
      pRef.value = 0;
      timeline.to(pRef, {
        value: 1.0,
        duration: 2,
        ease: "power2.inOut"
      }).to(pRef, {
        value: 2.0,
        duration: 2,
        ease: "power2.inOut",
        delay: 0.3
      });
      // return;
    }

    return () => timeline.kill();
  }, [currentScene]);

  // useEffect(() => {
  //   if (mode === prevMode) {
  //     return;
  //   }
  //   renderMaterial.current.progression = 0;
  // }, [mode]);

  const MAX_PROGRESS = 2.0;

  // useEffect(() => {
  //   controls.current.camera = renderCamera.current;
  //   controls.current.setLookAt(
  //     2.0146, 2.8228, 10.5870,
  //     1.0858, 1.9366, 1.7546
  //   );
  // }, []);

  useFrame(({ gl }) => {
    if (renderMaterial.current) {
      renderMaterial.current.progression = progressionRef.current.value;
    }

    gl.setRenderTarget(renderTarget1);
    gl.clear();
    gl.render(firstRenderScene.current, firstSceneCamera.current); // ✅ SceneOne uses its own camera

    gl.setRenderTarget(renderTarget2);
    gl.clear();
    gl.render(secondRenderScene.current, renderCamera.current);

    gl.setRenderTarget(renderTarget3);
    gl.clear();
    gl.render(thirdRenderScene.current, renderCamera.current);

    gl.setRenderTarget(null);
  });


  // const startPos = useRef(new THREE.Vector3());
  // const endPos = useRef(new THREE.Vector3());
  // const startQuat = useRef(new THREE.Quaternion());
  // const endQuat = useRef(new THREE.Quaternion());
  // const progress = useRef(0);
  // const isAnimating = useRef(false);
  // // TEST FUNCTION
  // function test() {
  //   useEffect(() => {
  //     const camera = firstSceneCamera.current;
  //     if (!camera || !currentScene) return;

  //     const nextPos = cameraPositions[currentScene];
  //     const nextLook = cameraTargets[currentScene];
  //     if (!nextPos || !nextLook) return;

  //     // Save starting position and rotation
  //     startPos.current.copy(camera.position);
  //     startQuat.current.copy(camera.quaternion);

  //     // Create target quaternion based on lookAt
  //     const tempCam = new THREE.PerspectiveCamera();
  //     tempCam.position.set(nextPos.x, nextPos.y, nextPos.z);
  //     tempCam.lookAt(new THREE.Vector3(nextLook.x, nextLook.y, nextLook.z));
  //     endPos.current.set(nextPos.x, nextPos.y, nextPos.z);
  //     endQuat.current.copy(tempCam.quaternion);

  //     progress.current = 0;
  //     isAnimating.current = true;
  //   }, [currentScene]);  
  //   useFrame((_, delta) => {
  //     if (!isAnimating.current || !firstSceneCamera.current) return;

  //     const duration = 2.0; // seconds
  //     progress.current += delta / duration;

  //     const t = Math.min(Math.max(progress.current, 0), 1);
  //     const easedT = easeInOutPower(t);
  //     const camera = firstSceneCamera.current;

  //     // Just after interpolation:
  //     if (t >= 1) {
  //       isAnimating.current = false;
  //       camera.position.copy(endPos.current);
  //       camera.quaternion.copy(endQuat.current);
  //     }

  //     camera.position.lerpVectors(startPos.current, endPos.current, easedT);
  //     camera.quaternion.slerpQuaternions(startQuat.current, endQuat.current, easedT);
  //     camera.updateMatrixWorld();

  //     if (t >= 1) {
  //       isAnimating.current = false;
  //     }

  //     invalidate();
  //   });
  // }




// function easeInOutPower(t) {
//   return -(Math.cos(Math.PI * t) - 1) / 2;
// }
// function CameraAnimator({ cameraRef, sceneName }) {
//   const startPos = useRef(new THREE.Vector3());
//   const endPos = useRef(new THREE.Vector3());

//   const startQuat = useRef(new THREE.Quaternion());
//   const endQuat = useRef(new THREE.Quaternion());

//   const progress = useRef(0);
//   const isAnimating = useRef(false);

//   useEffect(() => {
//     const camera = cameraRef.current;
//     if (!camera || !sceneName) return;

//     const nextPos = cameraPositions[sceneName];
//     const nextLook = cameraTargets[sceneName];
//     if (!nextPos || !nextLook) return;

//     // Save starting position and rotation
//     startPos.current.copy(camera.position);
//     startQuat.current.copy(camera.quaternion);

//     // Create target quaternion based on lookAt
//     const tempCam = new THREE.PerspectiveCamera();
//     tempCam.position.set(nextPos.x, nextPos.y, nextPos.z);
//     tempCam.lookAt(new THREE.Vector3(nextLook.x, nextLook.y, nextLook.z));
//     endPos.current.set(nextPos.x, nextPos.y, nextPos.z);
//     endQuat.current.copy(tempCam.quaternion);

//     progress.current = 0;
//     isAnimating.current = true;
//   }, [sceneName]);

//   useFrame((_, delta) => {
//     if (!isAnimating.current || !cameraRef.current) return;

//     const duration = 2.0; // seconds
//     progress.current += delta / duration;

//     const t = Math.min(Math.max(progress.current, 0), 1);
//     const easedT = easeInOutPower(t);
//     const camera = cameraRef.current;

//     // Just after interpolation:
//     if (t >= 1) {
//       isAnimating.current = false;
//       camera.position.copy(endPos.current);
//       camera.quaternion.copy(endQuat.current);
//     }

//     camera.position.lerpVectors(startPos.current, endPos.current, easedT);
//     camera.quaternion.slerpQuaternions(startQuat.current, endQuat.current, easedT);

//     camera.updateMatrixWorld();

//     if (t >= 1) {
//       isAnimating.current = false;
//     }

//     invalidate();
//   });


//   return null;
// }


  // // ORIGINAL CAMERA ANIMATOR
  // function CameraAnimatorOri({ cameraRef, sceneName }) {
  //   const activeScene = useRef(null);
  //   const lookAtTarget = useRef(new THREE.Vector3());

  //   useFrame(() => {
  //     if (!cameraRef.current) return;
  //     cameraRef.current.lookAt(lookAtTarget.current);
  //   });

  //   useEffect(() => {
  //     const camera = cameraRef.current;
  //     if (!camera || activeScene.current === sceneName) return;
  //     activeScene.current = sceneName;

  //     const camPos = cameraPositions[sceneName];
  //     const camTarget = cameraTargets[sceneName];
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
  //       onUpdate: () => invalidate()
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
  //       }
  //     });
  //   }, [sceneName]);

  //   return null;
  // }


  // ---------- Test Snippet ----------
  // useEffect(() => {
  //   if (!firstSceneCamera.current) return;

  //   const cam = firstSceneCamera.current;
  //   const lookAtTarget = new THREE.Vector3();
  //   const tempTarget = new THREE.Vector3();

  //   const steps = [
  //     {
  //       fromPos: cameraPositions.Scene1,
  //       toPos: cameraPositions.Scene2,
  //       fromLook: cameraTargets.Scene1,
  //       toLook: cameraTargets.Scene2,
  //     },
  //     {
  //       fromPos: cameraPositions.Scene2,
  //       toPos: cameraPositions.Scene3,
  //       fromLook: cameraTargets.Scene2,
  //       toLook: cameraTargets.Scene3,
  //     },
  //     {
  //       fromPos: cameraPositions.Scene3,
  //       toPos: cameraPositions.Scene1,
  //       fromLook: cameraTargets.Scene3,
  //       toLook: cameraTargets.Scene1,
  //     }
  //   ];

  //   // Initialize camera at first position
  //   cam.position.set(
  //     steps[0].fromPos.x,
  //     steps[0].fromPos.y,
  //     steps[0].fromPos.z
  //   );
  //   lookAtTarget.set(
  //     steps[0].fromLook.x,
  //     steps[0].fromLook.y,
  //     steps[0].fromLook.z
  //   );
  //   cam.lookAt(lookAtTarget);

  //   const timeline = gsap.timeline({ repeat: 0, repeatDelay: 1 }); // loops

  //   steps.forEach(({ fromPos, toPos, fromLook, toLook }, index) => {
  //     const proxy = { t: 0 };

  //     timeline.to(proxy, {
  //       t: 1,
  //       duration: 2,
  //       ease: "power2.inOut",
  //       onUpdate: () => {
  //         cam.position.set(
  //           MathUtils.lerp(fromPos.x, toPos.x, proxy.t),
  //           MathUtils.lerp(fromPos.y, toPos.y, proxy.t),
  //           MathUtils.lerp(fromPos.z, toPos.z, proxy.t)
  //         );

  //         tempTarget.set(
  //           MathUtils.lerp(fromLook.x, toLook.x, proxy.t),
  //           MathUtils.lerp(fromLook.y, toLook.y, proxy.t),
  //           MathUtils.lerp(fromLook.z, toLook.z, proxy.t)
  //         );

  //         cam.lookAt(tempTarget);
  //         invalidate();
  //       }
  //     }, index === 0 ? "+=0.5" : "+=0.3");
  //   });

  //   return () => timeline.kill();
  // }, []);





  return (
    <>
      <PerspectiveCamera 
        near={0.5} 
        ref={renderCamera} 
        position={[0, 0, 25]}
      />
      <ambientLight intensity={1.0} />

      <directionalLight
        position={[10, 30, 10]}
        intensity={10.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <CameraControls
        ref={controls}
        enablePan={false} // Disables panning, so users can't shift the scene left/right/up/down.
        minPolarAngle={DEG2RAD * 70}
        maxPolarAngle={DEG2RAD * 85}
        minAzimuthAngle={DEG2RAD * -30}
        maxAzimuthAngle={DEG2RAD * 30}
        minDistance={5}
        maxDistance={9}

        // Disables zoom on scroll
        dollyToCursor={false}
        enabled={true}
        mouseButtons={{
          left: 1,  // pan
          middle: 0, // disabled
          right: 1,  // rotate
          wheel: 0,  // disable wheel
        }}
        touches={{
          one: 0,
          two: 0
        }}
      />

      {/* ---------- TRANSITIONS MATERIAL ---------- */}
      <mesh>
        <planeGeometry args={[viewport.width, viewport.height]} />
        {/* <transitionMaterial
          ref={renderMaterial}
          tex1={renderTarget1.texture}
          tex2={renderTarget2.texture}
          tex3={renderTarget3.texture}
          toneMapped={false}
          transition={0} // 0 = horizontal, 1 = vertical
        /> */}
        <teleportationMaterial
          ref={renderMaterial}
          tex1={renderTarget1.texture}
          tex2={renderTarget2.texture}
          tex3={renderTarget3.texture}
          toneMapped={false}
          transition={0} // 0 = horizontal, 1 = vertical
        />
        {/* <slidingTransitionMaterial
          ref={renderMaterial}
          tex1={renderTarget1.texture}
          tex2={renderTarget2.texture}
          resolution={[viewport.width, viewport.height]}
          toneMapped={false}
        /> */}
        {/* <hexTileTransitionMaterial
          ref={renderMaterial}
          tex1={renderTarget1.texture}
          tex2={renderTarget2.texture}
          resolution={[viewport.width, viewport.height]}
          progression={progressionRef.current.value}
          toneMapped={false}
        /> */}
        {/* <gridDissolveTransitionMaterial
          ref={renderMaterial}
          tex1={renderTarget1.texture}
          tex2={renderTarget2.texture}
          resolution={[viewport.width, viewport.height]}
          size={[10, 10]}             // Size of the grid blocks
          smoothness={0.5}            // Controls fade blend
          progression={progressionRef.current.value}
          toneMapped={false}
        /> */}
      </mesh>

      {/* ---------- FIRST SCENE ---------- */}
      <group 
        ref={firstScene}
        // visible={sceneGroup === "SceneGroupOne"}
      >
        <PerspectiveCamera
          ref={firstSceneCamera}
          makeDefault={false} // Don't override global default camera
          position={[12, 2, 7]} // starting point
          // rotation={[0, 0, 0]}
          near={0.5} 
        />

        {/* <CameraAnimator 
          key={currentScene}
          cameraRef={firstSceneCamera}
          sceneName={currentScene}
          // particlesRef={particlesRef} 
        /> */}

        {/* <mesh position-x={1}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="red" />

          <SceneOne />
        </mesh> */}

        <SceneOne 
          camera={firstSceneCamera} 
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          scale={0.2}
        />
      </group>

      {/* ---------- SECOND SCENE ---------- */}
      <group ref={secondScene}>
        <mesh position-x={1}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="white" />
          
          <SceneTwo 
            scale={2} 
            // envMapIntensity={0.3} 
            position={[0, 0, -50]}
            rotation={[0.3, 0, 0]}
          />
        </mesh>
      </group>

      {/* ---------- THIRD SCENE ---------- */}
      <group ref={thirdScene}>
        <mesh position-x={1}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="blue" />

          <SceneThree
            scale={2} 
            // envMapIntensity={0.3} 
            position={[0, 0, -50]}
            rotation={[0.3, 0, 0]}
          />
        </mesh>
      </group>
    </>
  );
};

// useGLTF.preload("/models/modern_kitchen.glb");
useGLTF.preload("/models/vallourec_stadium_draco.glb");
