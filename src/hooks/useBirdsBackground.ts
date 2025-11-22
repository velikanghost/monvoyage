import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'
import { birdPositionShader } from '../shaders/birdPositionShader'
import { birdVelocityShader } from '../shaders/birdVelocityShader'
import { birdVertexShader } from '../shaders/birdVertexShader'
import { birdFragmentShader } from '../shaders/birdFragmentShader'

interface UseBirdsBackgroundProps {
  sceneRef: React.MutableRefObject<THREE.Scene | null>
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>
  rendererRef: React.MutableRefObject<THREE.WebGLRenderer | null>
  mouseXRef: React.MutableRefObject<number>
  mouseYRef: React.MutableRefObject<number>
}

const WIDTH = 22
const BIRDS = WIDTH * WIDTH
const BOUNDS = 800
const BOUNDS_HALF = BOUNDS / 2

// Custom Geometry - using 3 triangles each
class BirdGeometry extends THREE.BufferGeometry {
  constructor() {
    super()

    const trianglesPerBird = 3
    const triangles = BIRDS * trianglesPerBird
    const points = triangles * 3

    const vertices = new THREE.BufferAttribute(new Float32Array(points * 3), 3)
    const birdColors = new THREE.BufferAttribute(
      new Float32Array(points * 3),
      3,
    )
    const references = new THREE.BufferAttribute(
      new Float32Array(points * 2),
      2,
    )
    const birdVertex = new THREE.BufferAttribute(new Float32Array(points), 1)

    this.setAttribute('position', vertices)
    this.setAttribute('birdColor', birdColors)
    this.setAttribute('reference', references)
    this.setAttribute('birdVertex', birdVertex)

    let v = 0

    function verts_push(...args: number[]) {
      for (let i = 0; i < args.length; i++) {
        vertices.array[v++] = args[i]
      }
    }

    const wingsSpan = 10

    for (let f = 0; f < BIRDS; f++) {
      // Body
      verts_push(0, -0, -15, 0, 4, -15, 0, 0, 30)

      // Wings
      verts_push(0, 0, -10, -wingsSpan, 0, 0, 0, 0, 10)

      verts_push(0, 0, 10, wingsSpan, 0, 0, 0, 0, -10)
    }

    for (let v = 0; v < triangles * 3; v++) {
      const triangleIndex = ~~(v / 3)
      const birdIndex = ~~(triangleIndex / trianglesPerBird)
      const x = (birdIndex % WIDTH) / WIDTH
      const y = ~~(birdIndex / WIDTH) / WIDTH

      const c = new THREE.Color(0x666666 + (~~(v / 9) / BIRDS) * 0x666666)

      birdColors.array[v * 3 + 0] = c.r
      birdColors.array[v * 3 + 1] = c.g
      birdColors.array[v * 3 + 2] = c.b

      references.array[v * 2] = x
      references.array[v * 2 + 1] = y

      birdVertex.array[v] = v % 9
    }

    this.scale(0.1, 0.1, 0.1)
  }
}

