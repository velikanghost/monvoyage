import Marquee from '@/animata/container/marquee'

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
  return (
    <button
      onClick={() => onSelect(category.id)}
      className="flex h-24 w-48 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-background px-4 py-3 transition-all hover:scale-105 hover:shadow-lg dark:border-zinc-700"
      key={category.id}
    >
      <span className="text-lg font-bold text-foreground">{category.name}</span>
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
