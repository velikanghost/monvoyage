import { useEffect } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'

interface Project {
  id: string
  name: string
  description: string
  position: THREE.Vector3
}

interface Category {
  id: string
  name: string
  projects: Project[]
}

interface UseHotspotsProps {
  sceneRef: React.MutableRefObject<THREE.Scene | null>
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>
  hotspotMeshesRef: React.MutableRefObject<THREE.Mesh[]>
  selectedCategory: string | null
  categories: Category[]
}

export function useHotspots({
  sceneRef,
  cameraRef,
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
        mesh.material.forEach((mat) => mat.dispose())
      } else {
        mesh.material.dispose()
      }
    })
    hotspotMeshesRef.current = []

    // Create new hotspots for selected category
    if (selectedCategory) {
      const category = categories.find((cat) => cat.id === selectedCategory)
      if (category) {
        const hotspotMat = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
        })

        category.projects.forEach((project) => {
          const geo = new THREE.SphereGeometry(0.2, 32, 32)
          const mesh = new THREE.Mesh(geo, hotspotMat.clone())
          mesh.position.copy(project.position)
          mesh.renderOrder = 1
          mesh.userData = {
            id: project.id,
            name: project.name,
            description: project.description,
          }
          scene.add(mesh)
          hotspotMeshesRef.current.push(mesh)

          gsap.to(mesh.scale, {
            x: 1.3,
            y: 1.3,
            z: 1.3,
            yoyo: true,
            repeat: -1,
            duration: 1.5,
            ease: 'sine.inOut',
          })
        })
      }
    }
  }, [sceneRef, cameraRef, hotspotMeshesRef, selectedCategory, categories])
}
