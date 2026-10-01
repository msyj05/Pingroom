import { FileText } from "lucide-react";
import type { ChatMessage } from "../../../types";

interface FileAttachmentProps {
  message: ChatMessage;
  isOwn: boolean;
  onImageClick?: (url: string) => void;
}

export default function FileAttachment({
  message,
  isOwn,
  onImageClick,
}: FileAttachmentProps) {
  if (!message.fileUrl) return null;

  const isImage = message.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i);

  if (isImage) {
    return (
      <div
        onClick={() => onImageClick?.(message.fileUrl!)}
        className="group relative cursor-pointer overflow-hidden rounded-lg"
      >
        <img
          src={message.fileUrl}
          alt={message.fileName || "Attachment"}
          className="max-h-64 w-auto object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Subtle overlay on hover to indicate it's clickable */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
          <span className="rounded-full bg-black/50 p-2 text-white backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </span>
        </div>
      </div>
    );
  }

  // Generic file fallback
  return (
    <a
      href={message.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 rounded-lg p-3 transition hover:opacity-80 ${
        isOwn ? "bg-white/10" : "bg-cream"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          isOwn ? "bg-lime text-ink" : "bg-ink text-lime"
        }`}
      >
        <FileText size={18} />
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="truncate text-sm font-semibold">
          {message.fileName}
        </span>
        <span className="text-xs opacity-70">Click to view/download</span>
      </div>
    </a>
  );
}
