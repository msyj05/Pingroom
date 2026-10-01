import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ImageLightboxProps {
  src: string
  onClose: () => void
}

export default function ImageLightbox({ src, onClose }: ImageLightboxProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
        aria-label="Close image"
      >
        <X size={20} />
      </button>

      {/* Image Container */}
      <div
        className="relative max-h-[90vh] max-w-[95vw] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
      >
        <img
          src={src}
          alt="Full screen preview"
          className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
        />
      </div>
    </div>
  );
}