import Marquee from '@/animata/container/marquee'
import { useThemeStore, themeColors } from '../stores/themeStore'

interface Category {
  id: string
  name: string
}

interface ScrollingCategoriesProps {
  categories: Category[]
  onSelect: (categoryId: string) => void
}

function CategoryCard({
  category,
  onSelect,
}: {
  category: Category
  onSelect: (categoryId: string) => void
}) {
  const { theme } = useThemeStore()
  const colors = themeColors[theme]
  const isLight = theme === 'light'

  return (
    <button
      onClick={() => onSelect(category.id)}
      className="flex h-24 w-48 shrink-0 items-center justify-center overflow-hidden rounded-xl border px-4 py-3 transition-all hover:scale-105 hover:shadow-lg"
      style={{
        backgroundColor: isLight
          ? 'rgba(255, 255, 255, 0.9)'
          : 'rgba(20, 20, 25, 0.9)',
        borderColor: isLight
          ? 'rgba(0, 0, 0, 0.1)'
          : 'rgba(255, 255, 255, 0.2)',
        color: colors.text,
      }}
      key={category.id}
    >
      <span className="text-lg font-bold">{category.name}</span>
    </button>
  )
}

export default function ScrollingCategories({
  categories,
  onSelect,
}: ScrollingCategoriesProps) {
  // Split categories into up to 4 rows
  const rows: Category[][] = []
  const itemsPerRow = Math.ceil(categories.length / 4)

  for (let i = 0; i < 4 && i * itemsPerRow < categories.length; i++) {
    const start = i * itemsPerRow
    const end = Math.min(start + itemsPerRow, categories.length)
    rows.push(categories.slice(start, end))
  }

  return (
    <div className="w-full">
      {rows.map((rowCategories, index) => {
        // Alternate directions: row 0 (l->r), row 1 (r->l), row 2 (l->r), row 3 (r->l)
        const isReverse = index % 2 === 1

        return (
          <Marquee
            key={index}
            reverse={isReverse}
            className="[--duration:25s] [--gap:8px]"
            pauseOnHover
            applyMask={false}
          >
            {rowCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onSelect={onSelect}
              />
            ))}
          </Marquee>
        )
      })}
    </div>
  )
}
