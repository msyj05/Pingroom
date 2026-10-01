import { BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-lime">
        <BarChart3 size={20} strokeWidth={2.5} />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-lime ring-2 ring-cream" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-extrabold tracking-tight text-ink">pingroom</span>
        <span className="text-xs text-muted">no account. just chat.</span>
      </span>
    </Link>
  )
}
