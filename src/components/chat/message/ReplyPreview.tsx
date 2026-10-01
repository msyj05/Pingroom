import type { ChatMessage } from '../../../types'

export default function ReplyPreview({ message, own = false }: { message: ChatMessage; own?: boolean }) {
  if (!message.replyToId) return null
  return <div className={`mb-1.5 rounded-lg border-l-2 px-3 py-1.5 text-xs ${own ? 'border-lime/50 bg-white/10 text-white/80' : 'border-ink/20 bg-cream text-ink'}`}><span className="font-bold text-lime">{message.replyToAuthor}</span><p className="truncate opacity-80">{message.replyToText}</p></div>
}
