/**
 * BodyHologram3D — 3D body for LIFE OPS Biometric Console.
 *
 * PLAN (this file):
 * - Load GLTF body.glb; center model at origin; override all materials to single grey-blue.
 * - Scale model by MODEL_SCALE (~5×); run fit-camera once after load so full body is in frame (no clipping).
 * - Camera near/far and position computed from model Box3; aspect/resize handled by Canvas.
 *
 * TUNING KNOBS at bottom.
 */

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL_SCALE = 5
const CAMERA_FOV = 38
const CAMERA_DISTANCE_MULT = 1.15

const GREY_BLUE_COLOR = '#7b8fa6'
const GREY_BLUE_EMISSIVE = '#1b2633'
const EMISSIVE_INTENSITY = 0.25
const METALNESS = 0.2
const ROUGHNESS = 0.55

const ROT_Y = Math.PI
const BREATH_MIN = 1.0
const BREATH_MAX = 1.02

function ClearAlpha() {
  const { gl } = useThree()
  gl.setClearColor(0x000000, 0)
  return null
}

function fitCameraToObject(camera, group, fovDeg, distanceMult) {
  if (!group) return
  group.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(group)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const center = box.getCenter(new THREE.Vector3())

  camera.near = maxDim / 100
  camera.far = maxDim * 100
  const fovRad = (fovDeg * Math.PI) / 180
  const distance = (maxDim / 2) / Math.tan(fovRad / 2)
  camera.position.set(center.x, center.y + maxDim * 0.15, center.z + distance * distanceMult)
  camera.lookAt(center.x, center.y, center.z)
  camera.updateProjectionMatrix()
}

function BodyModel() {
  const groupRef = useRef(null)
  const { scene } = useGLTF('/models/lifeops/body.glb')
  const { camera, invalidate } = useThree()
  const fitted = useRef(false)

  const clone = useMemo(() => {
    const c = scene.clone()
    const box = new THREE.Box3().setFromObject(c)
    const center = new THREE.Vector3()
    box.getCenter(center)
    c.position.sub(center)

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(GREY_BLUE_COLOR),
      emissive: new THREE.Color(GREY_BLUE_EMISSIVE),
      emissiveIntensity: EMISSIVE_INTENSITY,
      metalness: METALNESS,
      roughness: ROUGHNESS,
      side: THREE.DoubleSide,
    })
    c.traverse((node) => {
      if (node.isMesh) node.material = material
    })
    return c
  }, [scene])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.rotation.y = ROT_Y + 0.012 * Math.sin(t * 0.5)
    const breath = BREATH_MIN + (BREATH_MAX - BREATH_MIN) * (0.5 + 0.5 * Math.sin(t * 0.9))
    groupRef.current.scale.setScalar(MODEL_SCALE * breath)

    if (!fitted.current) {
      fitted.current = true
      fitCameraToObject(camera, groupRef.current, CAMERA_FOV, CAMERA_DISTANCE_MULT)
      invalidate()
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={clone} />
    </group>
  )
}

useGLTF.preload('/models/lifeops/body.glb')

export default function BodyHologram3D() {
  return (
    <Canvas
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: CAMERA_FOV, near: 0.01, far: 1000 }}
      dpr={[1, 2]}
      style={{ display: 'block', width: '100%', height: '100%', background: 'transparent' }}
      onCreated={({ gl }) => gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))}
    >
      <ClearAlpha />
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 2, 3]} intensity={0.6} />
      <BodyModel />
    </Canvas>
  )
}

/*
 * TUNING KNOBS
 * ------------
 * MODEL_SCALE          = 5      (body size multiplier; increase for larger on screen)
 * CAMERA_FOV           = 38     (degrees; higher = more vertical coverage)
 * CAMERA_DISTANCE_MULT = 1.15   (camera distance multiplier; higher = more margin, smaller body)
 */
