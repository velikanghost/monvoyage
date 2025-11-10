import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface UseSingleNFTBackgroundProps {
  sceneRef: React.MutableRefObject<THREE.Scene | null>
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>
  selectedCategory: string | null
  nftSvg: string | null
}

export function useSingleNFTBackground({
  sceneRef,
  cameraRef,
  selectedCategory,
  nftSvg,
}: UseSingleNFTBackgroundProps) {
  const planeRef = useRef<THREE.Mesh | null>(null)
  const textureRef = useRef<THREE.Texture | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const animationStartRef = useRef<number>(0)

  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current) return

    const scene = sceneRef.current
    const camera = cameraRef.current

    const stopAnimation = () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }

    const cleanupPlane = () => {
      stopAnimation()
      if (planeRef.current) {
        scene.remove(planeRef.current)
        planeRef.current.geometry.dispose()
        if (Array.isArray(planeRef.current.material)) {
          planeRef.current.material.forEach((mat) => mat.dispose())
        } else {
          planeRef.current.material.dispose()
        }
        planeRef.current = null
      }

      if (textureRef.current) {
        textureRef.current.dispose()
        textureRef.current = null
      }
    }

    if (!selectedCategory || !nftSvg) {
      cleanupPlane()
      return
    }

    cleanupPlane()

    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(nftSvg, 'image/svg+xml')
    const svgElement = svgDoc.documentElement

    const rects = svgElement.querySelectorAll('rect')
    rects.forEach((rect) => {
      const fill = rect.getAttribute('fill')
      if (fill?.includes('url(#bg)')) {
        rect.remove()
      }
    })

    const serializer = new XMLSerializer()
    const modifiedSvg = serializer.serializeToString(svgElement)

    const img = new Image()
    const svgBlob = new Blob([modifiedSvg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width || 800
      canvas.height = img.height || 800
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        URL.revokeObjectURL(url)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true
      textureRef.current = texture

      const aspectRatio = canvas.width / canvas.height || 1
      const planeHeight = 6 // world units
      const planeWidth = planeHeight * aspectRatio

      const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight)
      const planeMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        alphaTest: 0.05,
        depthTest: false,
        depthWrite: false,
      })

      const plane = new THREE.Mesh(planeGeometry, planeMaterial)
      plane.renderOrder = -2
      scene.add(plane)
      planeRef.current = plane

      animationStartRef.current = performance.now()
      const baseZ = -9
      const animate = () => {
        if (!planeRef.current) return
        const elapsedSeconds =
          (performance.now() - animationStartRef.current) / 1000

        const xRadius = 1.6
        const yRadius = 1.1
        const zOffset = 0.6

        plane.position.x = Math.cos(elapsedSeconds * 0.45) * xRadius
        plane.position.y = Math.sin(elapsedSeconds * 0.65) * yRadius
        plane.position.z = baseZ + Math.sin(elapsedSeconds * 0.3) * zOffset
        plane.rotation.z = Math.sin(elapsedSeconds * 0.4) * 0.12

        if (camera) {
          plane.lookAt(camera.position)
        }

        animationFrameRef.current = requestAnimationFrame(animate)
      }

      animationFrameRef.current = requestAnimationFrame(animate)

      URL.revokeObjectURL(url)
    }

    img.onerror = () => {
      console.error('Error loading SVG image for NFT background')
      URL.revokeObjectURL(url)
    }

    img.src = url

    return () => {
      stopAnimation()
      cleanupPlane()
    }
  }, [sceneRef, cameraRef, selectedCategory, nftSvg])
}
