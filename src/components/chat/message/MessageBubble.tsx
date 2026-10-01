import { useRef, useState, useEffect } from "react";
import { CheckCheck, Clock } from "lucide-react";
import Avatar from "../../common/Avatar";
import VoiceMessage from "./VoiceMessage";
import FileAttachment from "./FileAttachment";
import ReplyPreview from "./ReplyPreview";
import MessageActions from "./MessageActions";
import type { ChatMessage } from "../../../types";

interface MessageBubbleProps {
  message: ChatMessage;
  isGrouped?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, newText: string) => void;
  onReply?: (message: ChatMessage) => void;
  onImageClick?: (url: string) => void;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
}

export default function MessageBubble({
  message,
  isGrouped = false,
  onDelete,
  onEdit,
  onReply,
  onImageClick,
  openMenuId,
  setOpenMenuId,
}: MessageBubbleProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || "");
  const [confirmingDelete, setConfirmingDelete] = useState(false); // NEW: Delete confirmation state

  const isOwn = message.isOwn;
  const isMenuOpen = openMenuId === message.id;

  // NEW: Fix cursor position when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
        editText.length;
    }
  }, [isEditing, editText.length]);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      if (!isEditing && !confirmingDelete) setOpenMenuId(message.id);
    }, 400);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editText.trim() && onEdit) {
      onEdit(message.id, editText.trim());
      setIsEditing(false);
    }
  };

  if (message.kind === "system") {
    return (
      <div className="flex justify-center py-1">
        <span className="rounded-full bg-line/60 px-4 py-1.5 text-xs font-medium text-muted">
          {message.systemText}
        </span>
      </div>
    );
  }

  if (message.isDeleted) {
    return (
      <div
        className={`flex items-start gap-3 py-1.5 ${isOwn ? "flex-row-reverse" : ""}`}
      >
        {!isOwn && (
          <Avatar
            name={message.authorName ?? "?"}
            color={message.color ?? "purple"}
            size="sm"
          />
        )}
        <div
          className={`flex max-w-[80%] flex-col ${isOwn ? "items-end" : "items-start"}`}
        >
          {!isOwn && (
            <div className="mb-1 flex items-baseline gap-2 pl-1">
              <span className="text-sm font-bold text-ink">
                {message.authorName}
              </span>
            </div>
          )}
          <div
            className={`rounded-2xl px-4 py-3 text-[15px] italic leading-snug ${isOwn ? "rounded-tr-md bg-ink/50 text-white/50" : "rounded-tl-md bg-white text-muted ring-1 ring-line"}`}
          >
            This message was deleted
          </div>
        </div>
      </div>
    );
  }


  // --- RECEIVED MESSAGE LAYOUT ---
  if (!isOwn) {
    return (
      <div
        className={`group relative flex items-start py-1.5 ${isGrouped ? "mt-1" : "mt-4"}`}
      >
        {isGrouped ? (
          <div className="w-8 shrink-0" />
        ) : (
          <Avatar
            name={message.authorName ?? "?"}
            color={message.color ?? "purple"}
            size="sm"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          {!isGrouped && (
            <div className="flex items-baseline gap-2 pl-1">
              <span className="text-xs font-bold text-ink">
                {message.authorName}
              </span>
            </div>
          )}

          <div
            className={`relative select-none px-4 py-3 ring-1 ring-line ${isGrouped ? "rounded-2xl" : "rounded-2xl rounded-tl-md"} bg-white`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onTouchCancel={handleTouchEnd}
          >
            <ReplyPreview message={message} own={false} />
            <div className="flex flex-wrap items-end gap-x-2 gap-y-0.5">
              <span className="whitespace-pre-wrap wrap-break-word text-[15px] leading-snug text-ink">
                {message.audioUrl && message.duration ? (
                  <VoiceMessage
                    src={message.audioUrl}
                    duration={message.duration}
                    variant="received"
                  />
                ) : message.fileUrl ? (
                  <FileAttachment
                    message={message}
                    isOwn={false}
                    onImageClick={onImageClick}
                  />
                ) : (
                  message.text
                )}
              </span>
              <span className="ml-auto shrink-0 self-end text-[10px] text-muted">
                {message.time}
              </span>
            </div>
            {onReply && (
              <MessageActions
                open={isMenuOpen}
                onOpenChange={(isOpen) =>
                  setOpenMenuId(isOpen ? message.id : null)
                }
                onReply={() => onReply?.(message)}
                // Receivers can't delete, so we don't pass onDelete here
                onCopy={message.text ? handleCopy : undefined}
                hideTriggerOnMobile={true}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- SENDER'S MESSAGE LAYOUT ---
  return (
    <div
      className={`group relative flex flex-col items-end gap-1 py-1.5 pr-2 ${isGrouped ? "mt-1" : "mt-4 pt-2"}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchCancel={handleTouchEnd}
    >
      <div
        className={`relative max-w-[80%] select-none px-4 py-3 ${isGrouped ? "rounded-2xl" : "rounded-2xl rounded-tr-md"} bg-ink`}
      >
        <ReplyPreview message={message} own />

        {isEditing ? (
          // EDIT MODE UI
          <form
            onSubmit={handleSaveEdit}
            className="relative w-full rounded-xl bg-white/10 p-3 ring-1 ring-white/20"
          >
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full resize-none bg-transparent text-[15px] leading-snug text-white placeholder:text-white/40 focus:outline-none"
              rows={2}
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!editText.trim()}
                className="rounded-lg bg-lime px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-lime-dark disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </form>
        ) : confirmingDelete ? (
          // NEW: DELETE CONFIRMATION UI
          <div className="relative w-full rounded-xl bg-white/10 p-3 ring-1 ring-white/20">
            <p className="mb-3 text-sm text-white">Delete this message?</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(message.id)}
                className="rounded-lg bg-danger px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          // NORMAL VIEW MODE UI
          <div className="flex flex-wrap items-end gap-x-2 gap-y-0.5">
            <span className="whitespace-pre-wrap wrap-break-word text-[15px] leading-snug text-white">
              {message.audioUrl && message.duration ? (
                <VoiceMessage
                  src={message.audioUrl}
                  duration={message.duration}
                  variant="own"
                />
              ) : message.fileUrl ? (
                <FileAttachment
                  message={message}
                  isOwn
                  onImageClick={onImageClick}
                />
              ) : (
                message.text
              )}
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-1 self-end text-[10px] text-white/60">
              <span>{message.time}</span>
              {message.isEdited && (
                <span className="text-[9px] opacity-70">(edited)</span>
              )}
              {message.status === "sending" ? (
                <Clock size={10} />
              ) : (
                <CheckCheck size={11} className="text-lime" />
              )}
            </span>
          </div>
        )}

        {(onDelete || onReply || onEdit) && (
          <MessageActions
            open={isMenuOpen}
            onOpenChange={(isOpen) => setOpenMenuId(isOpen ? message.id : null)}
            onEdit={message.text ? () => setIsEditing(true) : undefined}
            onReply={() => onReply?.(message)}
            // UPDATED: Trigger confirmation instead of immediate delete
            onDelete={() => setConfirmingDelete(true)}
            onCopy={message.text ? handleCopy : undefined}
            hideTriggerOnMobile={true}
          />
        )}
      </div>
    </div>
  );
}
