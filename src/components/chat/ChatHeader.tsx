import { LogOut, Users } from 'lucide-react'
import Avatar from "../common/Avatar";
import type { Member } from '../../types'

interface ChatHeaderProps {
  roomName: string
  members: Member[]
  typingName?: string | null
  recordingName?: string | null
  onToggleMembers: () => void
  onRequestLeave: () => void
}

export default function ChatHeader({ roomName, members, typingName, recordingName, onToggleMembers, onRequestLeave }: ChatHeaderProps) {
  const onlineCount = members.filter((m) => m.status !== 'offline').length

  return (
    <div className="flex items-center justify-between gap-4 bg-ink px-6 py-4 text-white">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={roomName} color="lime" status="online" size="md" />
        <div className="min-w-0">
          <h1 className="truncate font-display text-lg font-extrabold">
            {roomName}
          </h1>
          <p className="truncate text-xs text-white/60">
            <span className="text-lime">●</span> {onlineCount} online
            {recordingName ? (
              <span className="font-medium text-lime">
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

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMembers}
          className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"
        >
          <Users size={16} />
          Members
          <span className="rounded-full bg-lime px-1.5 py-0.5 text-xs font-bold text-ink">
            {members.length}
          </span>
        </button>
        <button
          onClick={onRequestLeave}
          className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-bold text-danger transition hover:bg-danger/20"
        >
          <LogOut size={16} />
          Leave
        </button>
      </div>
    </div>
  );
}