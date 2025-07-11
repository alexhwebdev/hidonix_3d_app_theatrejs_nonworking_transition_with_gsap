import {
  CameraControls,
  Environment,
  OrbitControls,
  PerspectiveCamera,
  useEnvironment,
  useFBO,
  useGLTF,
} from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { MathUtils, Vector3 } from "three";
import { DEG2RAD } from "three/src/math/MathUtils";
import * as THREE from "three";

import ParticlesHoverPlane from "./ParticlesHoverPlane/ParticlesHoverPlane";
import SceneTwo from "./SceneTwo";
import SceneOne from "./SceneOne";
import SceneThree from "./SceneThree";

const nbModes = 2;

export const Experience = ({ 
  sceneGroup
}) => {
  // // NOT SURE IF THIS IS NEEDED WITH sceneGroup
  // const focusTargetRef = useRef(new Vector3(0, 0, 0));
  // const focusTargetVisualizerRef = useRef();
  // useFrame(() => {
  //   if (focusTargetVisualizerRef.current) {
  //     focusTargetRef.current.copy(focusTargetVisualizerRef.current.position);
  //   }
  // });
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
  const [mode, setMode] = useState(0);
  const [prevMode, setPrevMode] = useState(0);

  const { scene: modernStadiumScene } = useGLTF("/models/vallourec_stadium_draco.glb");

  const renderCamera = useRef();
  const controls = useRef();

  const progressionRef = useRef(0); // 0 to 1
  const scrollSpeed = 0.9;

  // Add contents to those scenes (with useEffect to avoid rerenders)
  useEffect(() => {
    if (firstScene.current) firstRenderScene.current.add(firstScene.current);
    if (secondScene.current) secondRenderScene.current.add(secondScene.current);
    if (thirdScene.current) thirdRenderScene.current.add(thirdScene.current);
  }, []);

useEffect(() => {
  firstRenderScene.current.environment = environmentMap;
  firstRenderScene.current.background = environmentMap;

  secondRenderScene.current.environment = environmentMap;
  secondRenderScene.current.background = environmentMap;

  thirdRenderScene.current.environment = environmentMap;
  thirdRenderScene.current.background = environmentMap;
}, [environmentMap]);

  useEffect(() => {
    progressionRef.current = 0;
    if (renderMaterial.current) renderMaterial.current.progression = 0;
  }, []);


  useEffect(() => {
    if (mode === prevMode) {
      return;
    }
    renderMaterial.current.progression = 0;
  }, [mode]);

  const MAX_PROGRESS = 2.0;

  // Listen to scroll and update progression
  useEffect(() => {
    const handleScroll = (e) => {
      progressionRef.current += e.deltaY * 0.001 * scrollSpeed;
      progressionRef.current = MathUtils.clamp(progressionRef.current, 0, MAX_PROGRESS);
    };
    window.addEventListener("wheel", handleScroll);
    return () => window.removeEventListener("wheel", handleScroll);
  }, []);

  // console.log("progressionRef", progressionRef);

  useEffect(() => {
    controls.current.camera = renderCamera.current;
    controls.current.setLookAt(
      2.0146,
      2.8228,
      10.5870,
      1.0858,
      1.9366,
      1.7546
    );
  }, []);

  useFrame(({ gl, scene }, delta) => {
    console.log("scene ", scene)
    renderMaterial.current.progression = progressionRef.current;
    // renderMaterial.current.progression = MathUtils.lerp(
    //   renderMaterial.current.progression,
    //   1.0,
    //   delta * transitionSpeed
    // );

    // --------------- Render SceneOne into renderTarget1
    // firstScene.current.visible = true;
    gl.setRenderTarget(renderTarget1);
    gl.clear();
    // gl.render(firstScene.current, renderCamera.current);
    gl.render(firstRenderScene.current, renderCamera.current);

    // --------------- Render SceneTwo into renderTarget2
    // secondScene.current.visible = true;
    // firstScene.current.visible = false; // Hide first scene to avoid rendering it again
    gl.setRenderTarget(renderTarget2);
    gl.clear();
    // gl.render(secondScene.current, renderCamera.current);
    gl.render(secondRenderScene.current, renderCamera.current);
    // secondScene.current.visible = false; // Hide second scene to avoid rendering it again

    // --------------- Third Scene
    // thirdScene.current.visible = true;
    // secondScene.current.visible = false;
    gl.setRenderTarget(renderTarget3);
    gl.clear();
    gl.render(thirdRenderScene.current, renderCamera.current);
    // thirdScene.current.visible = false;

    // Final pass: show FBO1 (or blended tex1/tex2)
    gl.setRenderTarget(null); // Reset render target to default so we can see the result in the canvas.
    // renderMaterial.current.map = renderTarget1.texture;
  });

  return (
    <>
      <PerspectiveCamera near={0.5} ref={renderCamera} />
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
          toneMapped={false}
          //transition={0} // 0 = horizontal, 1 = vertical
        /> */}
      </mesh>

      <group 
        ref={firstScene}
        // visible={sceneGroup === "SceneGroupOne"}
      >
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
        </mesh>
        <SceneOne />
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
