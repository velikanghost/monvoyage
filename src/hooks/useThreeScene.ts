import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface UseThreeSceneProps {
  containerRef: React.RefObject<HTMLDivElement>
  materialRef: React.MutableRefObject<THREE.PointsMaterial | null>
  selectedCategory: string | null
  onHotspotClick?: (hotspotId: string) => void
  backgroundColor?: number
}

export function useThreeScene({
  containerRef,
  materialRef,
  selectedCategory,
  onHotspotClick,
  backgroundColor = 0x0b0a0f,
}: UseThreeSceneProps) {
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const hotspotMeshesRef = useRef<THREE.Mesh[]>([])
  const raycasterRef = useRef<THREE.Raycaster | null>(null)
  const mouseRef = useRef(new THREE.Vector2())
  const mouseXRef = useRef(0)
  const mouseYRef = useRef(0)
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
    renderer.setClearColor(backgroundColor)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

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

      camera.position.x += (mouseXRef.current * 0.5 - camera.position.x) * 0.05
      camera.position.y += (-mouseYRef.current * 0.3 - camera.position.y) * 0.05

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

  // Update background color when it changes (without recreating the scene)
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setClearColor(backgroundColor)
    }
  }, [backgroundColor])

  useEffect(() => {
    selectedCategoryRef.current = selectedCategory
  }, [selectedCategory])

  return {
    sceneRef,
    cameraRef,
    rendererRef,
    hotspotMeshesRef,
    selectedHotspotIdRef,
    mouseXRef,
    mouseYRef,
  }
}
