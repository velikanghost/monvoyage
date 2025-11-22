import ecosystemData from '../data/monad_ecosystem.json'
import type {
  CategoryMapping,
  Network,
} from '../services/generateEcoCategories'

export interface Project {
  id: string
  name: string
  description: string
  logo: string
  banner: string // Always provided, empty string if missing
  site_link?: string
  social_links?: string[]
  categories: string[] // transformed flat categories
  addresses?: Record<string, string>
  links?: Record<string, string>
  live?: boolean
}

/**
 * Loads network projects and merges with ecosystem metadata
 * Only logo and banner come from ecosystem.json, everything else from network files
 * Uses dynamic imports to handle invalid JSON files gracefully
 */
export async function loadNetworkProjects(
  categoryMapping: CategoryMapping,
  network: Network = 'mainnet',
): Promise<Project[]> {
  // Use Vite's import.meta.glob with lazy loading to handle invalid JSON gracefully
  // Vite requires string literals, so we load both networks and filter at runtime
  const mainnetModules = import.meta.glob('../data/mainnet/*.json', {
    eager: false,
  })
  const testnetModules = import.meta.glob('../data/testnet/*.json', {
    eager: false,
  })

  // Select the appropriate modules based on network
  const networkModules = network === 'mainnet' ? mainnetModules : testnetModules

  // Create ecosystem lookup map by name
  const ecosystemMap = new Map<string, (typeof ecosystemData.projects)[0]>()
  ecosystemData.projects.forEach((project) => {
    ecosystemMap.set(project.name.toLowerCase(), project)
    if (project.slug) {
      ecosystemMap.set(project.slug.toLowerCase(), project)
    }
  })

  const projects: Project[] = []

  // Load all modules with error handling
  const loadPromises = Object.entries(networkModules).map(
    async ([filePath, loader]) => {
      try {
        const module = await loader()
        const networkProject = ((module as any).default || module) as any

        if (!networkProject.name) {
          const fileName = filePath.split('/').pop() || ''
          console.warn(`Project in ${fileName} missing name, skipping`)
          return
        }

        // Extract filename for matching
        const fileName =
          filePath
            .split('/')
            .pop()
            ?.replace(/\.json$/, '') || ''

        // Find matching project in ecosystem for logo/banner
        const ecosystemProject =
          ecosystemMap.get(networkProject.name.toLowerCase()) ||
          ecosystemMap.get(fileName.toLowerCase())

        // Transform categories
        const transformedCategories: string[] = []
        if (
          networkProject.categories &&
          Array.isArray(networkProject.categories)
        ) {
          networkProject.categories.forEach((cat: string) => {
            const transformed = categoryMapping[cat]
            if (transformed) {
              transformedCategories.push(transformed)
            } else {
              console.warn(
                `Unknown category "${cat}" for project ${networkProject.name}`,
              )
            }
          })
        }

        // Remove duplicates
        const uniqueCategories = Array.from(new Set(transformedCategories))

        // Build project object
        const project: Project = {
          id: networkProject.name.toLowerCase().replace(/\s+/g, '-'),
          name: networkProject.name,
          description: networkProject.description || '',
          logo: ecosystemProject?.logo || '',
          banner: ecosystemProject?.banner || '',
          site_link:
            networkProject.links?.project || ecosystemProject?.site_link,
          social_links: ecosystemProject?.social_links || [],
          categories: uniqueCategories,
          addresses: networkProject.addresses,
          links: networkProject.links,
          live: networkProject.live,
        }

        projects.push(project)
      } catch (e) {
        const fileName = filePath.split('/').pop() || ''
        console.warn(`Failed to load project from ${fileName}:`, e)
      }
    },
  )

  await Promise.all(loadPromises)

  return projects
}
