import {
  X,
  ExternalLink,
  Copy,
  Check,
  Twitter,
  Github,
  FileText,
  Globe,
  Link as LinkIcon,
} from 'lucide-react'
import { useThemeStore, themeColors } from '../stores/themeStore'
import type { Network } from '../services/generateEcoCategories'
import { useState, useEffect } from 'react'

interface ModalProps {
  visible: boolean
  title: string
  text: string
  logo?: string
  banner?: string
  siteLink?: string | null
  socialLinks?: string[]
  addresses?: Record<string, string>
  links?: Record<string, string>
  network: Network
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
  addresses = {},
  links = {},
  network,
  onClose,
}: ModalProps) {
  const { theme } = useThemeStore()
  const colors = themeColors[theme]
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const explorerBaseByNetwork: Record<Network, string> = {
    mainnet: 'https://monadscan.com/address/',
    testnet: 'https://testnet.monadvision.com/address/',
  }
  const explorerBase = explorerBaseByNetwork[network]

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAddress(key)
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getLinkIcon = (linkType: string, url: string) => {
    const lowerType = linkType.toLowerCase()
    const lowerUrl = url.toLowerCase()

    if (
      lowerType.includes('twitter') ||
      lowerType.includes('x') ||
      lowerUrl.includes('twitter.com') ||
      lowerUrl.includes('x.com')
    ) {
      return <Twitter className="w-4 h-4" />
    }
    if (lowerType.includes('github') || lowerUrl.includes('github.com')) {
      return <Github className="w-4 h-4" />
    }
    if (
      lowerType.includes('doc') ||
      lowerUrl.includes('docs') ||
      lowerUrl.includes('documentation')
    ) {
      return <FileText className="w-4 h-4" />
    }
    if (
      lowerType.includes('project') ||
      lowerType.includes('website') ||
      lowerType.includes('site')
    ) {
      return <Globe className="w-4 h-4" />
    }
    return <LinkIcon className="w-4 h-4" />
  }

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [visible])

  return (
    <>
      {/* Backdrop with blur */}
      {visible && (
        <div
          className="fixed inset-0 z-20 transition-opacity duration-300"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            top: '64px', // Start below navbar
            pointerEvents: 'auto',
          }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onClose()
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 w-1/3 z-30 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          top: '64px', // Navbar height (py-4 = 16px top + content + 16px bottom ≈ 64px)
          height: 'calc(100vh - 64px)', // Full viewport height minus navbar
          backgroundColor: theme === 'light' ? '#ffffff' : '#141419',
          color: colors.text,
        }}
        onWheel={(e) => {
          // Stop scroll propagation to background
          e.stopPropagation()
        }}
        onTouchMove={(e) => {
          // Stop touch scroll propagation to background
          e.stopPropagation()
        }}
      >
        <div className="flex items-center justify-end p-4 shrink-0">
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
        <div
          className="flex-1 overflow-y-auto p-6 pt-0"
          style={{ overscrollBehavior: 'contain' }}
        >
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
            className="text-base leading-relaxed mb-6"
            style={{
              color: theme === 'light' ? '#666666' : 'rgba(255, 255, 255, 0.8)',
            }}
          >
            {text}
          </p>

          {/* Contract Addresses */}
          {Object.keys(addresses).length > 0 && (
            <div className="mb-6">
              <h3
                className="text-sm font-semibold mb-3 uppercase tracking-wide"
                style={{
                  color:
                    theme === 'light' ? '#666666' : 'rgba(255, 255, 255, 0.6)',
                }}
              >
                Contract Addresses
              </h3>
              <div className="space-y-2">
                {Object.entries(addresses).map(([contractName, address]) => (
                  <div
                    key={contractName}
                    className="flex items-center gap-2 p-3 rounded-lg border transition-colors"
                    style={{
                      backgroundColor:
                        theme === 'light' ? '#f9f9f9' : '#1a1a1f',
                      borderColor: theme === 'light' ? '#e5e5e5' : '#2a2a2f',
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-xs font-medium mb-1"
                        style={{
                          color:
                            theme === 'light'
                              ? '#666666'
                              : 'rgba(255, 255, 255, 0.7)',
                        }}
                      >
                        {contractName}
                      </div>
                      <a
                        href={`${explorerBase}${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-mono no-underline"
                        style={{ color: colors.text }}
                      >
                        {formatAddress(address)}
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </div>
                    <button
                      onClick={() => copyToClipboard(address, contractName)}
                      className="p-2 rounded hover:bg-opacity-20 transition-colors shrink-0"
                      style={{
                        backgroundColor:
                          theme === 'light' ? '#f0f0f0' : '#2a2a2f',
                        color: theme === 'light' ? '#666666' : '#aaaaaa',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          theme === 'light' ? '#e0e0e0' : '#3a3a3f'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          theme === 'light' ? '#f0f0f0' : '#2a2a2f'
                      }}
                      title="Copy address"
                    >
                      {copiedAddress === contractName ? (
                        <Check
                          className="w-4 h-4"
                          style={{ color: '#10b981' }}
                        />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(siteLink ||
            socialLinks.length > 0 ||
            Object.keys(links).length > 0) && (
            <div className="mb-6">
              <h3
                className="text-sm font-semibold mb-3 uppercase tracking-wide"
                style={{
                  color:
                    theme === 'light' ? '#666666' : 'rgba(255, 255, 255, 0.6)',
                }}
              >
                Links
              </h3>
              <div className="flex flex-wrap gap-2">
                {siteLink && (
                  <a
                    href={siteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm no-underline hover:bg-purple-700 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {socialLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm no-underline transition-colors"
                    style={{
                      backgroundColor:
                        theme === 'light' ? '#f0f0f0' : '#333333',
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
                    <Twitter className="w-4 h-4" />
                    <span>Twitter</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
                {Object.entries(links)
                  .filter(([linkType, url]) => {
                    // Don't show "project" link if siteLink (Website) already exists
                    if (
                      linkType.toLowerCase() === 'project' &&
                      siteLink &&
                      url === siteLink
                    ) {
                      return false
                    }
                    return true
                  })
                  .map(([linkType, url]) => (
                    <a
                      key={linkType}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm no-underline transition-colors"
                      style={{
                        backgroundColor:
                          theme === 'light' ? '#f0f0f0' : '#333333',
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
                      {getLinkIcon(linkType, url)}
                      <span className="capitalize">{linkType}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
