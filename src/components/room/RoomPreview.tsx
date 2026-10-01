import { Share2 } from 'lucide-react'
import RoomCodeDisplay from './RoomCodeDisplay'

interface RoomPreviewProps {
  code: string | null
  copied: boolean
  onCopy: () => void
}

export default function RoomPreview({ code, copied, onCopy }: RoomPreviewProps) {
  return (
    <div className="overflow-hidden rounded-xl2 bg-ink p-6 text-white shadow-panel sm:p-8">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-lime">
        <span className="h-2 w-2 rounded-full bg-lime" />
        {code ? 'Room live — share this code' : 'Code appears here'}
      </div>

      <div className="mt-6">
        <RoomCodeDisplay value={code ?? ''} variant="solid" size="lg" />
      </div>

      <p className="mt-4 text-sm text-white/70">
        {code ? 'Expires in 23:59:12 · No account needed to join' : 'Generate a code to activate this room.'}
      </p>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onCopy}
          disabled={!code}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-lime py-3.5 text-sm font-bold text-ink transition hover:bg-lime-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copied ? 'Copied!' : 'Copy code'}
        </button>
        <button
          disabled={!code}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/10 py-3.5 text-sm font-bold text-white ring-1 ring-white/20 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Share2 size={16} />
          Invite
        </button>
      </div>
    </div>
  )
}
