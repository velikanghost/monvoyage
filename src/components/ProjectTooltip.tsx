import { useThemeStore, themeColors } from '../stores/themeStore'

interface ProjectTooltipProps {
  name: string
  x: number
  y: number
}

export function ProjectTooltip({ name, x, y }: ProjectTooltipProps) {
  const { theme } = useThemeStore()
  const isLight = theme === 'light'

  const bgColor = isLight
    ? 'rgba(255, 255, 255, 0.95)'
    : 'rgba(20, 20, 25, 0.95)'
  const textColor = isLight ? '#000000' : '#ffffff'
  const borderColor = isLight
    ? 'rgba(0, 0, 0, 0.15)'
    : 'rgba(255, 255, 255, 0.25)'

  return (
    <div
      className="pointer-events-none fixed z-50 rounded-lg border px-3 py-2 shadow-lg backdrop-blur-sm transition-opacity"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -100%)',
        backgroundColor: bgColor,
        borderColor: borderColor,
      }}
    >
      <p
        className="text-sm font-medium whitespace-nowrap"
        style={{ color: textColor }}
      >
        {name}
      </p>
    </div>
  )
}
