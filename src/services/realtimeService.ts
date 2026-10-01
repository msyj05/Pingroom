import { supabase } from '../lib/supabase'
import type { Member } from '../types'

export interface RealtimeCallbacks {
  onMemberJoin?: (member: Member) => void
  onMemberLeave?: (memberId: string) => void
}

interface DBMemberRow {
  member_id: string
  name: string
  color: string
}

export function subscribeToRoomPresence(roomCode: string, callbacks: RealtimeCallbacks): () => void {
  const db = supabase
  if (!db) return () => {}

  const channelName = `members_db:${roomCode}:${crypto.randomUUID()}`
  const channel = db
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_members', filter: `room_code=eq.${roomCode}` },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const data = payload.new as DBMemberRow
          callbacks.onMemberJoin?.({
            id: data.member_id,
            name: data.name,
            color: data.color as Member['color'],
            status: 'online',
          })
        } else if (payload.eventType === 'DELETE') {
          const data = payload.old as DBMemberRow
          callbacks.onMemberLeave?.(data.member_id)
        }
      },
    )
    .subscribe()

  return () => {
    db.removeChannel(channel)
  }
}
