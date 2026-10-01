import { useCallback, useEffect, useRef, useState } from 'react'
import { uploadVoiceNote } from '../services/mediaService'

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

interface UseVoiceRecorderOptions {
  onSend: (payload: { audioUrl: string; duration: number }) => void
  onCancel: () => void
}

export function useVoiceRecorder({ onSend, onCancel }: UseVoiceRecorderOptions) {
  const [isPaused, setIsPaused] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  const [audioData, setAudioData] = useState<number[]>(() => new Array(30).fill(0))

  const onSendRef = useRef(onSend)
  const onCancelRef = useRef(onCancel)
  const recordTimeRef = useRef(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cancelledRef = useRef(false)
  const pausedRef = useRef(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => { onSendRef.current = onSend }, [onSend])
  useEffect(() => { onCancelRef.current = onCancel }, [onCancel])

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    timerRef.current = setInterval(() => {
      recordTimeRef.current += 1
      setRecordTime(recordTimeRef.current)
    }, 1000)
  }, [stopTimer])

  const stopVisualizer = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    animationFrameRef.current = null
    if (audioContextRef.current) void audioContextRef.current.close()
    audioContextRef.current = null
    analyserRef.current = null
  }, [])

  const cleanup = useCallback(() => {
    stopTimer()
    stopVisualizer()
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    mediaRecorderRef.current = null
  }, [stopTimer, stopVisualizer])

  useEffect(() => {
    let active = true

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (!active) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        chunksRef.current = []
        cancelledRef.current = false
        pausedRef.current = false
        recordTimeRef.current = 0
        setRecordTime(0)
        setIsPaused(false)

        const recorder = new MediaRecorder(stream)
        mediaRecorderRef.current = recorder

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data)
        }

        recorder.onstop = async () => {
          const shouldSend = !cancelledRef.current && chunksRef.current.length > 0
          const mimeType = recorder.mimeType || 'audio/webm'
          const blob = new Blob(chunksRef.current, { type: mimeType })
          cleanup()

          if (!shouldSend) return

          setIsUploading(true)
          try {
            const audioUrl = await uploadVoiceNote(blob)
            onSendRef.current({ audioUrl, duration: recordTimeRef.current })
          } catch (error) {
            console.error('Voice note upload failed:', error)
            alert('Failed to upload voice note.')
          } finally {
            setIsUploading(false)
          }
        }

        const AudioContextClass = window.AudioContext || window.webkitAudioContext
        if (AudioContextClass) {
          const audioContext = new AudioContextClass()
          const analyser = audioContext.createAnalyser()
          analyser.fftSize = 256
          analyser.smoothingTimeConstant = 0.8
          audioContext.createMediaStreamSource(stream).connect(analyser)
          audioContextRef.current = audioContext
          analyserRef.current = analyser

          const animate = () => {
            if (!analyserRef.current || pausedRef.current) return
            const data = new Uint8Array(analyserRef.current.frequencyBinCount)
            analyserRef.current.getByteFrequencyData(data)
            setAudioData(Array.from({ length: 30 }, (_, i) => {
              const index = Math.floor((i / 30) * data.length)
              return Math.max(0.1, (data[index] / 255) * (0.8 + Math.random() * 0.4))
            }))
            animationFrameRef.current = requestAnimationFrame(animate)
          }
          animationFrameRef.current = requestAnimationFrame(animate)
        }

        recorder.start()
        startTimer()
      } catch (error) {
        console.error('Microphone access denied or unavailable:', error)
        alert('Please allow microphone access to use voice notes.')
        onCancelRef.current()
      }
    }

    void start()
    return () => {
      active = false
      cancelledRef.current = true
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      } else {
        cleanup()
      }
    }
  }, [cleanup, startTimer])

  const togglePause = () => {
    const recorder = mediaRecorderRef.current
    if (!recorder) return
    if (isPaused) {
      recorder.resume()
      pausedRef.current = false
      setIsPaused(false)
      startTimer()
    } else {
      recorder.pause()
      pausedRef.current = true
      setIsPaused(true)
      stopTimer()
      stopVisualizer()
    }
  }

  const send = () => {
    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === 'inactive') return
    stopTimer()
    pausedRef.current = true
    stopVisualizer()
    recorder.stop()
  }

  const cancel = () => {
    cancelledRef.current = true
    stopTimer()
    pausedRef.current = true
    stopVisualizer()
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') recorder.stop()
    onCancelRef.current()
  }

  return { isPaused, isUploading, recordTime, audioData, togglePause, send, cancel }
}
