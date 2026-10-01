import { useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Member } from '../types'

interface RecordingPayload {
  userId: string
  name: string
  isRecording: boolean
}

export function useVoiceRecordingIndicator(roomCode: string, currentUser: Member) {
  const [recordingName, setRecordingName] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!supabase) return

    const channel = supabase.channel(`voice-recording:${roomCode}`)
    channelRef.current = channel

    channel
      .on('broadcast', { event: 'recording' }, (payload) => {
        const { userId, name, isRecording } = payload.payload as RecordingPayload

        // Ignore our own recording events
        if (userId === currentUser.id) return

        if (isRecording) {
          setRecordingName(name)
          // Fallback timeout: clear the indicator after 10s in case the stop event is missed (e.g., network drop)
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          timeoutRef.current = setTimeout(() => setRecordingName(null), 10000)
        } else {
          setRecordingName(null)
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
      channelRef.current = null
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [roomCode, currentUser.id])

  const notifyRecording = (isRecording: boolean) => {
    if (!channelRef.current) return
    channelRef.current.send({
      type: 'broadcast',
      event: 'recording',
      payload: { userId: currentUser.id, name: currentUser.name, isRecording } satisfies RecordingPayload,
    })
  }

  return { recordingName, notifyRecording }
}