import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '../../lib/utils'

interface CodeChipProps {
  code: string
  variant?: 'light' | 'dark'
  className?: string
}

export default function CodeChip({ code, variant = 'dark', className }: CodeChipProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // clipboard not available — fail silently, UI still confirms visually
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const isDark = variant === 'dark'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-2xl px-1.5 py-1.5 font-display font-bold',
        isDark ? 'bg-ink text-white' : 'bg-white text-ink ring-1 ring-line',
        className,
      )}
    >
      <span className="px-2 tracking-[0.15em]">{code}</span>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 rounded-xl bg-lime px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-lime-dark"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
