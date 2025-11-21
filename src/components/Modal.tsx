import { X } from 'lucide-react'
import { useThemeStore, themeColors } from '../stores/themeStore'

interface ModalProps {
  visible: boolean
  title: string
  text: string
  logo?: string
  banner?: string
  siteLink?: string | null
  socialLinks?: string[]
  onClose: () => void
}

export function Modal({
  visible,
  title,
  text,
  logo,
  banner,
  siteLink,
  socialLinks = [],
  onClose,
}: ModalProps) {
  const { theme } = useThemeStore()
  const colors = themeColors[theme]

  return (
    <>
      {/* Drawer */}
      <div
        className={`fixed right-0 w-1/3 z-30 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          top: '64px', // Navbar height (py-4 = 16px top + content + 16px bottom ≈ 64px)
          height: 'calc(100vh - 64px)', // Full viewport height minus navbar
          backgroundColor: theme === 'light' ? '#ffffff' : '#141419',
          color: colors.text,
        }}
      >
        <div className="flex items-center justify-end p-4">
          <X
            onClick={onClose}
            className="transition-colors bg-transparent border-none cursor-pointer z-10 size-6"
            style={{
              color: theme === 'light' ? '#666666' : '#aaaaaa',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.text
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color =
                theme === 'light' ? '#666666' : '#aaaaaa'
            }}
          />
        </div>

        {/* Content container with padding and scroll */}
        <div className="h-full overflow-y-auto p-6 pt-0">
          {banner && (
            <img
              src={banner}
              alt={`${title} banner`}
              className="w-full h-32 object-cover rounded-lg mb-4"
            />
          )}

          <div className="flex items-center gap-3 mb-4">
            {logo && (
              <img
                src={logo}
                alt={`${title} logo`}
                className="w-12 h-12 rounded-lg"
              />
            )}
            <h2
              className="text-2xl font-semibold m-0"
              style={{ color: colors.text }}
            >
              {title}
            </h2>
          </div>

          <p
            className="text-base leading-relaxed mb-4"
            style={{
              color: theme === 'light' ? '#666666' : 'rgba(255, 255, 255, 0.8)',
            }}
          >
            {text}
          </p>

          {(siteLink || socialLinks.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {siteLink && (
                <a
                  href={siteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm no-underline hover:bg-purple-700 transition-colors"
                >
                  Visit Site
                </a>
              )}
              {socialLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg text-sm no-underline transition-colors"
                  style={{
                    backgroundColor: theme === 'light' ? '#f0f0f0' : '#333333',
                    color: theme === 'light' ? '#333333' : '#ffffff',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      theme === 'light' ? '#e0e0e0' : '#444444'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      theme === 'light' ? '#f0f0f0' : '#333333'
                  }}
                >
                  Social
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
