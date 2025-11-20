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
  const activeKeysRef = useRef<Set<string>>(new Set())
  const panOffsetRef = useRef(new THREE.Vector2(0, 0))
  const zoomRef = useRef(10)
  const zoomSmoothRef = useRef(10)
  const zoomBoundsRef = useRef({ min: 6.5, max: 13 })
  const baseZoomRef = useRef(10)
  const hasUserZoomedRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    )
    camera.position.set(0, 0, 10)
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

    // Keyboard handlers for panning
    const trackableKeys = new Set([
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
    ])
    const panBounds = { x: 7, y: 5 }
    const panSpeed = 0.15
    const zoomStep = 0.5
    const zoomInKeys = new Set(['=', '+', 'PageUp'])
    const zoomOutKeys = new Set(['-', '_', 'PageDown'])
    const clampZoom = (value: number) =>
      THREE.MathUtils.clamp(
        value,
        zoomBoundsRef.current.min,
        zoomBoundsRef.current.max,
      )

    const handleKeyDown = (e: KeyboardEvent) => {
      if (trackableKeys.has(e.key)) {
        e.preventDefault()
        activeKeysRef.current.add(e.key)
        return
      }

      if (zoomInKeys.has(e.key)) {
        e.preventDefault()
        hasUserZoomedRef.current = true
        zoomRef.current = clampZoom(zoomRef.current - zoomStep)
        return
      }

      if (zoomOutKeys.has(e.key)) {
        e.preventDefault()
        hasUserZoomedRef.current = true
        zoomRef.current = clampZoom(zoomRef.current + zoomStep)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!trackableKeys.has(e.key)) return
      e.preventDefault()
      activeKeysRef.current.delete(e.key)
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY * 0.004
      hasUserZoomedRef.current = true
      zoomRef.current = clampZoom(zoomRef.current + delta)
    }

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)

      camera.position.x += (mouseXRef.current * 0.5 - camera.position.x) * 0.05
      camera.position.y += (-mouseYRef.current * 0.3 - camera.position.y) * 0.05

      const horizontalInput =
        (activeKeysRef.current.has('ArrowRight') ? 1 : 0) -
        (activeKeysRef.current.has('ArrowLeft') ? 1 : 0)
      const verticalInput =
        (activeKeysRef.current.has('ArrowUp') ? 1 : 0) -
        (activeKeysRef.current.has('ArrowDown') ? 1 : 0)

      if (horizontalInput !== 0 || verticalInput !== 0) {
        panOffsetRef.current.x = THREE.MathUtils.clamp(
          panOffsetRef.current.x + horizontalInput * panSpeed,
          -panBounds.x,
          panBounds.x,
        )
        panOffsetRef.current.y = THREE.MathUtils.clamp(
          panOffsetRef.current.y + verticalInput * panSpeed,
          -panBounds.y,
          panBounds.y,
        )
      }

      const targetX = panOffsetRef.current.x + mouseXRef.current * 2
      const targetY = panOffsetRef.current.y + -mouseYRef.current * 1.2

      camera.position.x += (targetX - camera.position.x) * 0.07
      camera.position.y += (targetY - camera.position.y) * 0.07
      if (!hasUserZoomedRef.current) {
        zoomRef.current = camera.position.z
        zoomSmoothRef.current = camera.position.z
      } else {
        zoomSmoothRef.current += (zoomRef.current - zoomSmoothRef.current) * 0.1
      }
      camera.position.z += (zoomSmoothRef.current - camera.position.z) * 0.08

      camera.position.x = THREE.MathUtils.clamp(
        camera.position.x,
        -panBounds.x - 1,
        panBounds.x + 1,
      )
      camera.position.y = THREE.MathUtils.clamp(
        camera.position.y,
        -panBounds.y - 1,
        panBounds.y + 1,
      )

      hotspotMeshesRef.current.forEach((h) => h.lookAt(camera.position))

      renderer.render(scene, camera)
    }
    animate()

    window.addEventListener('click', handleClick)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('wheel', handleWheel, { passive: false })

    // Cleanup
    return () => {
      window.removeEventListener('click', handleClick)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('wheel', handleWheel)
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
    hasUserZoomedRef.current = false

    const baseZoom = selectedCategory ? -3 : 8
    baseZoomRef.current = baseZoom

    const bounds = selectedCategory
      ? { min: baseZoom - 2.5, max: baseZoom + 6 }
      : { min: baseZoom - 5, max: baseZoom + 10 }

    zoomBoundsRef.current = bounds

    const clamped = THREE.MathUtils.clamp(baseZoom, bounds.min, bounds.max)
    zoomRef.current = clamped
    zoomSmoothRef.current = clamped
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
