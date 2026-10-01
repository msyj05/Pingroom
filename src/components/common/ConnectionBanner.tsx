import { WifiOff } from 'lucide-react'

export default function ConnectionBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center gap-3 bg-ink px-4 py-2.5 text-sm text-white">
      <WifiOff size={15} className="text-lime" />
      <span>Connection lost — retrying...</span>
      <button
        onClick={onRetry}
        className="rounded-lg bg-lime px-3 py-1 text-xs font-bold text-ink transition hover:bg-lime-dark"
      >
        Retry now
      </button>
    </div>
  )
}
