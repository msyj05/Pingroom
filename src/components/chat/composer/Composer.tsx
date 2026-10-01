import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Lock, Loader2, Mic, Paperclip, Reply, Send, X } from 'lucide-react'
import EmojiPicker from './EmojiPicker'
import VoiceRecorder from './VoiceRecorder'
import { uploadChatFile } from '../../../services/mediaService'
import type { ChatMessage, MessagePayload } from '../../../types'

interface ComposerProps {
  displayName: string
  onSend: (payload: MessagePayload) => void
  onTyping?: () => void
  onRecordingChange?: (isRecording: boolean) => void
  replyingTo?: ChatMessage | null
  onCancelReply?: () => void
}

export default function Composer({ displayName, onSend, onTyping, onRecordingChange, replyingTo, onCancelReply }: ComposerProps) {
  const [value, setValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!value.trim()) return
    onSend({ text: value.trim() })
    setValue('')
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
    onTyping?.()
  }

  const handleStartRecording = () => {
    setIsRecording(true)
    onRecordingChange?.(true)
  }

  const handleStopRecording = (payload: { audioUrl: string; duration: number }) => {
    onSend(payload)
    setIsRecording(false)
    onRecordingChange?.(false)
  }

  const handleCancelRecording = () => {
    setIsRecording(false)
    onRecordingChange?.(false)
  }

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsUploadingFile(true)
    try {
      onSend(await uploadChatFile(file))
    } catch (error) {
      console.error('File upload failed:', error)
      alert('Failed to upload file.')
    } finally {
      setIsUploadingFile(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="relative border-t border-line bg-cream px-4 py-3 sm:px-6 sm:py-4">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,application/pdf,.doc,.docx,.txt"
      />
      {replyingTo && (
        <div className="mb-2 flex items-center gap-3 rounded-2xl border-l-4 border-lime bg-white px-4 py-2 shadow-sm ring-1 ring-line">
          <Reply size={16} className="shrink-0 text-lime" />
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="text-xs font-bold text-ink">
              Replying to {replyingTo.authorName}
            </span>
            <span className="truncate text-sm text-muted">
              {replyingTo.audioUrl
                ? "🎤 Voice message"
                : replyingTo.fileUrl
                  ? `📎 ${replyingTo.fileName}`
                  : replyingTo.isDeleted
                    ? "This message was deleted"
                    : replyingTo.text}
            </span>
          </div>
          <button
            onClick={onCancelReply}
            className="shrink-0 text-muted transition hover:text-ink"
            aria-label="Cancel reply"
          >
            <X size={18} />
          </button>
        </div>
      )}
      {isRecording ? (
        <VoiceRecorder
          onSend={handleStopRecording}
          onCancel={handleCancelRecording}
        />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex w-full min-w-0 items-center gap-0.5 rounded-2xl bg-white px-1.5 py-1.5 ring-1 ring-line sm:gap-1 sm:px-2 sm:py-2"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingFile}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-cream hover:text-ink disabled:opacity-50"
            aria-label="Attach file"
          >
            {isUploadingFile ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Paperclip size={18} />
            )}
          </button>
          <input
            ref={inputRef}
            value={value}
            onChange={handleInputChange}
            placeholder={`Message as ${displayName}...`}
            className="min-w-0 flex-1 bg-transparent px-1.5 py-2 text-[15px] text-ink placeholder:text-muted focus:outline-none sm:px-2"
          />
          <div className="flex h-9 w-9 shrink-0 items-center justify-center">
            <EmojiPicker
              onSelect={(emoji) => {
                setValue((prev) => prev + emoji);
                inputRef.current?.focus();
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleStartRecording}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-cream hover:text-ink"
            aria-label="Start voice recording"
          >
            <Mic size={18} />
          </button>
          <button
            type="submit"
            disabled={!value.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-lime transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>
      )}
      <p className="hidden items-center justify-between pt-2 text-xs text-muted sm:flex">
        <span>
          Chatting as{" "}
          <span className="font-semibold text-ink">{displayName}</span> · no
          account
        </span>
        <span className="flex items-center gap-1">
          <Lock size={11} /> Encrypted
        </span>
      </p>
    </div>
  );
}
