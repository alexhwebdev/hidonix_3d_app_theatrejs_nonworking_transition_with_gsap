"use client";

import React, { useEffect, useMemo } from 'react'
import { Environment, OrbitControls, useGLTF } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import * as THREE from 'three'

import ParticlesHoverPlane from './ParticlesHoverPlane/ParticlesHoverPlane'

export default function SceneOne({ 
  camera,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [0.3, 0.3, 0.3]
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

      <ambientLight intensity={10.5} />

      
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={0.2} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* SHOWS PILLARS */}
      {/* <group position={position} scale={scale}>
        <primitive 
          object={modernStadiumScene}
          // rotation-y={Math.PI / 2} 
          // position={[0, 0, -20]}
          // rotation={[0.2, 0, 0]}
          position={position}
          rotation={rotation}
        />
      </group> */}
      <ParticlesHoverPlane  
        camera={camera}
        width={50}
        height={50}
        segments={500}
        liftRadius={3}
        liftStrength={1.0}
        // position={[0, -2, 0]}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        // rotation={[0, 0, 0]}
      />


      {/* NO PILLARS */}
      <group position={position} scale={scale}>
        {meshes.map((mesh, i) => (
          <group key={i}>
            <mesh
              geometry={mesh.geometry}
              position={mesh.position}
              rotation={mesh.rotation}
              scale={mesh.scale}
            >
              <meshStandardMaterial
                color="teal"
                envMapIntensity={1}
                metalness={0.5}
                roughness={0.9}
                // transparent
                // wireframe={true}
              />
            </mesh>
          </group>
        ))}
      </group>
    </>
  )
}
useGLTF.preload('/models/vallourec_stadium_draco.glb')
