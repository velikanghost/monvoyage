import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useThreeScene } from './hooks/useThreeScene'
import { useNFTs } from './hooks/useNFTs'
import { useHotspots } from './hooks/useHotspots'
import { useSingleNFTBackground } from './hooks/useSingleNFTBackground'
import { useBirdsBackground } from './hooks/useBirdsBackground'
import { useParticlesBackground } from './hooks/useParticlesBackground'
import { useCategoryNavigation } from './hooks/useCategoryNavigation'
import { CategoryButtons } from './components/CategoryButtons'
import { Modal } from './components/Modal'
import { Navbar } from './components/Navbar'
import { ControlsHint } from './components/ControlsHint'
import { ProjectTooltip } from './components/ProjectTooltip'
import { useThemeStore, themeColors } from './stores/themeStore'
import {
  generateEcoCategories,
  type Network,
} from './services/generateEcoCategories'
import {
  loadNetworkProjects,
  type Project as LoadedProject,
} from './utils/loadProjectData'
import './App.css'

interface Project {
  id: string
  name: string
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

function relaxPositions(
  positions: THREE.Vector3[],
  {
    minDistance = 1.4,
    iterations = 4,
    maxHorizontalSpread = 6,
    depthBounds = { min: -12, max: -7 },
  }: {
    minDistance?: number
    iterations?: number
    maxHorizontalSpread?: number
    depthBounds?: { min: number; max: number }
  },
) {
  for (let iteration = 0; iteration < iterations; iteration++) {
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dir = positions[i].clone().sub(positions[j])
        const distance = dir.length()
        if (distance < minDistance && distance > 0) {
          const push = (minDistance - distance) / 2
          dir.normalize()
          positions[i].addScaledVector(dir, push)
          positions[j].addScaledVector(dir, -push)
        }
      }

      positions[i].x = THREE.MathUtils.clamp(
        positions[i].x,
        -maxHorizontalSpread,
        maxHorizontalSpread,
      )
      positions[i].y = THREE.MathUtils.clamp(
        positions[i].y,
        -maxHorizontalSpread,
        maxHorizontalSpread,
      )
      positions[i].z = THREE.MathUtils.clamp(
        positions[i].z,
        depthBounds.min,
        depthBounds.max,
      )
    }
  }
}

// Generate positions in a sphere around the camera
function generatePositions(count: number): THREE.Vector3[] {
  const positions: THREE.Vector3[] = []
  const safeCount = Math.max(count, 1)

  // Dynamically adjust radius based on number of projects
  // More projects = slightly larger radius to avoid overlap
  // But keep it constrained to fit in viewport
  const baseRadius = 4
  const radiusMultiplier = Math.min(1 + Math.log10(safeCount) * 0.2, 1.8)
  const largeCategoryFactor = THREE.MathUtils.clamp((safeCount - 12) / 70, 0, 1)
  const spreadBoost = THREE.MathUtils.lerp(1, 1.45, largeCategoryFactor)
  const radius = baseRadius * radiusMultiplier * spreadBoost
  const minDistance = THREE.MathUtils.lerp(1.3, 2.2, largeCategoryFactor)
  const horizontalSpreadMultiplier = THREE.MathUtils.lerp(
    1.2,
    2.1,
    largeCategoryFactor,
  )
  const relaxIterations = Math.round(5 + largeCategoryFactor * 3)

  const goldenRatio = (1 + Math.sqrt(5)) / 2
  const angleIncrement = Math.PI * 2 * goldenRatio
  const depthOffset = 8
  const depthBounds = { min: -12, max: -7 }

  for (let i = 0; i < count; i++) {
    const t = i / safeCount
    const inclination = Math.acos(1 - 2 * t)
    const azimuth = angleIncrement * i

    const x = radius * Math.sin(inclination) * Math.cos(azimuth)
    const y = radius * Math.sin(inclination) * Math.sin(azimuth)
    const rawZ = radius * Math.cos(inclination) - depthOffset
    const z = THREE.MathUtils.clamp(rawZ, depthBounds.min, depthBounds.max)

    positions.push(new THREE.Vector3(x, y, z))
  }

  relaxPositions(positions, {
    minDistance,
    iterations: relaxIterations,
    maxHorizontalSpread: radius * horizontalSpreadMultiplier,
    depthBounds,
  })

  return positions
}

