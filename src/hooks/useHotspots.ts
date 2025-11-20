import { useEffect } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'

interface Project {
  id: string
  name: string
  description: string
  position: THREE.Vector3
  logo: string
}

interface Category {
  id: string
  name: string
  projects: Project[]
}

interface UseHotspotsProps {
  sceneRef: React.MutableRefObject<THREE.Scene | null>
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>
  rendererRef: React.MutableRefObject<THREE.WebGLRenderer | null>
  hotspotMeshesRef: React.MutableRefObject<THREE.Mesh[]>
  selectedCategory: string | null
  categories: Category[]
}

export function useHotspots({
  sceneRef,
  cameraRef,
  rendererRef,
  hotspotMeshesRef,
  selectedCategory,
  categories,
}: UseHotspotsProps) {
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current) return

    const scene = sceneRef.current

    // Remove existing hotspots
    hotspotMeshesRef.current.forEach((mesh) => {
      scene.remove(mesh)
      mesh.geometry.dispose()
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((mat) => {
          // Dispose of textures
          if (mat instanceof THREE.MeshBasicMaterial && mat.map) {
            mat.map.dispose()
          }
          mat.dispose()
        })
      } else {
        if (
          mesh.material instanceof THREE.MeshBasicMaterial &&
          mesh.material.map
        ) {
          mesh.material.map.dispose()
        }
        mesh.material.dispose()
      }
    })
    hotspotMeshesRef.current = []

    // Create new hotspots for selected category
    if (selectedCategory) {
      const category = categories.find((cat) => cat.id === selectedCategory)
      if (category) {
        // Dynamically adjust logo size based on number of projects
        const projectCount = category.projects.length
        const baseSize = 0.85
        const sizeMultiplier = Math.max(0.45, Math.min(1, 30 / projectCount))
        const minSize = 0.6
        const maxSize = 1.5
        const clampedWorldSize = THREE.MathUtils.clamp(
          baseSize * sizeMultiplier,
          minSize,
          maxSize,
        )

        category.projects.forEach((project) => {
          // Create plane geometry for the logo
          const geo = new THREE.PlaneGeometry(1, 1)

          // Create material with placeholder color
          const mat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide,
          })

          const mesh = new THREE.Mesh(geo, mat)
          mesh.position.copy(project.position)
          mesh.renderOrder = 1
          mesh.userData = {
            id: project.id,
            name: project.name,
            description: project.description,
          }

          const camera = cameraRef.current
          const distance = camera
            ? camera.position.distanceTo(project.position)
            : 10
          const distanceScale = THREE.MathUtils.clamp(
            THREE.MathUtils.mapLinear(distance, 5, 14, 1.1, 0.85),
            0.85,
            1.2,
          )
          const finalSize = clampedWorldSize * distanceScale
          mesh.scale.set(finalSize, finalSize, finalSize)

          scene.add(mesh)
          hotspotMeshesRef.current.push(mesh)

          // Load the logo texture
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            // Create canvas to add border radius and shadow
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            // Higher resolution for sharper texture
            const resolution = 512
            canvas.width = resolution
            canvas.height = resolution

            // Draw shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
            ctx.shadowBlur = 20
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 4

            // Draw rounded rectangle background
            const radius = resolution * 0.1 // 12px equivalent at this resolution
            const x = resolution * 0.05
            const y = resolution * 0.05
            const width = resolution * 0.9
            const height = resolution * 0.9

            ctx.beginPath()
            ctx.moveTo(x + radius, y)
            ctx.lineTo(x + width - radius, y)
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
            ctx.lineTo(x + width, y + height - radius)
            ctx.quadraticCurveTo(
              x + width,
              y + height,
              x + width - radius,
              y + height,
            )
            ctx.lineTo(x + radius, y + height)
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
            ctx.lineTo(x, y + radius)
            ctx.quadraticCurveTo(x, y, x + radius, y)
            ctx.closePath()

            // Fill with white background (or use alpha for transparency)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
            ctx.fill()

            // Clip to rounded rectangle for the image
            ctx.clip()

            // Reset shadow for image
            ctx.shadowColor = 'transparent'
            ctx.shadowBlur = 0
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0

            // Draw the logo image
            ctx.drawImage(img, x, y, width, height)

            // Create texture from canvas
            const texture = new THREE.CanvasTexture(canvas)
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter
            texture.anisotropy =
              rendererRef.current?.capabilities.getMaxAnisotropy() || 16

            mat.map = texture
            mat.needsUpdate = true
          }
          img.onerror = () => {
            console.warn(`Failed to load logo for ${project.name}`)
          }
          img.src = project.logo

          // Add pulsing animation around the base size
          gsap.to(mesh.scale, {
            x: finalSize * 1.12,
            y: finalSize * 1.12,
            z: finalSize * 1.12,
            yoyo: true,
            repeat: -1,
            duration: 1.5,
            ease: 'sine.inOut',
          })
        })
      }
    }
  }, [
    sceneRef,
    cameraRef,
    rendererRef,
    hotspotMeshesRef,
    selectedCategory,
    categories,
  ])
}
