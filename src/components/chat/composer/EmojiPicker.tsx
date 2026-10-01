import { useState } from 'react'
import { Smile } from 'lucide-react'
import Picker, { Theme, type EmojiClickData } from 'emoji-picker-react'

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative">
      {open && (
        <div className="absolute bottom-10 right-0 z-50 overflow-hidden rounded-xl border border-line shadow-2xl">
          <Picker onEmojiClick={(data: EmojiClickData) => onSelect(data.emoji)} theme={Theme.LIGHT} width={320} height={400} />
        </div>
      )}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        className={`transition ${open ? 'text-lime' : 'text-muted hover:text-ink'}`}
        aria-label="Toggle emoji picker"
      >
        <Smile size={18} />
      </button>
    </span>
  )
}
