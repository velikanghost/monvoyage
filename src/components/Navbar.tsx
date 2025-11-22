import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useThemeStore, themeColors } from '../stores/themeStore'

interface NavbarProps {}

export function Navbar({}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { theme, toggleTheme } = useThemeStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log('Search:', searchQuery)
  }

  const colors = themeColors[theme]

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: colors.navbarBg,
      }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div
          className="text-xl font-semibold"
          style={{ color: colors.navbarText }}
        >
          monvoyage
        </div>
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              style={{
                backgroundColor: colors.searchBg,
                color: colors.searchText,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: colors.searchBorder,
              }}
            />
          </form>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
            aria-label="Toggle theme"
            style={{ color: colors.navbarText }}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </nav>
  )
}
