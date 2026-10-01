import { useEffect, useRef } from 'react'
import { MoreVertical, Trash2, Reply, Copy, Pencil } from 'lucide-react'

interface MessageActionsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete?: () => void
  onReply?: () => void
  onCopy?: () => void // <-- ADDED
  onEdit?: () => void // <-- ADDED
  hideTriggerOnMobile?: boolean
}

export default function MessageActions({ open, onOpenChange, onDelete, onEdit, onReply, onCopy, hideTriggerOnMobile }: MessageActionsProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onOpenChange(false)
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [open, onOpenChange])

  return (
    <>
      {/* Trigger Button: Hidden on mobile, visible on desktop hover */}
      <div
        className={`absolute -top-2 -right-2 transition-opacity ${
          hideTriggerOnMobile
            ? 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
            : ''
        }`}
      >
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onOpenChange(!open)
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-muted shadow-sm ring-1 ring-line transition-all hover:bg-cream hover:text-ink active:scale-95"
          aria-label="Message options"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <div ref={menuRef} className="absolute right-0 top-9 z-20 min-w-30 rounded-xl bg-white py-1 shadow-xl ring-1 ring-line">
        {onEdit && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); onOpenChange(false) }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-xs font-medium text-ink transition-colors hover:bg-cream"
            >
              <Pencil size={14} />
              Edit
            </button>
          )}
        
        {/* Only show Copy if onCopy is provided (i.e., the message has text) */}
          {onCopy && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onCopy()
                onOpenChange(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-xs font-medium text-ink transition-colors hover:bg-cream"
            >
              <Copy size={14} />
              Copy
            </button>
          )}
          
          {onReply && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onReply()
                onOpenChange(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-xs font-medium text-ink transition-colors hover:bg-cream"
            >
              <Reply size={14} />
              Reply
            </button>
          )}
          
          {/* Only show Delete if onDelete is provided */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete()
                onOpenChange(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
        </div>
      )}
    </>
  )
}