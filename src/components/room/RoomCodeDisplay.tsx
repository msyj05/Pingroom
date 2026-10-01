interface RoomCodeDisplayProps {
  /** Up to 6 characters. Shorter values are padded with empty cells. */
  value: string
  /** 'solid' = white filled cells (create flow). 'accent' = lime filled cells, dim empty cells (join flow). */
  variant?: 'solid' | 'accent'
  /** 'lg' = big square cells (create flow). 'md' = fixed rectangular cells (join flow). */
  size?: 'lg' | 'md'
}

export default function RoomCodeDisplay({ value, variant = 'solid', size = 'lg' }: RoomCodeDisplayProps) {
  const cells = value
    .toUpperCase()
    .padEnd(6, ' ')
    .split('')
    .slice(0, 6)

  const cellSize =
    size === 'lg'
      ? 'aspect-square text-2xl sm:text-3xl'
      : 'h-14 w-12 text-xl sm:h-16 sm:w-14 sm:text-2xl'

  return (
    <div className={size === 'lg' ? 'grid grid-cols-6 gap-2 sm:gap-3' : 'flex gap-2 sm:gap-3'}>
      {cells.map((char, i) => {
        const filled = char.trim().length > 0
        const filledClasses = variant === 'solid' ? 'bg-white text-ink' : 'bg-lime text-ink'
        const emptyClasses = variant === 'solid' ? 'bg-white/10 text-white/30' : 'bg-white/10 text-white/40'

        return (
          <span
            key={i}
            className={`flex items-center justify-center rounded-xl font-display font-extrabold ${cellSize} ${
              filled ? filledClasses : emptyClasses
            }`}
          >
            {filled ? char : variant === 'solid' ? '•' : ''}
          </span>
        )
      })}
    </div>
  )
}
