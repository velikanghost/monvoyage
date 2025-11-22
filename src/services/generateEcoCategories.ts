export interface CategoryMapping {
  [oldCategory: string]: string // "DeFi::DEX" -> "DEX"
}

export interface EcoCategories {
  categories: string[]
}

interface ProjectCategoryCount {
  [category: string]: number
}

/**
 * Generates eco categories and mapping from mainnet files
 * Option A: Runtime generation (no file saving)
 * Uses dynamic imports to handle invalid JSON files gracefully
 */
export async function generateEcoCategories(): Promise<{
  categories: EcoCategories
  mapping: CategoryMapping
}> {
  // Use Vite's import.meta.glob with lazy loading to handle invalid JSON gracefully
  const mainnetModules = import.meta.glob('../data/mainnet/*.json', {
    eager: false,
  })

  // Count projects per category
  const categoryCounts: ProjectCategoryCount = {}

  // Load all modules with error handling
  const loadPromises = Object.entries(mainnetModules).map(
    async ([filePath, loader]) => {
      try {
        const module = await loader()
        const project = (module as any).default || module

        if (project.categories && Array.isArray(project.categories)) {
          project.categories.forEach((cat: string) => {
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
          })
        }
      } catch (e) {
        const fileName = filePath.split('/').pop() || ''
        console.warn(`Failed to load project from ${fileName}:`, e)
      }
    },
  )

  await Promise.all(loadPromises)

  // Apply transformation rules
  const mapping: CategoryMapping = {}
  const finalCategories = new Set<string>()

  Object.entries(categoryCounts).forEach(([fullCategory, count]) => {
    const [main, sub] = fullCategory.split('::')

    let newCategory: string

    // Transformation rules
    if (main === 'DeFi') {
      // DeFi: use sub (>3) or "DeFi" (≤3)
      if (count > 3) {
        newCategory = sub
      } else {
        newCategory = 'DeFi'
      }
    } else if (main === 'Consumer') {
      // Consumer: use sub (>3) or "Consumer" (≤3)
      if (count > 3) {
        newCategory = sub
      } else {
        newCategory = 'Consumer'
      }
    } else if (main === 'Infra') {
      // Infra: use sub (>3) or "Infrastructure" (≤3), handle clashes
      if (count > 3) {
        // Check for clashes - if sub name exists in other main categories, use prefix
        const hasClash = Object.keys(categoryCounts).some(
          (cat) => cat !== fullCategory && cat.endsWith(`::${sub}`),
        )
        if (hasClash || sub === 'Gaming') {
          newCategory = 'Infrastructure'
        } else {
          newCategory = sub
        }
      } else {
        newCategory = 'Infrastructure'
      }
    } else if (main === 'Payments') {
      // Payments: use sub (>3) or "Payments" (≤3)
      if (count > 3) {
        newCategory = sub
      } else {
        newCategory = 'Payments'
      }
    } else {
      // AI, CeFi, DePIN, Gaming, Governance, NFT: all become main category name
      newCategory = main
    }

    mapping[fullCategory] = newCategory
    finalCategories.add(newCategory)
  })

  return {
    categories: {
      categories: Array.from(finalCategories).sort(),
    },
    mapping,
  }
}
