"use client";

import React, { useEffect, useMemo } from 'react'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import * as THREE from 'three'

export default function SceneOne({ 
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [0.1, 0.1, 0.1]
}) {
  // Load Draco-compressed GLB using GLTFLoader with DRACOLoader
  const gltf = useLoader(GLTFLoader, '/models/vallourec_stadium_draco.glb', (loader) => {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/') // assumes draco files are in public/draco/
    loader.setDRACOLoader(dracoLoader)
  })

  const meshes = useMemo(() => {
    const found = []
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        found.push(child)
      }
    })
    return found
  }, [gltf])

  const { scene: modernStadiumScene } = useGLTF("/models/vallourec_stadium_draco.glb");

  return (
    <>
      {/* <OrbitControls /> */}
      <ambientLight intensity={0.05} />

      {/* SHOWS PILLARS */}
      <primitive 
        // object={gltf.scene} 
        object={modernStadiumScene} 
        // rotation-y={Math.PI / 2} 
        position={[0, 0, -20]}
        rotation={[0.2, 0, 0]}
        // position={position}
        // rotation={rotation}
      />

      <group position={position} scale={scale}>
        {meshes.map((mesh, i) => (
          <group key={i}>
            {/* NO PILLARS */}
            {/* <mesh
              geometry={mesh.geometry}
              position={mesh.position}
              rotation={mesh.rotation}
              scale={mesh.scale}
            >
              <meshStandardMaterial
                color="black"
                envMapIntensity={1}
                metalness={0.5}
                roughness={0.9}
                // transparent
                // wireframe={true}
              />
            </mesh> */}
          </group>
        ))}
      </group>
    </>
  )
}
useGLTF.preload('/models/vallourec_stadium_draco.glb')
