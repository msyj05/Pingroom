import { supabase } from '../lib/supabase'
import type { ChatMessage } from '../types'

interface DBMessageRow {
  id: string
  author_id: string
  author_name: string
  color: string
  content: string
  audio_url: string | null
  duration: number | null
  file_url: string | null
  file_name: string | null
  created_at: string
  reply_to_id: string | null
  reply_to_text: string | null
  reply_to_author: string | null
  is_edited: boolean | null // <-- ADDED

}

function mapMessage(row: DBMessageRow, currentUserId: string): ChatMessage {
  const isDeleted = row.content === 'This message was deleted'
  return {
    id: row.id,
    kind: 'message',
    authorId: row.author_id,
    authorName: row.author_name,
    color: row.color as ChatMessage['color'],
    text: isDeleted ? undefined : row.content || undefined,
    audioUrl: isDeleted ? undefined : row.audio_url || undefined,
    duration: isDeleted ? undefined : row.duration || undefined,
    fileUrl: isDeleted ? undefined : row.file_url || undefined,
    fileName: isDeleted ? undefined : row.file_name || undefined,
    time: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    isOwn: row.author_id === currentUserId,
    status: 'sent',
    isDeleted,
    replyToId: row.reply_to_id || undefined,
    replyToText: row.reply_to_text || undefined,
    replyToAuthor: row.reply_to_author || undefined,
    isEdited: row.is_edited || false, // <-- ADDED
  }
}

export async function fetchMessages(roomCode: string, currentUserId: string): Promise<ChatMessage[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('messages').select('id, author_id, author_name, color, content, audio_url, duration, file_url, file_name, created_at, reply_to_id, reply_to_text, reply_to_author').eq('room_code', roomCode).order('created_at', { ascending: true })
  if (error) throw error
  return ((data || []) as DBMessageRow[]).map((row) => mapMessage(row, currentUserId))
}

export async function sendMessage(roomCode: string, message: ChatMessage): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('messages').insert({
    id: message.id,
    room_code: roomCode,
    author_id: message.authorId,
    author_name: message.authorName || 'Unknown',
    color: message.color || 'purple',
    content: message.text || '',
    audio_url: message.audioUrl || null,
    duration: message.duration || null,
    file_url: message.fileUrl || null,
    file_name: message.fileName || null,
    created_at: new Date().toISOString(),
    reply_to_id: message.replyToId || null,
    reply_to_text: message.replyToText || null,
    reply_to_author: message.replyToAuthor || null,
  })
  if (error) throw error
}

export function subscribeToMessages(roomCode: string, currentUserId: string, onMessage: (message: ChatMessage) => void): () => void {
  if (!supabase) return () => {}
  const channel = supabase.channel(`messages:${roomCode}:${crypto.randomUUID()}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_code=eq.${roomCode}` }, (payload) => onMessage(mapMessage(payload.new as DBMessageRow, currentUserId))).subscribe()
  return () => { void supabase?.removeChannel(channel) }
}

// UPDATED: Pass currentUserId and return the full ChatMessage object
export function subscribeToMessageUpdates(
  roomCode: string, 
  currentUserId: string, 
  onUpdate: (updatedMessage: ChatMessage) => void
): () => void {
  if (!supabase) return () => {}
  
  const channel = supabase
    .channel(`messages-update:${roomCode}:${crypto.randomUUID()}`)
    .on(
      'postgres_changes', 
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'messages', 
        filter: `room_code=eq.${roomCode}` 
      }, 
      (payload) => {
        const row = payload.new as DBMessageRow
        // Map the new database row and send it to the UI
        onUpdate(mapMessage(row, currentUserId))
      }
    )
    .subscribe()
    
  return () => { void supabase?.removeChannel(channel) }
}

// NEW: Edit Message Function
export async function editMessage(messageId: string, newText: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('messages')
    .update({ 
      content: newText,
      is_edited: true 
    })
    .eq('id', messageId)
  if (error) throw error
}

export async function deleteMessage(messageId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('messages').update({ content: 'This message was deleted', audio_url: null, duration: null, file_url: null, file_name: null }).eq('id', messageId)
  if (error) throw error
}
