import { supabase } from '../lib/supabase'
import { generateRoomCode } from '../lib/utils'
import type { Duration } from '../types'

export interface CreateRoomInput {
  roomName: string
  displayName: string
  duration: Duration
}

export interface CreateRoomResult {
  code: string
  roomName: string
}

const DEMO_VALID_CODE = 'X7K2P9'

export async function createRoom({ roomName, duration }: CreateRoomInput): Promise<CreateRoomResult> {
  const db = supabase
  if (!db) {
    return { code: generateRoomCode(), roomName: roomName.trim() || 'Untitled room' }
  }

  const code = generateRoomCode()
  const now = new Date()
  const expiresAt = new Date(now)

  if (duration === '1 hour') expiresAt.setHours(now.getHours() + 1)
  else if (duration === '24 hours') expiresAt.setDate(now.getDate() + 1)
  else if (duration === '7 days') expiresAt.setDate(now.getDate() + 7)

  const { error } = await db.from('rooms').insert({
    code,
    name: roomName.trim() || 'Untitled room',
    duration,
    expires_at: expiresAt.toISOString(),
  })

  if (error) throw error

  return { code, roomName: roomName.trim() || 'Untitled room' }
}

export async function validateRoomCode(code: string): Promise<{ isValid: boolean; roomName: string }> {
  const db = supabase
  if (!db) {
    const isValid = code.trim().toUpperCase() === DEMO_VALID_CODE
    return { isValid, roomName: isValid ? 'Demo Room' : '' }
  }

  const { data, error } = await db
    .from('rooms')
    .select('name')
    .eq('code', code.trim().toUpperCase())
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) {
    return { isValid: false, roomName: '' }
  }

  return { isValid: true, roomName: data.name }
}
