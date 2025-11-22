import ecosystemData from '../data/monad_ecosystem.json'
import type { CategoryMapping } from '../services/generateEcoCategories'

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
 * Loads mainnet projects and merges with ecosystem metadata
 * Only logo and banner come from ecosystem.json, everything else from mainnet files
 * Uses dynamic imports to handle invalid JSON files gracefully
 */
export async function loadMainnetProjects(
  categoryMapping: CategoryMapping,
): Promise<Project[]> {
  // Use Vite's import.meta.glob with lazy loading to handle invalid JSON gracefully
  const mainnetModules = import.meta.glob('../data/mainnet/*.json', {
    eager: false,
  })

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
  const loadPromises = Object.entries(mainnetModules).map(
    async ([filePath, loader]) => {
      try {
        const module = await loader()
        const mainnetProject = ((module as any).default || module) as any

        if (!mainnetProject.name) {
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
          ecosystemMap.get(mainnetProject.name.toLowerCase()) ||
          ecosystemMap.get(fileName.toLowerCase())

        // Transform categories
        const transformedCategories: string[] = []
        if (
          mainnetProject.categories &&
          Array.isArray(mainnetProject.categories)
        ) {
          mainnetProject.categories.forEach((cat: string) => {
            const transformed = categoryMapping[cat]
            if (transformed) {
              transformedCategories.push(transformed)
            } else {
              console.warn(
                `Unknown category "${cat}" for project ${mainnetProject.name}`,
              )
            }
          })
        }

        // Remove duplicates
        const uniqueCategories = Array.from(new Set(transformedCategories))

        // Build project object
        const project: Project = {
          id: mainnetProject.name.toLowerCase().replace(/\s+/g, '-'),
          name: mainnetProject.name,
          description: mainnetProject.description || '',
          logo: ecosystemProject?.logo || '',
          banner: ecosystemProject?.banner || '',
          site_link:
            mainnetProject.links?.project || ecosystemProject?.site_link,
          social_links: ecosystemProject?.social_links || [],
          categories: uniqueCategories,
          addresses: mainnetProject.addresses,
          links: mainnetProject.links,
          live: mainnetProject.live,
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
