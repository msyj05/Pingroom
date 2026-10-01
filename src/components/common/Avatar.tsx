import { cn, initials } from '../../lib/utils'
import type { AvatarColor } from '../../types'

const COLOR_MAP: Record<AvatarColor, string> = {
  purple: 'bg-avatar-purple text-ink',
  lime: 'bg-avatar-lime text-ink',
  orange: 'bg-avatar-orange text-ink',
  blue: 'bg-avatar-blue text-ink',
}

const STATUS_MAP: Record<string, string> = {
  online: 'bg-success',
  idle: 'bg-muted',
  offline: 'bg-transparent',
}

interface AvatarProps {
  name: string
  color: AvatarColor
  status?: 'online' | 'idle' | 'offline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
}

export default function Avatar({ name, color, status, size = 'md', className }: AvatarProps) {
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        className={cn(
          'flex items-center justify-center rounded-full font-display font-bold',
          COLOR_MAP[color],
          SIZE_MAP[size],
        )}
      >
        {initials(name)}
      </span>
      {status && status !== 'offline' && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white',
            STATUS_MAP[status],
          )}
        />
      )}
    </span>
  )
}