function App() {
  // Network state
  const [network, setNetwork] = useState<Network>('mainnet')

  // State for loaded data
  const [ecoCategories, setEcoCategories] = useState<{
    categories: string[]
  } | null>(null)
  const [allProjects, setAllProjects] = useState<LoadedProject[]>([])

  // Load data when network changes
  useEffect(() => {
    async function loadData() {
      try {
        const { categories, mapping } = await generateEcoCategories(network)
        const projects = await loadNetworkProjects(mapping, network)
        setEcoCategories(categories)
        setAllProjects(projects)
      } catch (error) {
        console.error('Failed to load project data:', error)
      }
    }
    loadData()
    // Reset to categories screen when network changes
    setSelectedCategory(null)
    setModalVisible(false)
    setSelectedHotspotId(null)
  }, [network])

  // Validate and log data before using
  useEffect(() => {
    if (!ecoCategories || allProjects.length === 0) return

    console.log('='.repeat(80))
    console.log('DATA VALIDATION - TRANSFORMED PROJECTS')
    console.log('='.repeat(80))
    console.log(`Total categories: ${ecoCategories.categories.length}`)
    console.log(`Total projects: ${allProjects.length}`)
    console.log(
      `Projects with logo: ${allProjects.filter((p) => p.logo).length}`,
    )
    console.log(
      `Projects with banner: ${allProjects.filter((p) => p.banner).length}`,
    )
    console.log(
      `Projects without categories: ${
        allProjects.filter((p) => p.categories.length === 0).length
      }`,
    )

    // Show category distribution
    const categoryCounts: Record<string, number> = {}
    allProjects.forEach((p) => {
      p.categories.forEach((cat) => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
      })
    })
    console.log('\nCategory distribution:')
    Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count} projects`)
      })

    // Show sample projects
    console.log('\nSample projects (first 3):')
    allProjects.slice(0, 3).forEach((p) => {
      console.log(`  ${p.name}:`, {
        categories: p.categories,
        hasLogo: !!p.logo,
        hasBanner: !!p.banner,
        hasDescription: !!p.description,
      })
    })

    console.log('='.repeat(80))
  }, [allProjects, ecoCategories])

  // Transform loaded projects into categories with positions
  const categories: Category[] = useMemo(() => {
    if (!ecoCategories || allProjects.length === 0) return []

    return ecoCategories.categories.map((categoryName) => {
      const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-')
      const categoryProjects = allProjects.filter((proj) =>
        proj.categories.includes(categoryName),
      )

      const positions = generatePositions(categoryProjects.length)

      return {
        id: categoryId,
        name: categoryName,
        projects: categoryProjects.map((proj, index) => ({
          id: proj.id,
          name: proj.name,
          description: proj.description,
          categories: proj.categories,
          logo: proj.logo,
          banner: proj.banner || '',
          site_link: proj.site_link || null,
          social_links: proj.social_links || [],
          position: positions[index],
        })),
      }
    })
  }, [allProjects, ecoCategories])
  const containerRef = useRef<HTMLDivElement>(null)
  const categoryButtonsRef = useRef<HTMLDivElement>(null)
  const materialRef = useRef<THREE.PointsMaterial | null>(null) // Kept for compatibility

  const { theme } = useThemeStore()
  const colors = themeColors[theme]

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
  const [hoveredProject, setHoveredProject] = useState<{
    id: string
    name: string
    x: number
    y: number
  } | null>(null)

  // Use refs to store callbacks so they don't cause scene recreation
  const categoriesRef = useRef<Category[]>([])
  useEffect(() => {
    categoriesRef.current = categories
  }, [categories])

  // Handle hotspot hover for tooltip
  const handleHotspotHover = useCallback(
    (hotspot: { id: string; name: string; x: number; y: number } | null) => {
      setHoveredProject(hotspot)
    },
    [],
  )

  // Handle hotspot click - use ref to avoid recreating scene
  const handleHotspotClick = useCallback((hotspotId: string) => {
    // Use ref to get current categories without causing dependency changes
    const currentCategories = categoriesRef.current
    let projectData = null

    for (const category of currentCategories) {
      const project = category.projects.find((p) => p.id === hotspotId)
      if (project) {
        projectData = {
          name: project.name,
          description: project.description,
          logo: project.logo,
          banner: project.banner,
          siteLink: project.site_link,
          socialLinks: project.social_links,
        }
        break
      }
    }

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
  }, []) // Empty deps - uses ref instead

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
    onHotspotHover: handleHotspotHover,
    backgroundColor: colors.background,
  })

  // Birds flocking background
  useBirdsBackground({
    sceneRef,
    cameraRef,
    rendererRef,
    mouseXRef,
    mouseYRef,
  })

  // Particle cloud background
  useParticlesBackground({
    sceneRef,
    cameraRef,
    rendererRef,
  })

  // NFT loading and management
  const { nftSvg } = useNFTs()

  // Hotspot management - only run when data is ready
  useHotspots({
    sceneRef,
    cameraRef,
    rendererRef,
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

  // Only render components that depend on categories when data is available
  const isDataReady = categories.length > 0

  return (
    <>
      <Navbar
        network={network}
        onNetworkChange={setNetwork}
        showNetworkToggle={!selectedCategory}
      />
      <div ref={containerRef} />
      {isDataReady && (
        <CategoryButtons
          ref={categoryButtonsRef}
          categories={categories}
          onSelect={handleCategorySelect}
        />
      )}
      {selectedCategory && <ControlsHint onBack={handleBackToCategories} />}
      {hoveredProject && !modalVisible && (
        <ProjectTooltip
          name={hoveredProject.name}
          x={hoveredProject.x}
          y={hoveredProject.y}
        />
      )}
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
