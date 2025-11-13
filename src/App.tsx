import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useThreeScene } from './hooks/useThreeScene'
import { useNFTs } from './hooks/useNFTs'
import { useHotspots } from './hooks/useHotspots'
import { useSingleNFTBackground } from './hooks/useSingleNFTBackground'
import { useBirdsBackground } from './hooks/useBirdsBackground'
import { useCategoryNavigation } from './hooks/useCategoryNavigation'
import { CategoryButtons } from './components/CategoryButtons'
import { BackButton } from './components/BackButton'
import { Modal } from './components/Modal'
import './App.css'
import ecosystemData from './data/monad_ecosystem.json'

interface Project {
  id: string
  name: string
  slug: string
  project_type: string
  description: string
  categories: string[]
  logo: string
  banner: string
  site_link: string | null
  social_links: string[]
  position: THREE.Vector3
}

interface Category {
  id: string
  name: string
  projects: Project[]
}

// Generate positions in a sphere around the camera
function generatePositions(count: number): THREE.Vector3[] {
  const positions: THREE.Vector3[] = []
  const radius = 6
  const goldenRatio = (1 + Math.sqrt(5)) / 2
  const angleIncrement = Math.PI * 2 * goldenRatio

  for (let i = 0; i < count; i++) {
    const t = i / count
    const inclination = Math.acos(1 - 2 * t)
    const azimuth = angleIncrement * i

    const x = radius * Math.sin(inclination) * Math.cos(azimuth)
    const y = radius * Math.sin(inclination) * Math.sin(azimuth)
    const z = radius * Math.cos(inclination) - 10

    positions.push(new THREE.Vector3(x, y, z))
  }

  return positions
}

// Transform scraped data into categories
const categories: Category[] = ecosystemData.categories.map((categoryName) => {
  const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-')
  const categoryProjects = ecosystemData.projects.filter((proj) =>
    proj.categories.includes(categoryName),
  )

  const positions = generatePositions(categoryProjects.length)

  return {
    id: categoryId,
    name: categoryName,
    projects: categoryProjects.map((proj, index) => ({
      id: proj.slug,
      name: proj.name,
      slug: proj.slug,
      project_type: proj.project_type,
      description: proj.description,
      categories: proj.categories,
      logo: proj.logo,
      banner: proj.banner,
      site_link: proj.site_link,
      social_links: proj.social_links,
      position: positions[index],
    })),
  }
})

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const categoryButtonsRef = useRef<HTMLDivElement>(null)
  const materialRef = useRef<THREE.PointsMaterial | null>(null) // Kept for compatibility

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalData, setModalData] = useState<{
    title: string
    text: string
    logo?: string
    banner?: string
    siteLink?: string | null
    socialLinks?: string[]
  }>({
    title: 'Project',
    text: 'Description goes here.',
  })
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(
    null,
  )

  // Get project data for selected hotspot
  const getProjectData = (hotspotId: string) => {
    for (const category of categories) {
      const project = category.projects.find((p) => p.id === hotspotId)
      if (project) {
        return {
          name: project.name,
          description: project.description,
          logo: project.logo,
          banner: project.banner,
          siteLink: project.site_link,
          socialLinks: project.social_links,
        }
      }
    }
    return null
  }

  // Handle hotspot click
  const handleHotspotClick = useCallback(
    (hotspotId: string) => {
      const projectData = getProjectData(hotspotId)

      if (!projectData) return

      setSelectedHotspotId((prevId) => {
        // If clicking the same hotspot, close the modal
        if (prevId === hotspotId) {
          setModalVisible(false)
          return null
        }
        // Otherwise, show/update the modal
        setModalData({
          title: projectData.name,
          text: projectData.description,
          logo: projectData.logo,
          banner: projectData.banner,
          siteLink: projectData.siteLink,
          socialLinks: projectData.socialLinks,
        })
        setModalVisible(true)
        return hotspotId
      })
    },
    [], // getProjectData doesn't depend on any props/state
  )

  // Three.js scene setup
  const {
    sceneRef,
    cameraRef,
    rendererRef,
    hotspotMeshesRef,
    selectedHotspotIdRef,
    mouseXRef,
    mouseYRef,
  } = useThreeScene({
    containerRef,
    materialRef,
    selectedCategory,
    onHotspotClick: handleHotspotClick,
  })

  // Birds flocking background
  useBirdsBackground({
    sceneRef,
    cameraRef,
    rendererRef,
    mouseXRef,
    mouseYRef,
  })

  // NFT loading and management
  const { nftSvg } = useNFTs()

  // Hotspot management
  useHotspots({
    sceneRef,
    cameraRef,
    hotspotMeshesRef,
    selectedCategory,
    categories,
  })

  // Single NFT background rendering
  useSingleNFTBackground({
    sceneRef,
    cameraRef,
    selectedCategory,
    nftSvg,
  })

  // Category navigation
  const { handleCategorySelect, handleBackToCategories } =
    useCategoryNavigation({
      cameraRef,
      materialRef, // Still needed for category navigation transitions
      categoryButtonsRef,
      onCategorySelect: (categoryId: string) => {
        setSelectedCategory(categoryId)
        setModalVisible(false)
        setSelectedHotspotId(null)
        selectedHotspotIdRef.current = null
      },
      onBackToCategories: () => {
        setSelectedCategory(null)
        setModalVisible(false)
        setSelectedHotspotId(null)
        selectedHotspotIdRef.current = null
      },
    })

  // Update refs when state changes
  useEffect(() => {
    if (selectedHotspotIdRef) {
      selectedHotspotIdRef.current = selectedHotspotId
    }
  }, [selectedHotspotId, selectedHotspotIdRef])

  return (
    <>
      <div ref={containerRef} />
      <CategoryButtons
        ref={categoryButtonsRef}
        categories={categories}
        onSelect={handleCategorySelect}
      />
      {selectedCategory && <BackButton onClick={handleBackToCategories} />}
      <Modal
        visible={modalVisible}
        title={modalData.title}
        text={modalData.text}
        logo={modalData.logo}
        banner={modalData.banner}
        siteLink={modalData.siteLink}
        socialLinks={modalData.socialLinks}
        onClose={() => {
          setModalVisible(false)
          setSelectedHotspotId(null)
          if (selectedHotspotIdRef) {
            selectedHotspotIdRef.current = null
          }
        }}
      />
    </>
  )
}

export default App
