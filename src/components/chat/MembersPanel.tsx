import { useState } from 'react'
import { Share2, X } from 'lucide-react'
import Avatar from '../common/Avatar'
import InviteModal from './InviteModal'
import type { Member } from '../../types'
import { cn } from '../../lib/utils'

interface MembersPanelProps {
  code: string
  members: Member[]
  onClose?: () => void
  className?: string
}

const STATUS_LABEL: Record<Member['status'], string> = {
  online: 'Online now',
  idle: 'Idle 2m',
  offline: 'Offline',
}

export default function MembersPanel({ code, members, onClose, className }: MembersPanelProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  return (
    <>
      <div className={cn('flex h-full flex-col bg-white', className)}>
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="font-display text-xl font-extrabold text-ink">Members · {members.length}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-ink transition hover:bg-line"
              aria-label="Close members panel"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="mt-4 flex-1 overflow-y-auto px-6">
          {members.map((member, i) => (
            <div
              key={member.id}
              className={cn('flex items-center gap-3 py-3', i !== members.length - 1 && 'border-b border-line/70')}
            >
              <Avatar name={member.name} color={member.color} status={member.status} size="md" />
              <div className="flex flex-col">
                <span className="flex items-center gap-2 text-sm font-bold text-ink">
                  {member.name}
                  {member.isYou && (
                    <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] font-semibold text-muted">you</span>
                  )}
                </span>
                <span className="text-xs text-muted">{STATUS_LABEL[member.status]}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 pt-4">
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 text-sm font-bold text-white transition hover:bg-ink-800"
          >
            <Share2 size={16} />
            Invite more
          </button>
          <p className="pt-3 text-center text-xs text-muted">Rooms hold up to 8 people</p>
        </div>
      </div>

      {isInviteOpen && <InviteModal code={code} onClose={() => setIsInviteOpen(false)} />}
    </>
  )
}
