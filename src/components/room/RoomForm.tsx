import { Lock, Plus, Sparkles } from 'lucide-react'
import type { Duration } from '../../types'

const DURATIONS: Duration[] = ['1 hour', '24 hours', '7 days']

interface RoomFormProps {
  roomName: string
  onRoomNameChange: (value: string) => void
  displayName: string
  onDisplayNameChange: (value: string) => void
  duration: Duration
  onDurationChange: (value: Duration) => void
  canGenerate: boolean
  onGenerate: () => void
}

export default function RoomForm({
  roomName,
  onRoomNameChange,
  displayName,
  onDisplayNameChange,
  duration,
  onDurationChange,
  canGenerate,
  onGenerate,
}: RoomFormProps) {
  return (
    <div className="rounded-xl2 bg-white p-8 shadow-soft">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime text-ink">
          <Plus size={22} />
        </span>
        <div>
          <h1 className="font-display text-xl font-extrabold text-ink">Create a room</h1>
          <p className="text-sm text-muted">No email / password needed.</p>
        </div>
      </div>

      <label className="mt-8 block">
        <span className="text-sm font-bold text-ink">Room name</span>
        <div className="mt-2 flex items-center rounded-2xl ring-1 ring-line focus-within:ring-2 focus-within:ring-ink">
          <input
            value={roomName}
            onChange={(e) => onRoomNameChange(e.target.value)}
            placeholder="Enter room name"
            className="flex-1 bg-transparent px-4 py-3.5 text-base text-ink placeholder:text-muted focus:outline-none"
          />
        </div>
      </label>

      <label className="mt-6 block">
        <span className="text-sm font-bold text-ink">Your display name</span>
        <div className="mt-2 flex items-center rounded-2xl ring-1 ring-line focus-within:ring-2 focus-within:ring-ink">
          <input
            value={displayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            placeholder="Enter a name"
            className="flex-1 bg-transparent px-4 py-3.5 text-base text-ink placeholder:text-muted focus:outline-none"
          />
        </div>
      </label>

      <div className="mt-6">
        <span className="text-sm font-bold text-ink">Room duration</span>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => onDurationChange(d)}
              className={`rounded-2xl py-3.5 text-sm font-bold transition ${
                duration === d
                  ? 'bg-lime text-ink ring-2 ring-ink'
                  : 'bg-white text-ink ring-1 ring-line hover:bg-cream'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-sm font-bold text-white transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Sparkles size={16} />
        Generate room code
      </button>

      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
        <Lock size={12} />
        End-to-end encrypted · Auto-deletes after expiry
      </p>
    </div>
  )
}