export function useBirdsBackground({
  sceneRef,
  cameraRef,
  rendererRef,
  mouseXRef,
  mouseYRef,
}: UseBirdsBackgroundProps) {
  const gpuComputeRef = useRef<GPUComputationRenderer | null>(null)
  const velocityVariableRef = useRef<any>(null)
  const positionVariableRef = useRef<any>(null)
  const positionUniformsRef = useRef<any>(null)
  const velocityUniformsRef = useRef<any>(null)
  const birdUniformsRef = useRef<any>(null)
  const birdMeshRef = useRef<THREE.Mesh | null>(null)
  const clockRef = useRef(new THREE.Clock())
  const lastTimeRef = useRef(performance.now())

  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return

    const scene = sceneRef.current
    const renderer = rendererRef.current

    // Initialize GPU Computation Renderer
    const gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer)

    if (!gpuCompute) {
      console.error('GPU Computation Renderer not supported')
      return
    }

    gpuComputeRef.current = gpuCompute

    const dtPosition = gpuCompute.createTexture()
    const dtVelocity = gpuCompute.createTexture()
    fillPositionTexture(dtPosition)
    fillVelocityTexture(dtVelocity)

    const velocityVariable = gpuCompute.addVariable(
      'textureVelocity',
      birdVelocityShader,
      dtVelocity,
    )
    const positionVariable = gpuCompute.addVariable(
      'texturePosition',
      birdPositionShader,
      dtPosition,
    )

    velocityVariableRef.current = velocityVariable
    positionVariableRef.current = positionVariable

    gpuCompute.setVariableDependencies(velocityVariable, [
      positionVariable,
      velocityVariable,
    ])
    gpuCompute.setVariableDependencies(positionVariable, [
      positionVariable,
      velocityVariable,
    ])

    const positionUniforms = positionVariable.material.uniforms
    const velocityUniforms = velocityVariable.material.uniforms

    positionUniformsRef.current = positionUniforms
    velocityUniformsRef.current = velocityUniforms

    positionUniforms['time'] = { value: 0.0 }
    positionUniforms['delta'] = { value: 0.0 }
    velocityUniforms['time'] = { value: 1.0 }
    velocityUniforms['delta'] = { value: 0.0 }
    velocityUniforms['testing'] = { value: 1.0 }
    velocityUniforms['separationDistance'] = { value: 20.0 }
    velocityUniforms['alignmentDistance'] = { value: 20.0 }
    velocityUniforms['cohesionDistance'] = { value: 20.0 }
    velocityUniforms['freedomFactor'] = { value: 0.75 }
    velocityUniforms['predator'] = { value: new THREE.Vector3() }
    velocityVariable.material.defines.BOUNDS = BOUNDS.toFixed(2)

    velocityVariable.wrapS = THREE.RepeatWrapping
    velocityVariable.wrapT = THREE.RepeatWrapping
    positionVariable.wrapS = THREE.RepeatWrapping
    positionVariable.wrapT = THREE.RepeatWrapping

    const error = gpuCompute.init()

    if (error !== null) {
      console.error('GPU Computation Renderer error:', error)
      return
    }

    // Create bird geometry and material
    const geometry = new BirdGeometry()

    const birdUniforms = {
      color: { value: new THREE.Color(0x836ef9) },
      texturePosition: { value: null },
      textureVelocity: { value: null },
      time: { value: 1.0 },
      delta: { value: 0.0 },
    }

    birdUniformsRef.current = birdUniforms

    const material = new THREE.ShaderMaterial({
      uniforms: birdUniforms,
      vertexShader: birdVertexShader,
      fragmentShader: birdFragmentShader,
      side: THREE.DoubleSide,
    })

    const birdMesh = new THREE.Mesh(geometry, material)
    birdMesh.rotation.y = Math.PI / 2
    birdMesh.matrixAutoUpdate = false
    birdMesh.updateMatrix()
    birdMesh.renderOrder = -15 // Render far behind everything to emphasize background role
    birdMeshRef.current = birdMesh

    scene.add(birdMesh)

    // Animation loop - update birds each frame
    let animationFrameId: number | null = null
    const animate = () => {
      const gpuCompute = gpuComputeRef.current
      if (!gpuCompute || !birdMeshRef.current) {
        animationFrameId = requestAnimationFrame(animate)
        return
      }

      const now = performance.now()
      let delta = (now - lastTimeRef.current) / 1000

      if (delta > 1) delta = 1 // safety cap
      lastTimeRef.current = now

      const time = clockRef.current.getElapsedTime()

      if (positionUniformsRef.current) {
        positionUniformsRef.current['time'].value = time
        positionUniformsRef.current['delta'].value = delta
      }

      if (velocityUniformsRef.current) {
        velocityUniformsRef.current['time'].value = time
        velocityUniformsRef.current['delta'].value = delta

        // Update predator position from mouse
        // mouseXRef and mouseYRef are already in -1 to 1 range
        velocityUniformsRef.current['predator'].value.set(
          mouseXRef.current * 0.5,
          mouseYRef.current * 0.5,
          0,
        )
      }

      if (birdUniformsRef.current) {
        birdUniformsRef.current['time'].value = time
        birdUniformsRef.current['delta'].value = delta
      }

      // Compute new positions and velocities on GPU
      gpuCompute.compute()

      // Update bird mesh textures
      if (
        birdUniformsRef.current &&
        positionVariableRef.current &&
        velocityVariableRef.current
      ) {
        birdUniformsRef.current['texturePosition'].value =
          gpuCompute.getCurrentRenderTarget(positionVariableRef.current).texture
        birdUniformsRef.current['textureVelocity'].value =
          gpuCompute.getCurrentRenderTarget(velocityVariableRef.current).texture
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    // Start animation
    animationFrameId = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }

      if (birdMeshRef.current) {
        scene.remove(birdMeshRef.current)
        birdMeshRef.current.geometry.dispose()
        if (Array.isArray(birdMeshRef.current.material)) {
          birdMeshRef.current.material.forEach((mat) => mat.dispose())
        } else {
          birdMeshRef.current.material.dispose()
        }
        birdMeshRef.current = null
      }

      // Clean up GPU compute resources
      if (gpuComputeRef.current) {
        // Dispose of render targets
        const gpuCompute = gpuComputeRef.current
        if (positionVariableRef.current) {
          const posRT = gpuCompute.getCurrentRenderTarget(
            positionVariableRef.current,
          )
          if (posRT) posRT.dispose()
        }
        if (velocityVariableRef.current) {
          const velRT = gpuCompute.getCurrentRenderTarget(
            velocityVariableRef.current,
          )
          if (velRT) velRT.dispose()
        }
        gpuComputeRef.current = null
      }

      // Clear refs
      velocityVariableRef.current = null
      positionVariableRef.current = null
      positionUniformsRef.current = null
      velocityUniformsRef.current = null
      birdUniformsRef.current = null
    }
  }, [sceneRef, cameraRef, rendererRef, mouseXRef, mouseYRef])

  return {
    birdMeshRef,
  }
}

function fillPositionTexture(texture: THREE.DataTexture) {
  const theArray = texture.image.data

  if (!theArray) {
    console.error('Position texture data is null')
    return
  }

  for (let k = 0, kl = theArray.length; k < kl; k += 4) {
    const x = Math.random() * BOUNDS - BOUNDS_HALF
    const y = Math.random() * BOUNDS - BOUNDS_HALF
    const z = Math.random() * BOUNDS - BOUNDS_HALF

    theArray[k + 0] = x
    theArray[k + 1] = y
    theArray[k + 2] = z
    theArray[k + 3] = 1
  }
}

function fillVelocityTexture(texture: THREE.DataTexture) {
  const theArray = texture.image.data

  if (!theArray) {
    console.error('Velocity texture data is null')
    return
  }

  for (let k = 0, kl = theArray.length; k < kl; k += 4) {
    const x = Math.random() - 0.5
    const y = Math.random() - 0.5
    const z = Math.random() - 0.5

    theArray[k + 0] = x * 10
    theArray[k + 1] = y * 10
    theArray[k + 2] = z * 10
    theArray[k + 3] = 1
  }
}
