import { useEffect, useState } from 'react'

/**
 * Tracks the browser's online/offline status so the UI can show a
 * "connection lost" banner. Starts from `navigator.onLine` so a page
 * loaded while offline shows the banner immediately.
 */
export function useConnectionStatus() {
  const [connectionLost, setConnectionLost] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOffline = () => setConnectionLost(true)
    const handleOnline = () => setConnectionLost(false)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return { connectionLost, setConnectionLost }
}
