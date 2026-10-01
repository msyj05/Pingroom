import { LogOut, Users } from 'lucide-react' // <-- Added Mic
import Avatar from '../common/Avatar'

interface MobileChatHeaderProps {
  roomName: string
  memberCount: number
  typingName?: string | null
  recordingName?: string | null // <-- ADDED
  onBack: () => void
  onShowMembers: () => void
  onRequestLeave: () => void
}

export default function MobileChatHeader({
  roomName,
  memberCount,
  typingName,
  recordingName,
  onShowMembers,
  onRequestLeave,
}: MobileChatHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 bg-ink px-3 py-2 text-white lg:hidden">
      <div className="flex min-w-0 items-center gap-2">
        <Avatar name={roomName} color="lime" status="online" size="md" />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate font-display text-base font-bold">
            {roomName} <span className="h-2 w-2 rounded-full bg-success" />
          </p>
          <p className="text-xs text-white/60">
            {memberCount} online
            {recordingName ? (
              <span className="font-medium text-lime">
                {" "}
                · {recordingName} is recording...
              </span>
            ) : typingName ? (
              <span className="font-medium text-lime">
                {" "}
                · {typingName} is typing...
              </span>
            ) : null}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={onShowMembers}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
          aria-label="Show members"
        >
          <Users size={17} />
        </button>
        <button
          onClick={onRequestLeave}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
          aria-label="Leave room"
        >
          <LogOut size={17} className="text-danger" />
        </button>
      </div>
    </div>
  );
}