export type AvatarColor = 'purple' | 'lime' | 'orange' | 'blue'

export type Duration = '1 hour' | '24 hours' | '7 days'

export interface ChatRoomNavState {
  roomName?: string
  displayName?: string
}

export interface Member {
  id: string
  name: string
  color: AvatarColor
  status: 'online' | 'idle' | 'offline'
  isYou?: boolean
}

export interface MessagePayload {
  text?: string
  audioUrl?: string
  duration?: number
  fileUrl?: string
  fileName?: string
}

export interface ReplyMetadata {
  id: string
  text: string
  authorName: string
}

export interface ChatMessage {
  id: string;
  kind: "message" | "system";
  authorId?: string;
  authorName?: string;
  color?: AvatarColor;
  text?: string;
  audioUrl?: string;
  duration?: number;
  fileUrl?: string;
  fileName?: string;
  time?: string;
  isOwn?: boolean;
  status?: "sending" | "sent";
  systemText?: string;
  isDeleted?: boolean;
  isEdited?: boolean; // <-- ADDED
  replyToId?: string;
  replyToText?: string;
  replyToAuthor?: string;
  localOnly?: boolean;
}

export interface Room {
  code: string
  name: string
  durationLabel: Duration
  members: Member[]
}
