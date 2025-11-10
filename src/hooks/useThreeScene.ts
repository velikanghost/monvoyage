import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface UseThreeSceneProps {
  containerRef: React.RefObject<HTMLDivElement>
  materialRef: React.MutableRefObject<THREE.PointsMaterial | null>
  selectedCategory: string | null
  onHotspotClick?: (hotspotId: string) => void
}

export function useThreeScene({
  containerRef,
  materialRef,
  selectedCategory,
  onHotspotClick,
}: UseThreeSceneProps) {
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const pointsRef = useRef<THREE.Points | null>(null)
  const geometryRef = useRef<THREE.BufferGeometry | null>(null)
  const hotspotMeshesRef = useRef<THREE.Mesh[]>([])
  const raycasterRef = useRef<THREE.Raycaster | null>(null)
  const mouseRef = useRef(new THREE.Vector2())
  const mouseXRef = useRef(0)
  const mouseYRef = useRef(0)
  const clockRef = useRef(new THREE.Clock())
  const animationFrameRef = useRef<number | null>(null)
  const selectedHotspotIdRef = useRef<string | null>(null)
  const selectedCategoryRef = useRef<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    )
    camera.position.set(0, 0, 8)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x0b0a0f)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Point cloud background with exclusion zone
    const count = 12000
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const color = new THREE.Color()

    const exclusionRadius = 0.12
    let particleCount = 0
    let attempts = 0
    const maxAttempts = count * 10

    while (particleCount < count && attempts < maxAttempts) {
      attempts++
      const x = (Math.random() - 0.5) * 20
      const y = (Math.random() - 0.5) * 10
      const z = (Math.random() - 0.5) * 20

      const distanceFromCenter = Math.sqrt(x * x + y * y)
      if (distanceFromCenter < exclusionRadius) {
        continue
      }

      const i3 = particleCount * 3
      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z
      color.setHSL(0.35 + z / 50, 0.6, 0.5 + z / 80)
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
      particleCount++
    }

    const actualPositions = new Float32Array(particleCount * 3)
    const actualColors = new Float32Array(particleCount * 3)
    actualPositions.set(positions.subarray(0, particleCount * 3))
    actualColors.set(colors.subarray(0, particleCount * 3))

    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(actualPositions, 3),
    )
    geometry.setAttribute('color', new THREE.BufferAttribute(actualColors, 3))
    geometryRef.current = geometry

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    })
    materialRef.current = material

    const points = new THREE.Points(geometry, material)
    points.renderOrder = 0
    scene.add(points)
    pointsRef.current = points

    // Raycaster
    const raycaster = new THREE.Raycaster()
    raycasterRef.current = raycaster

    // Click handler
    const handleClick = (e: MouseEvent) => {
      if (!selectedCategoryRef.current) return
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(mouseRef.current, camera)
      const intersects = raycaster.intersectObjects(hotspotMeshesRef.current)
      if (intersects.length > 0 && onHotspotClick) {
        const clickedMesh = intersects[0].object
        const data = clickedMesh.userData as {
          id: string
          name: string
          description: string
        }
        onHotspotClick(data.id)
      }
    }

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(mouseRef.current, camera)
      const intersects = raycaster.intersectObjects(hotspotMeshesRef.current)
      document.body.style.cursor =
        selectedCategory && intersects.length > 0 ? 'pointer' : 'default'

      mouseXRef.current = (e.clientX / window.innerWidth - 0.5) * 2
      mouseYRef.current = (e.clientY / window.innerHeight - 0.5) * 2
    }

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      const t = clockRef.current.getElapsedTime()
      const pos = geometry.attributes.position.array as Float32Array
      const actualCount = pos.length / 3
      for (let i = 0; i < actualCount; i++) {
        const i3 = i * 3
        pos[i3 + 1] += Math.sin(t * 0.5 + pos[i3] * 0.3) * 0.0005
      }
      geometry.attributes.position.needsUpdate = true

      camera.position.x += (mouseXRef.current * 0.5 - camera.position.x) * 0.05
      camera.position.y += (-mouseYRef.current * 0.3 - camera.position.y) * 0.05
      points.rotation.y += 0.0006

      hotspotMeshesRef.current.forEach((h) => h.lookAt(camera.position))

      renderer.render(scene, camera)
    }
    animate()

    window.addEventListener('click', handleClick)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('click', handleClick)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      hotspotMeshesRef.current.forEach((mesh) => {
        mesh.geometry.dispose()
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => mat.dispose())
        } else {
          mesh.material.dispose()
        }
      })
    }
  }, [containerRef, materialRef, onHotspotClick])

  useEffect(() => {
    selectedCategoryRef.current = selectedCategory
  }, [selectedCategory])

  return {
    sceneRef,
    cameraRef,
    rendererRef,
    pointsRef,
    geometryRef,
    hotspotMeshesRef,
    selectedHotspotIdRef,
  }
}
