import { supabase } from '../lib/supabase'

export async function uploadChatFile(file: File): Promise<{ fileUrl: string; fileName: string }> {
  if (!supabase) throw new Error('Supabase is not configured.')

  const safeFileName = `${Date.now()}-${crypto.randomUUID()}-${file.name.replace(/\s+/g, '_')}`
  const { error } = await supabase.storage.from('chat-files').upload(safeFileName, file)
  if (error) throw error

  const { data } = supabase.storage.from('chat-files').getPublicUrl(safeFileName)
  return { fileUrl: data.publicUrl, fileName: file.name }
}

export async function uploadVoiceNote(blob: Blob): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured.')

  const fileName = `${Date.now()}-${crypto.randomUUID()}.webm`
  const { error } = await supabase.storage.from('audio-notes').upload(fileName, blob)
  if (error) throw error

  const { data } = supabase.storage.from('audio-notes').getPublicUrl(fileName)
  return data.publicUrl
}
