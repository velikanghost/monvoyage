import { gsap } from 'gsap'
import * as THREE from 'three'

interface UseCategoryNavigationProps {
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>
  materialRef: React.MutableRefObject<THREE.PointsMaterial | null>
  categoryButtonsRef: React.RefObject<HTMLDivElement>
  onCategorySelect: (categoryId: string) => void
  onBackToCategories: () => void
}

export function useCategoryNavigation({
  cameraRef,
  materialRef,
  categoryButtonsRef,
  onCategorySelect,
  onBackToCategories,
}: UseCategoryNavigationProps) {
  const handleCategorySelect = (categoryId: string) => {
    if (
      cameraRef.current &&
      materialRef.current &&
      categoryButtonsRef.current
    ) {
      gsap.to(cameraRef.current.position, {
        z: -3,
        duration: 4,
        ease: 'power2.inOut',
      })
      gsap.to(materialRef.current, { opacity: 0.9, duration: 3 })
      gsap.to(categoryButtonsRef.current, {
        opacity: 0,
        duration: 1,
        pointerEvents: 'none',
      })

      onCategorySelect(categoryId)
    }
  }

  const handleBackToCategories = () => {
    if (
      cameraRef.current &&
      materialRef.current &&
      categoryButtonsRef.current
    ) {
      gsap.to(cameraRef.current.position, {
        z: 8,
        duration: 4,
        ease: 'power2.inOut',
      })
      gsap.to(materialRef.current, { opacity: 0.9, duration: 3 })
      gsap.to(categoryButtonsRef.current, {
        opacity: 1,
        duration: 1,
        pointerEvents: 'all',
      })

      onBackToCategories()
    }
  }

  return {
    handleCategorySelect,
    handleBackToCategories,
  }
}
