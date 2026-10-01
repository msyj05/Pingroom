import { useState, useRef, useMemo } from 'react'
import { Play, Pause } from 'lucide-react'

interface VoiceMessageProps {
  src: string
  duration: number
  variant: 'own' | 'received'
}

export default function VoiceMessage({ src, duration, variant }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Generate waveform bars once using useMemo to avoid impure function calls during render
  const waveformBars = useMemo(() => {
    // Use a seed-based approach for consistent waveform
    return Array.from({ length: 30 }, (_, i) => {
      // Create a deterministic pattern using sine wave + index-based variation
      const baseHeight = Math.sin(i * 0.5) * 0.5 + 0.5
      const variation = Math.sin(i * 1.3) * 0.2 + Math.sin(i * 0.7) * 0.1
      return Math.max(0.2, Math.min(1, baseHeight + variation))
    })
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="relative">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
      />
      
      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
        variant === 'own' 
          ? 'bg-white/10 backdrop-blur-sm' 
          : 'bg-cream'
      }`}>
        {/* Play/Pause Button - Smaller */}
        <button
          onClick={togglePlay}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
            variant === 'own'
              ? 'bg-lime text-ink hover:bg-lime-dark'
              : 'bg-ink text-lime hover:bg-ink-800'
          }`}
        >
          {isPlaying ? (
            <Pause size={14} fill="currentColor" />
          ) : (
            <Play size={14} fill="currentColor" className="ml-0.5" />
          )}
        </button>

        {/* Waveform - Smaller bars */}
        <div className="flex flex-1 items-center gap-0.5">
          {waveformBars.map((height, i) => {
            const isActive = progress > (i / waveformBars.length) * 100
            return (
              <div
                key={i}
                className={`w-0.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? variant === 'own'
                      ? 'bg-lime'
                      : 'bg-ink'
                    : variant === 'own'
                    ? 'bg-white/30'
                    : 'bg-muted/40'
                }`}
                style={{
                  height: `${height * 16}px`, // Reduced from 24px to 16px
                }}
              />
            )
          })}
        </div>

        {/* Duration - Smaller text */}
        <span className={`shrink-0 font-mono text-xs font-medium tabular-nums ${
          variant === 'own' ? 'text-white/80' : 'text-muted'
        }`}>
          {formatTime(currentTime || duration)}
        </span>
      </div>
    </div>
  )
}