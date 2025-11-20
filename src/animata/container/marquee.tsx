import { cn } from '@/lib/utils'

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  vertical?: boolean
  repeat?: number
  reverse?: boolean
  pauseOnHover?: boolean
  applyMask?: boolean
}

export default function Marquee({
  children,
  vertical = false,
  repeat = 5,
  pauseOnHover = false,
  reverse = false,
  className,
  applyMask = true,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        'group relative flex h-fit w-full p-2 [--duration:10s] gap-2',
        {
          'flex-col': vertical,
          'flex-row': !vertical,
        },
        className,
      )}
    >
      {Array.from({ length: repeat }).map((_, index) => (
        <div
          key={`item-${index}`}
          className={cn('flex shrink-0 gap-2', {
            'group-hover:[animation-play-state:paused]': pauseOnHover,
            'animate-marquee-horizontal flex-row': !vertical && !reverse,
            'animate-marquee-horizontal reverse flex-row': !vertical && reverse,
            'animate-marquee-vertical flex-col': vertical,
          })}
        >
          {children}
        </div>
      ))}
      {applyMask && (
        <div
          className={cn(
            'pointer-events-none absolute inset-0 z-10 h-full w-full from-white/50 from-5% via-transparent via-50% to-white/50 to-95% dark:from-gray-800/50 dark:via-transparent dark:to-gray-800/50',
            {
              'bg-gradient-to-b': vertical,
              'bg-gradient-to-r': !vertical,
            },
          )}
        />
      )}
    </div>
  )
}
