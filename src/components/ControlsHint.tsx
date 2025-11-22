import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useEffect } from 'react'
import { useThemeStore } from '../stores/themeStore'

interface ControlsHintProps {
  onBack: () => void
}

export function ControlsHint({ onBack }: ControlsHintProps) {
  const { theme } = useThemeStore()

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onBack()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onBack])

  const isLight = theme === 'light'
  const bgColor = isLight
    ? 'rgba(255, 255, 255, 0.85)'
    : 'rgba(20, 20, 25, 0.85)'
  const textColor = isLight ? '#000000' : '#ffffff'
  const keyBg = isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.1)'
  const keyBorder = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)'
  const iconColor = isLight ? '#333333' : '#ffffff'

  return (
    <div className="fixed bottom-4 left-4 z-40 flex flex-col gap-4 max-w-[150px]">
      <div
        className="flex flex-col gap-3 rounded-xl border p-4 backdrop-blur-md"
        style={{
          backgroundColor: bgColor,
          borderColor: keyBorder,
        }}
      >
        <div className="flex items-center justify-center">
          <div
            className="flex h-9 min-w-[60px] items-center justify-center rounded border px-3"
            style={{
              backgroundColor: keyBg,
              borderColor: keyBorder,
            }}
          >
            <span
              className="text-xs font-semibold"
              style={{ color: iconColor }}
            >
              ESC
            </span>
          </div>
        </div>
        <p
          className="text-center text-sm"
          style={{ color: textColor, opacity: 0.8 }}
        >
          ESC to go back
        </p>
      </div>
      {/* Arrow Keys Section */}
      <div
        className="flex flex-col gap-3 rounded-xl border p-4 backdrop-blur-md"
        style={{
          backgroundColor: bgColor,
          borderColor: keyBorder,
        }}
      >
        <div className="flex flex-col items-center gap-1">
          {/* Up Arrow */}
          <div
            className="flex h-9 w-9 items-center justify-center rounded border"
            style={{
              backgroundColor: keyBg,
              borderColor: keyBorder,
            }}
          >
            <ArrowUp size={16} style={{ color: iconColor }} />
          </div>
          {/* Left, Down, Right Arrows */}
          <div className="flex gap-1">
            <div
              className="flex h-9 w-9 items-center justify-center rounded border"
              style={{
                backgroundColor: keyBg,
                borderColor: keyBorder,
              }}
            >
              <ArrowLeft size={16} style={{ color: iconColor }} />
            </div>
            <div
              className="flex h-9 w-9 items-center justify-center rounded border"
              style={{
                backgroundColor: keyBg,
                borderColor: keyBorder,
              }}
            >
              <ArrowDown size={16} style={{ color: iconColor }} />
            </div>
            <div
              className="flex h-9 w-9 items-center justify-center rounded border"
              style={{
                backgroundColor: keyBg,
                borderColor: keyBorder,
              }}
            >
              <ArrowRight size={16} style={{ color: iconColor }} />
            </div>
          </div>
        </div>
        <p
          className="text-center text-sm"
          style={{ color: textColor, opacity: 0.8 }}
        >
          Press these keys on your keyboard to move around
        </p>
      </div>

      {/* Zoom Section */}
      <div
        className="flex flex-col gap-3 rounded-xl border p-4 backdrop-blur-md"
        style={{
          backgroundColor: bgColor,
          borderColor: keyBorder,
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded border"
            style={{
              backgroundColor: keyBg,
              borderColor: keyBorder,
            }}
          >
            <ZoomIn size={16} style={{ color: iconColor }} />
          </div>
          <div
            className="flex h-9 w-9 items-center justify-center rounded border"
            style={{
              backgroundColor: keyBg,
              borderColor: keyBorder,
            }}
          >
            <ZoomOut size={16} style={{ color: iconColor }} />
          </div>
        </div>
        <p
          className="text-center text-sm"
          style={{ color: textColor, opacity: 0.8 }}
        >
          Use + / - keys or scroll to zoom in and out
        </p>
      </div>
    </div>
  )
}
