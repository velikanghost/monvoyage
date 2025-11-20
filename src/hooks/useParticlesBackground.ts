import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { particleVertexShader } from '../shaders/particleVertexShader'
import { particleFragmentShader } from '../shaders/particleFragmentShader'

interface UseParticlesBackgroundProps {
  sceneRef: React.MutableRefObject<THREE.Scene | null>
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>
  rendererRef: React.MutableRefObject<THREE.WebGLRenderer | null>
}

const PARTICLE_COUNT = 50000
const SPREAD = 30

// Color palettes matching Penderecki's Garden aesthetic
const colorPalette = [
  new THREE.Color(0xffffff), // White
  new THREE.Color(0xe8f5e9), // Very light green
  new THREE.Color(0xc8e6c9), // Light green
  new THREE.Color(0xa5d6a7), // Medium light green
  new THREE.Color(0x81c784), // Medium green
  new THREE.Color(0x66bb6a), // Green
  new THREE.Color(0x4caf50), // Darker green
  new THREE.Color(0xb39ddb), // Light purple
  new THREE.Color(0x9575cd), // Medium purple
  new THREE.Color(0x7e57c2), // Purple
  new THREE.Color(0x90caf9), // Light blue
  new THREE.Color(0x64b5f6), // Medium blue
  new THREE.Color(0xe1bee7), // Light pink/purple
  new THREE.Color(0xffccbc), // Light peach
]

// Create density zones for more interesting distribution
function getColorForPosition(_x: number, y: number, _z: number): THREE.Color {
  // Lower region (ground) - greens and earth tones
  if (y < -SPREAD * 0.3) {
    const colors = [
      colorPalette[4], // Medium green
      colorPalette[5], // Green
      colorPalette[6], // Darker green
      colorPalette[9], // Purple
      colorPalette[13], // Light peach
    ]
    return colors[Math.floor(Math.random() * colors.length)].clone()
  }

  // Middle region (trees/structures) - mix of greens and purples
  if (y < SPREAD * 0.2) {
    const colors = [
      colorPalette[2], // Light green
      colorPalette[3], // Medium light green
      colorPalette[4], // Medium green
      colorPalette[7], // Light purple
      colorPalette[8], // Medium purple
      colorPalette[12], // Light pink/purple
    ]
    return colors[Math.floor(Math.random() * colors.length)].clone()
  }

  // Upper region (sky) - whites, light colors, blues
  const colors = [
    colorPalette[0], // White
    colorPalette[1], // Very light green
    colorPalette[2], // Light green
    colorPalette[7], // Light purple
    colorPalette[10], // Light blue
    colorPalette[11], // Medium blue
    colorPalette[12], // Light pink/purple
  ]
  return colors[Math.floor(Math.random() * colors.length)].clone()
}

// Density function - creates clusters and variations
function getDensityMultiplier(x: number, y: number, z: number): number {
  // Create some clusters using noise-like functions
  const cluster1 = Math.sin(x * 0.3) * Math.cos(y * 0.2) * Math.sin(z * 0.25)
  const cluster2 =
    Math.cos(x * 0.4 + 1.5) * Math.sin(y * 0.3 + 2.0) * Math.cos(z * 0.35 + 1.0)

  // Combine clusters
  const density = (cluster1 + cluster2 + 2.0) / 4.0

  // Add vertical gradient - more particles lower down
  const verticalGradient = Math.pow(1.0 - (y + SPREAD) / (SPREAD * 2), 0.5)

  return density * verticalGradient
}

export function useParticlesBackground({
  sceneRef,
  cameraRef,
  rendererRef,
}: UseParticlesBackgroundProps) {
  const particlesRef = useRef<THREE.Points | null>(null)
  const clockRef = useRef(new THREE.Clock())
  const uniformsRef = useRef<any>(null)

  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return

    const scene = sceneRef.current

    // Create particle geometry
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3

      // Generate random position
      let x = (Math.random() - 0.5) * SPREAD * 2
      let y = (Math.random() - 0.5) * SPREAD * 2
      let z = (Math.random() - 0.5) * SPREAD * 2

      // Apply density-based rejection sampling for more interesting distribution
      const densityCheck = getDensityMultiplier(x, y, z)
      if (Math.random() > densityCheck) {
        // Regenerate with bias towards denser areas
        x = (Math.random() - 0.5) * SPREAD * 1.5
        y = (Math.random() - 0.5) * SPREAD * 2 - SPREAD * 0.3 // Bias downward
        z = (Math.random() - 0.5) * SPREAD * 1.5
      }

      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z - 15 // Push back to be behind main content

      // Get color based on position
      const color = getColorForPosition(x, y, z)
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      // Smaller size variation for tiny particles
      const densitySize = getDensityMultiplier(x, y, z)
      sizes[i] = (Math.random() * 0.5 + 0.3) * (0.5 + densitySize * 0.8)
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    // Create shader material
    const uniforms = {
      time: { value: 0 },
    }
    uniformsRef.current = uniforms

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      depthTest: true,
    })

    // Create points
    const particles = new THREE.Points(geometry, material)
    particles.renderOrder = -5 // Render behind hotspots but in front of birds
    particlesRef.current = particles

    scene.add(particles)

    // Animation loop
    let animationFrameId: number | null = null
    const animate = () => {
      if (!particlesRef.current || !uniformsRef.current) {
        animationFrameId = requestAnimationFrame(animate)
        return
      }

      const time = clockRef.current.getElapsedTime()
      uniformsRef.current.time.value = time

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }

      if (particlesRef.current) {
        scene.remove(particlesRef.current)
        particlesRef.current.geometry.dispose()
        if (Array.isArray(particlesRef.current.material)) {
          particlesRef.current.material.forEach((mat) => mat.dispose())
        } else {
          particlesRef.current.material.dispose()
        }
        particlesRef.current = null
      }

      uniformsRef.current = null
    }
  }, [sceneRef, cameraRef, rendererRef])

  return {
    particlesRef,
  }
}
