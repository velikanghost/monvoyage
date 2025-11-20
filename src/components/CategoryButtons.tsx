import { forwardRef } from 'react'
import ScrollingCategories from './ScrollingCategories'

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
        <ScrollingCategories categories={categories} onSelect={onSelect} />
      </div>
    )
  },
)

CategoryButtons.displayName = 'CategoryButtons'
