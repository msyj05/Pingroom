import { useState, type FormEvent, useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, Loader2, Shield } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Logo from '../components/common/Logo'
import RoomCodeDisplay from '../components/room/RoomCodeDisplay'
import { validateRoomCode } from '../services/roomService'

export default function JoinRoom() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const [name, setName] = useState('')
  // Pre-fill code if it exists in the URL (e.g., /join?code=X7K2P9)
  const [code, setCode] = useState(searchParams.get('code')?.toUpperCase() || '')
  const [status, setStatus] = useState<'idle' | 'checking' | 'error'>('idle')

  const nameInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus the name input if the code was pre-filled from a link
  useEffect(() => {
    if (searchParams.get('code') && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [searchParams])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const clean = code.trim().toUpperCase()
    if (!clean || !name.trim()) return

    setStatus('checking')
    const { isValid, roomName } = await validateRoomCode(clean)
    if (isValid) {
      navigate(`/room/${clean}`, { state: { roomName: roomName || 'Chat Room', displayName: name } })
    } else {
      setStatus('error')
    }
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

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-10">
        <div className="grid overflow-hidden rounded-xl2 shadow-panel lg:grid-cols-2">
          <div className="relative overflow-hidden bg-ink p-8 text-white sm:p-10">
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight">
              Got a code or link?
              <br />
              You are one tap away.
            </h1>
            <p className="mt-4 max-w-sm text-white/70">
              Enter your name and the 6-character room code to jump right in.
            </p>

            <div className="mt-8">
              <RoomCodeDisplay value={code} variant="accent" size="md" />
            </div>

            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-lime/10" />

            <p className="relative mt-10 flex items-center gap-2 text-xs text-white/60">
              <Shield size={13} />
              No account needed — just a nickname.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-10">
            <h2 className="font-display text-xl font-extrabold text-ink">
              Join a room
            </h2>
            <p className="mt-1 text-sm text-muted">
              Enter your name and the room code.
            </p>

            <label className="mt-6 block">
              <span className="text-sm font-bold text-ink">
                Your display name
              </span>
              <div className="mt-2 flex items-center rounded-2xl ring-1 ring-line focus-within:ring-2 focus-within:ring-ink">
                <input
                  ref={nameInputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your display name"
                  className="flex-1 bg-transparent px-4 py-3.5 text-base text-ink placeholder:text-muted focus:outline-none"
                />
              </div>
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-bold text-ink">Room code</span>
              <div
                className={`mt-2 flex items-center rounded-2xl ring-1 focus-within:ring-2 ${
                  status === "error"
                    ? "ring-danger focus-within:ring-danger"
                    : "ring-line focus-within:ring-ink"
                }`}
              >
                <input
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setStatus("idle");
                  }}
                  placeholder="Enter room code"
                  maxLength={6}
                  className="flex-1 bg-transparent px-4 py-3.5 text-base uppercase tracking-widest text-ink placeholder:normal-case placeholder:tracking-normal placeholder:text-muted focus:outline-none"
                />
              </div>
              {status === "error" && (
                <p className="mt-2 text-xs font-medium text-danger">
                  The code doesn't match any live room. Check for typos (0 vs O,
                  1 vs I) and try again.
                </p>
              )}
            </label>

            <button
              type="submit"
              disabled={!code.trim() || !name.trim() || status === "checking"}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-sm font-bold text-white transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:bg-muted"
            >
              {status === "checking" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowRight size={16} />
              )}
              Join room
            </button>

            {status === "checking" && (
              <p className="mt-4 flex items-center gap-2 rounded-xl bg-lime-50 px-4 py-3 text-sm font-medium text-ink">
                <Loader2 size={14} className="animate-spin" />
                Connecting as {name}... verifying code with the room host.
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}