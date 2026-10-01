import { useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Member } from '../types'

interface TypingPayload {
  userId: string
  name: string
  isTyping: boolean
}

/**
 * Broadcasts "typing" events for the current user and listens for other
 * members' typing events on the same room. No-ops if Supabase isn't
 * configured. Reuses a single channel for both listening and sending
 * (rather than opening a new one on every keystroke).
 */
export function useTypingIndicator(roomCode: string, currentUser: Member) {
  const [typingName, setTypingName] = useState<string | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTypingNotification = useRef(0)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!supabase) return

    const channel = supabase.channel(`typing:${roomCode}`)
    channelRef.current = channel

    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, name, isTyping } = payload.payload as TypingPayload

        if (userId === currentUser.id) return

        if (isTyping) {
          setTypingName(name)
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => setTypingName(null), 3000)
        } else {
          setTypingName(null)
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
      channelRef.current = null
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [roomCode, currentUser.id])

  function notifyTyping() {
    if (!channelRef.current) return

    // Throttle: only broadcast once per second to avoid flooding the channel
    const now = Date.now()
    if (now - lastTypingNotification.current < 1000) return
    lastTypingNotification.current = now

    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: currentUser.id, name: currentUser.name, isTyping: true } satisfies TypingPayload,
    })
  }

  return { typingName, notifyTyping }
}
