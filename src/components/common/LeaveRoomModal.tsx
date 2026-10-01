import { AlertTriangle, X } from 'lucide-react'

interface LeaveRoomModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export default function LeaveRoomModal({ onConfirm, onCancel }: LeaveRoomModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-panel" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-extrabold text-ink">Leave room?</h3>
          <button onClick={onCancel} className="rounded-full p-1 transition hover:bg-cream">
            <X size={20} className="text-muted" />
          </button>
        </div>

        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10">
            <AlertTriangle size={20} className="text-danger" />
          </div>
          <p className="text-sm leading-relaxed text-muted">Are you sure you want to leave this room?</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-xl bg-cream py-3 text-sm font-bold text-ink transition hover:bg-line">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-danger py-3 text-sm font-bold text-white transition hover:opacity-90">
            Yes, leave room
          </button>
        </div>
      </div>
    </div>
  )
}
