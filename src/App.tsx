import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useThreeScene } from './hooks/useThreeScene'
import { useNFTs } from './hooks/useNFTs'
import { useHotspots } from './hooks/useHotspots'
import { useSingleNFTBackground } from './hooks/useSingleNFTBackground'
import { useCategoryNavigation } from './hooks/useCategoryNavigation'
import { CategoryButtons } from './components/CategoryButtons'
import { BackButton } from './components/BackButton'
import { Modal } from './components/Modal'
import './App.css'

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

const categories: Category[] = [
  {
    id: 'dex',
    name: 'DEX',
    projects: [
      {
        id: 'dex-1',
        name: 'Uniswap',
        description:
          'A decentralized exchange protocol for automated liquidity provision.',
        position: new THREE.Vector3(-2, 1, -5),
      },
      {
        id: 'dex-2',
        name: 'SushiSwap',
        description:
          'A community-driven decentralized exchange with yield farming.',
        position: new THREE.Vector3(2, -1, -6),
      },
      {
        id: 'dex-3',
        name: 'Curve',
        description: 'An exchange liquidity pool designed for stablecoins.',
        position: new THREE.Vector3(0, 0, -7),
      },
    ],
  },
  {
    id: 'nft',
    name: 'NFT',
    projects: [
      {
        id: 'nft-1',
        name: 'OpenSea',
        description:
          'The largest NFT marketplace for buying and selling digital collectibles.',
        position: new THREE.Vector3(-1.5, 0.5, -5),
      },
      {
        id: 'nft-2',
        name: 'Blur',
        description: 'A fast NFT marketplace with advanced trading features.',
        position: new THREE.Vector3(1.5, -0.5, -6),
      },
    ],
  },
  {
    id: 'clobs',
    name: 'CLOBs',
    projects: [
      {
        id: 'clob-1',
        name: 'dYdX',
        description: 'A decentralized exchange for perpetual futures trading.',
        position: new THREE.Vector3(0, 1.5, -5),
      },
      {
        id: 'clob-2',
        name: 'Orderly Network',
        description: 'A decentralized order book protocol for DeFi trading.',
        position: new THREE.Vector3(-1, -1, -6),
      },
      {
        id: 'clob-3',
        name: 'Vertex Protocol',
        description:
          'A unified trading platform combining spot and perpetuals.',
        position: new THREE.Vector3(1.5, 0, -7),
      },
    ],
  },
]

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const categoryButtonsRef = useRef<HTMLDivElement>(null)
  const materialRef = useRef<THREE.PointsMaterial | null>(null)

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('Project')
  const [modalText, setModalText] = useState('Description goes here.')
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(
    null,
  )

  // Get project data for selected hotspot
  const getProjectData = (hotspotId: string) => {
    for (const category of categories) {
      const project = category.projects.find((p) => p.id === hotspotId)
      if (project) {
        return { name: project.name, description: project.description }
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
        setModalTitle(projectData.name)
        setModalText(projectData.description)
        setModalVisible(true)
        return hotspotId
      })
    },
    [], // getProjectData doesn't depend on any props/state
  )

  // Three.js scene setup
  const { sceneRef, cameraRef, hotspotMeshesRef, selectedHotspotIdRef } =
    useThreeScene({
      containerRef,
      materialRef,
      selectedCategory,
      onHotspotClick: handleHotspotClick,
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
      materialRef,
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
        title={modalTitle}
        text={modalText}
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
