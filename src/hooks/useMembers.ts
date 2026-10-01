import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { subscribeToRoomPresence } from '../services/realtimeService'
import type { Member } from '../types'

interface DBMemberRow {
  member_id: string
  name: string
  color: string
}

export function useMembers(roomCode: string, currentUser: Member) {
  const [members, setMembers] = useState<Member[]>([currentUser])
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!supabase) return
    const db = supabase

    const upsertMember = async () => {
      await db.from('room_members').upsert({
        room_code: roomCode,
        member_id: currentUser.id,
        name: currentUser.name,
        color: currentUser.color,
        last_seen: new Date().toISOString(),
      })
    }
    void upsertMember()

    const fetchMembers = async () => {
      const { data } = await db.from('room_members').select('member_id, name, color').eq('room_code', roomCode)

      if (data) {
        const formattedMembers: Member[] = (data as DBMemberRow[]).map((m) => ({
          id: m.member_id,
          name: m.name,
          color: m.color as Member['color'],
          status: 'online',
          isYou: m.member_id === currentUser.id,
        }))
        if (!formattedMembers.some((m) => m.id === currentUser.id)) {
          formattedMembers.unshift(currentUser)
        }
        setMembers(formattedMembers)
      }
    }
    void fetchMembers()

    const unsubscribe = subscribeToRoomPresence(roomCode, {
      onMemberJoin: (member) => {
        setMembers((prev) =>
          prev.some((m) => m.id === member.id) ? prev : [...prev, { ...member, isYou: member.id === currentUser.id }],
        )
      },
      onMemberLeave: (memberId) => {
        setMembers((prev) => prev.filter((m) => m.id !== memberId))
      },
    })

    unsubscribeRef.current = unsubscribe

    return () => {
      unsubscribe()
      void db.from('room_members').delete().eq('room_code', roomCode).eq('member_id', currentUser.id)
    }
  }, [roomCode, currentUser])

  const leaveRoom = async () => {
    if (supabase) {
      await supabase.from('room_members').delete().eq('room_code', roomCode).eq('member_id', currentUser.id)
    }
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
    }
  }

  return { members, leaveRoom }
}
