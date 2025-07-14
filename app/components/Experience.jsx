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

export const Experience = ({ 
  sceneGroup,
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

  // console.log("sceneGroup ", sceneGroup)
  const environmentMap = useEnvironment({ preset: "sunset" });


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

  const particlesRef = useRef();

  // First scene camera
  const firstSceneCamera = useRef();

  const { scene: modernStadiumScene } = useGLTF("/models/vallourec_stadium_draco.glb");

  const renderCamera = useRef();
  const controls = useRef();

  const progressionRef = useRef({ value: 0 }); // 0 to 1
  const scrollSpeed = 0.9;
  const prevSceneRef = useRef(null);

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

  // Add contents to those scenes (with useEffect to avoid rerenders)
  useEffect(() => {
    if (firstScene.current) firstRenderScene.current.add(firstScene.current);
    if (secondScene.current) secondRenderScene.current.add(secondScene.current);
    if (thirdScene.current) thirdRenderScene.current.add(thirdScene.current);
  }, []);

  useEffect(() => {
    [firstRenderScene, secondRenderScene, thirdRenderScene].forEach((sceneRef) => {
      sceneRef.current.environment = environmentMap;
      sceneRef.current.background = environmentMap;
    });
  }, [environmentMap]);

  useEffect(() => {
    if (!currentScene) return;
    const prevScene = prevSceneRef.current;
    prevSceneRef.current = currentScene;

    const timeline = gsap.timeline();
    const pRef = progressionRef.current;

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

    return () => timeline.kill();
  }, [currentScene]);

  // useEffect(() => {
  //   if (mode === prevMode) {
  //     return;
  //   }
  //   renderMaterial.current.progression = 0;
  // }, [mode]);

  const MAX_PROGRESS = 2.0;

  // console.log("progressionRef", progressionRef);

  useEffect(() => {
    controls.current.camera = renderCamera.current;
    controls.current.setLookAt(
      2.0146, 2.8228, 10.5870,
      1.0858, 1.9366, 1.7546
    );
  }, []);

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

  useEffect(() => {
    if (firstSceneCamera.current) {
      firstRenderScene.current.add(firstSceneCamera.current);
    }
  }, []);

  function CameraAnimator({ cameraRef, sceneName }) {
    const activeScene = useRef(null);
    const lookAtTarget = useRef(new THREE.Vector3());

    useFrame(() => {
      if (!cameraRef.current) return;
      cameraRef.current.lookAt(lookAtTarget.current);
    });

    useEffect(() => {
      const camera = cameraRef.current;
      if (!camera || activeScene.current === sceneName) return;
      activeScene.current = sceneName;

      const camPos = cameraPositions[sceneName];
      const camTarget = cameraTargets[sceneName];
      if (!camPos || !camTarget) return;

      const fromTarget = lookAtTarget.current.clone();
      const toTarget = new THREE.Vector3(camTarget.x, camTarget.y, camTarget.z);

      gsap.to(camera.position, {
        ...camPos,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => invalidate()
      });

      gsap.to(fromTarget, {
        ...toTarget,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => {
          camera.lookAt(fromTarget);
          invalidate();
        },
        onComplete: () => {
          lookAtTarget.current.copy(toTarget);
          particlesRef.current?.resetMouse();
        }
      });
    }, [sceneName]);

    return null;
  }


  return (
    <>
      <PerspectiveCamera 
        near={0.5} 
        ref={renderCamera} 
      />
      <CameraControls
        enablePan={false}
        minPolarAngle={DEG2RAD * 70}
        maxPolarAngle={DEG2RAD * 85}
        minAzimuthAngle={DEG2RAD * -30}
        maxAzimuthAngle={DEG2RAD * 30}
        minDistance={5}
        maxDistance={9}
        ref={controls}

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

      <mesh>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <transitionMaterial
          ref={renderMaterial}
          tex1={renderTarget1.texture}
          tex2={renderTarget2.texture}
          tex3={renderTarget3.texture}
          toneMapped={false}
          transition={0} // 0 = horizontal, 1 = vertical
        />
        {/* <teleportationMaterial
          ref={renderMaterial}
          tex1={renderTarget1.texture}
          tex2={renderTarget2.texture}
          tex3={renderTarget3.texture}
          toneMapped={false}
          transition={0} // 0 = horizontal, 1 = vertical
        /> */}
      </mesh>

      <group 
        ref={firstScene}
        // visible={sceneGroup === "SceneGroupOne"}
      >
        <PerspectiveCamera
          ref={firstSceneCamera}
          makeDefault={false} // Don't override global default camera
          position={[12, 2, 7]} // starting point
        />

        <CameraAnimator 
          cameraRef={firstSceneCamera}
          sceneName={currentScene}
          // particlesRef={particlesRef} 
        />

        <Environment preset="sunset" blur={0.4} background />
        {/* <ambientLight intensity={0.3} /> */}
        {/* <directionalLight position={[10, 0, 0]} intensity={0.7} castShadow /> */}
        {/* <primitive 
          object={modernStadiumScene} 
          // rotation-y={Math.PI / 2} 
          position={[0, 0, -20]}
          rotation={[0.2, 0, 0]}
        /> */}
        <mesh position-x={1}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="red" />

          <SceneOne />
        </mesh>

        <ParticlesHoverPlane  
          width={50}
          height={50}
          segments={500}
          liftRadius={3}
          liftStrength={1.0}
          position={[0, -2, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      </group>

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
