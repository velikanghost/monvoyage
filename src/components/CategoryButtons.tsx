import { forwardRef } from 'react'

interface Category {
  id: string
  name: string
}

interface CategoryButtonsProps {
  categories: Category[]
  onSelect: (categoryId: string) => void
}

export const CategoryButtons = forwardRef<HTMLDivElement, CategoryButtonsProps>(
  ({ categories, onSelect }, ref) => {
    return (
      <div ref={ref} className="categoryButtons">
        {categories.map((category) => (
          <button
            key={category.id}
            className="categoryBtn"
            onClick={() => onSelect(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    )
  },
)

CategoryButtons.displayName = 'CategoryButtons'
