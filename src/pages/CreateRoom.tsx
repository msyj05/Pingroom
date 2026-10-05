import { useState, useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/common/Logo'
import RoomForm from '../components/room/RoomForm'
import RoomPreview from '../components/room/RoomPreview'
import { createRoom } from '../services/roomService'
import type { Duration } from '../types'

export default function CreateRoom() {
  const navigate = useNavigate()
  const [roomName, setRoomName] = useState('')
  const [name, setName] = useState('')
  const [duration, setDuration] = useState<Duration>('24 hours')
  const [code, setCode] = useState<string | null>(null)
  const [confirmedRoomName, setConfirmedRoomName] = useState('')
  const [copied, setCopied] = useState(false)

  const previewRef = useRef<HTMLDivElement>(null) // <-- ADDED

  const canGenerate = name.trim().length > 0

  async function handleGenerate() {
    if (!canGenerate) return;
    const room = await createRoom({ roomName, displayName: name, duration });
    setCode(room.code);
    setConfirmedRoomName(room.roomName);

    // Scroll the preview into view on small screens only.
    // The layout is single-column below lg, so on desktop the preview
    // is already visible next to the form and scrolling would feel odd.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setTimeout(() => {
        previewRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50); // wait a tick so the preview renders with the code first
    }
  }

  

  async function handleCopy() {
    if (!code) return
    await navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6 sm:py-8">
        <Logo />
        <Link
          to="/"
          aria-label="Back to welcome"
          className="flex shrink-0 items-center gap-2 rounded-full bg-white p-3 text-sm font-bold text-ink ring-1 ring-line transition hover:bg-line sm:px-5 sm:py-2.5"
        >
          <ArrowLeft size={18} className="shrink-0" />
          <span className="hidden sm:inline">Back to welcome</span>
        </Link>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 pb-24 pt-6 lg:grid-cols-2 lg:items-start">
        <RoomForm
          roomName={roomName}
          onRoomNameChange={setRoomName}
          displayName={name}
          onDisplayNameChange={setName}
          duration={duration}
          onDurationChange={setDuration}
          canGenerate={canGenerate}
          onGenerate={handleGenerate}
        />

        <div ref={previewRef} className="space-y-6 scroll-mt-6">
          <RoomPreview code={code} copied={copied} onCopy={handleCopy} />

          <button
            onClick={() =>
              code &&
              navigate(`/room/${code}`, {
                state: { roomName: confirmedRoomName, displayName: name },
              })
            }
            disabled={!code}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-success py-4 text-sm font-bold text-white transition hover:bg-success-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            Enter chat
            <ArrowLeft size={16} className="rotate-180" />
          </button>
        </div>
      </main>
    </div>
  );
}
