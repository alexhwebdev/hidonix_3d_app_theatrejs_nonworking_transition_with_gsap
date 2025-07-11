'use client'

import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import vertex from './shaders/vertex.glsl.js'
import fragment from './shaders/fragment.glsl.js'

function extractSVGPoints(selector = '.cls-1', spacing = 3) {
  const elements = document.querySelectorAll(selector)
  const lines = []
  // console.log('document ', document)

  elements.forEach(path => {
    const len = path.getTotalLength()
    const numPoints = Math.floor(len / spacing)  // spacing parameter controls the density of the points.
    const points = []

    for (let i = 0; i < numPoints; i++) {
      const pt = path.getPointAtLength((len * i) / numPoints)
      // points.push(new THREE.Vector3(pt.x - 1024, pt.y - 512, 0))
      // const scale = 0.0005; // adjust as needed
      points.push(new THREE.Vector3((pt.x - 100), -(pt.y - 100), 0))

    }

    lines.push({
      points,
      currentPos: 0,
      number: numPoints,
      speed: 0.5
    })
  })
  // console.log('lines ', lines)
  return lines;
}


export default function ParticlePathAnimation({ scale = 0.009, position = [0, 0, 0], globalOpacity = 1 }) {
  const geometryRef = useRef()
  const materialRef = useRef()
  const [positions] = useState(() => new Float32Array(1000 * 3))
  const [opacity] = useState(() => new Float32Array(1000))
  const [lines, setLines] = useState([])

  useEffect(() => {
    const svgLines = extractSVGPoints()
    setLines(svgLines)
  }, [])

  useEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometryRef.current.setAttribute('opacity', new THREE.BufferAttribute(opacity, 1))
    }
  }, [])

  useFrame(() => {
    let j = 0

    lines.forEach(line => {
      line.currentPos += line.speed
      line.currentPos %= line.number

      for (let i = 0; i < 150; i++) {
        const idx = (line.currentPos + i) % line.number
        const p = line.points[idx]
        if (!p) continue

        positions.set([p.x, p.y, p.z], j * 3)
        opacity[j] = i / 100
        j++
      }
    })

    if (
      geometryRef.current &&
      geometryRef.current.attributes.position &&
      geometryRef.current.attributes.opacity
    ) {
      geometryRef.current.attributes.position.needsUpdate = true
      geometryRef.current.attributes.opacity.needsUpdate = true
    }

    if (materialRef.current) {
      materialRef.current.uniforms.time.value += 0.1
      materialRef.current.uniforms.uOpacity.value = globalOpacity // 🔥 update uniform here
    }
  })

  return (
    <group scale={[scale, scale, scale]} position={position}>
      <points>
        <bufferGeometry ref={geometryRef} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertex}
          fragmentShader={fragment}
          uniforms={{ 
            time: { value: 0 },
            uOpacity: { value: globalOpacity } // 👈 initial value
          }}
          transparent
          depthWrite
          depthTest
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
