import { Pause, Play, Send, Trash2 } from 'lucide-react'
import { useVoiceRecorder } from '../../../hooks/useVoiceRecorder'

interface VoiceRecorderProps {
  onSend: (payload: { audioUrl: string; duration: number }) => void
  onCancel: () => void
}

export default function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const { isPaused, isUploading, recordTime, audioData, togglePause, send, cancel } = useVoiceRecorder({ onSend, onCancel })

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

  if (isUploading) {
    return <div className="flex w-full items-center justify-center gap-3 rounded-2xl bg-ink px-5 py-4 text-white"><div className="h-4 w-4 animate-spin rounded-full border-2 border-lime border-t-transparent" /><span className="text-sm font-medium">Uploading...</span></div>
  }

  return (
    <div className="w-full rounded-2xl bg-ink p-4 text-white shadow-lg ring-1 ring-white/5">
      <div className="mb-4 flex w-full items-center gap-4">
        <div className="w-14 shrink-0 font-mono text-xl font-bold tabular-nums">{formatTime(recordTime)}</div>
        <div className="flex h-6 flex-1 items-center justify-center gap-0.5">
          {audioData.map((height, i) => <div key={i} className={`w-0.5 rounded-full transition-all duration-75 ${height > 0.3 ? 'bg-lime' : 'bg-white/20'}`} style={{ height: `${Math.max(3, height * 20)}px` }} />)}
        </div>
      </div>
      <div className="flex w-full items-center gap-2">
        <button onClick={cancel} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/20 text-danger transition hover:bg-danger/30" aria-label="Cancel recording"><Trash2 size={18} /></button>
        <button onClick={togglePause} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-white/10 text-sm font-semibold transition hover:bg-white/20">{isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}{isPaused ? 'Resume' : 'Pause'}</button>
        <button onClick={send} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime text-ink transition hover:bg-lime-dark" aria-label="Send voice note"><Send size={18} /></button>
      </div>
    </div>
  )
}
