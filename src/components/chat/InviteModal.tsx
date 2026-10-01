import { useState } from 'react'
import { Check, Copy, MessageCircle, Share2, X, Link as LinkIcon } from 'lucide-react'

interface InviteModalProps {
  code: string
  onClose: () => void
}

export default function InviteModal({ code, onClose }: InviteModalProps) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Generate the shareable link with the code embedded
  const shareLink = `${window.location.origin}/join?code=${code}`

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 1500)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 1500)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Join my chat room! Click here: ${shareLink} (or use code: ${code})`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const handleSMS = () => {
    const text = encodeURIComponent(`Join my chat room! Click here: ${shareLink} (or use code: ${code})`)
    window.location.href = `sms:?body=${text}`
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Pingroom',
          text: `Join my chat room!`,
          url: shareLink,
        })
        onClose()
      } catch (err) {
        console.error('Share canceled or failed:', err)
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-panel" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-display text-lg font-extrabold text-ink">Invite to room</h3>
          <button onClick={onClose} className="rounded-full p-1 transition hover:bg-cream">
            <X size={20} className="text-muted" />
          </button>
        </div>

        {/* Share Link Section */}
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold text-ink">Share this link</p>
          <div className="flex items-center gap-2 rounded-xl bg-cream p-2 ring-1 ring-line">
            <div className="flex-1 truncate text-sm text-muted px-2">
              {shareLink}
            </div>
            <button
              onClick={handleCopyLink}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-ink ring-1 ring-line transition hover:bg-lime hover:text-ink"
            >
              {copiedLink ? <Check size={14} /> : <LinkIcon size={14} />}
              {copiedLink ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Room Code Section */}
        <div className="mb-6 text-center">
          <p className="mb-2 text-sm font-semibold text-ink">Or share this code</p>
          <div className="flex items-center justify-center gap-3 rounded-xl bg-cream p-4 ring-1 ring-line">
            <span className="font-mono text-3xl font-extrabold tracking-widest text-ink">{code}</span>
            <button
              onClick={handleCopyCode}
              className="rounded-lg bg-white p-2 text-ink ring-1 ring-line transition hover:bg-lime hover:text-ink"
              aria-label="Copy code"
            >
              {copiedCode ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white transition hover:opacity-90"
          >
            <MessageCircle size={18} />
            WhatsApp
          </button>

          <button
            onClick={handleSMS}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 text-sm font-bold text-white transition hover:opacity-90"
          >
            <MessageCircle size={18} />
            SMS
          </button>

          <button
            onClick={handleNativeShare}
            className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-ink py-3 text-sm font-bold text-white transition hover:bg-ink-800"
          >
            <Share2 size={18} />
            More options
          </button>
        </div>
      </div>
    </div>
  )
}