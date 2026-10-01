import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ChatHeader from '../components/chat/ChatHeader'
import MobileChatHeader from '../components/chat/MobileChatHeader'
import ConnectionBanner from '../components/common/ConnectionBanner'
import Composer from '../components/chat/composer/Composer'
import MembersPanel from '../components/chat/MembersPanel'
import MessageBubble from '../components/chat/message/MessageBubble'
import LeaveRoomModal from '../components/common/LeaveRoomModal'
import ImageLightbox from '../components/chat/message/ImageLightbox' // <-- FIXED CASING
import { useChatRoom } from '../hooks/useChatRoom'
import type { ChatMessage, MessagePayload, ChatRoomNavState } from '../types'

export default function ChatRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ChatRoomNavState | undefined;

  const {
    code,
    roomName,
    displayName,
    members,
    messages,
    scrollRef,
    handleSend,
    handleEdit,
    handleDelete,
    membersOpen,
    setMembersOpen,
    connectionLost,
    setConnectionLost,
    typingName,
    notifyTyping,
    recordingName,
    notifyRecording,
        roomAvatarColor, // <-- ADDED
    leaveRoom,
    isLoading,
  } = useChatRoom();

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewMessagesBadge, setShowNewMessagesBadge] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null); // <-- ADDED

  const prevMessageCountRef = useRef(0);

  // --- NEW: ROUTE GUARD ---
  // If the user didn't come through the Join/Create flow (no state)
  // AND they don't have a name saved in their browser, kick them to the Join page.
  useEffect(() => {
    const storedName = sessionStorage.getItem("pingroom_display_name");

    if (!state?.displayName && !storedName) {
      navigate(`/join?code=${code}`, { replace: true });
    }
  }, [state, code, navigate]);
  // --------------------------

  // Intercept the browser/hardware back button so it opens the leave
  // confirmation modal instead of navigating away without confirmation.
  useEffect(() => {
    // Push a sentinel entry so the first back press lands here instead
    // of actually leaving the page.
    window.history.pushState({ pingroomSentinel: true }, "");

    const handlePopState = () => {
      // Re-push the sentinel so subsequent back presses keep working
      window.history.pushState({ pingroomSentinel: true }, "");
      setIsLeaveModalOpen(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

    const handleConfirmLeave = async () => {
    await leaveRoom();
    setIsLeaveModalOpen(false);
    // Use replace so the sentinel entry is discarded rather than
    // creating an extra history entry when we leave.
    navigate("/", { replace: true });
  };

  const handleSendWithReply = (payload: MessagePayload) => {
    if (replyingTo) {
      handleSend(payload, {
        id: replyingTo.id,
        text: replyingTo.audioUrl
          ? "🎤 Voice message"
          : replyingTo.fileUrl
            ? `📎 ${replyingTo.fileName || "Attachment"}`
            : replyingTo.text || "",
        authorName: replyingTo.authorName || "Unknown",
      });
      setReplyingTo(null);
    } else {
      handleSend(payload);
    }
    setTimeout(() => scrollToBottom(), 50);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < 100) {
      setIsAtBottom(true);
      setShowNewMessagesBadge(false);
    } else {
      setIsAtBottom(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
      setIsAtBottom(true);
      setShowNewMessagesBadge(false);
    }
  };

  // FIXED: Added scrollRef to deps, and deferred setState to satisfy linter
  useEffect(() => {
    const currentCount = messages.length;
    const prevCount = prevMessageCountRef.current;
    prevMessageCountRef.current = currentCount;

    if (currentCount <= prevCount) return;

    const newMessage = messages[currentCount - 1];
    if (!newMessage) return;

    if (isAtBottom) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    } else if (!newMessage.isOwn) {
      // Defer state update to next tick to prevent cascading render warnings
      setTimeout(() => setShowNewMessagesBadge(true), 0);
    }
  }, [messages, isAtBottom, scrollRef]); // <-- ADDED scrollRef

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-cream">
      {connectionLost && (
        <ConnectionBanner onRetry={() => setConnectionLost(false)} />
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <MobileChatHeader
            roomName={roomName}
            memberCount={members.length}
            typingName={typingName}
            recordingName={recordingName}
            roomAvatarColor={roomAvatarColor}   // <-- ADDED
            onBack={handleConfirmLeave}
            onShowMembers={() => setMembersOpen(true)}
            onRequestLeave={() => setIsLeaveModalOpen(true)}
          />

          <div className="hidden lg:block">
            <ChatHeader
              roomName={roomName}
              members={members}
              typingName={typingName}
              recordingName={recordingName}
              roomAvatarColor={roomAvatarColor}   // <-- ADDED
              onToggleMembers={() => setMembersOpen((v) => !v)}
              onRequestLeave={() => setIsLeaveModalOpen(true)}
            />
          </div>

          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
            </div>
          ) : (
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="relative min-h-0 flex-1 overflow-y-auto px-3 py-3 lg:px-12 lg:py-4"
            >
              <div className="mx-auto w-full max-w-6xl">
                {messages.map((m, index) => {
                  const prev = index > 0 ? messages[index - 1] : null;
                  const isGrouped =
                    prev !== null &&
                    prev.authorId === m.authorId &&
                    prev.kind === "message" &&
                    m.kind === "message";

                  return (
                    <MessageBubble
                      key={m.id}
                      message={m}
                      isGrouped={isGrouped}
                      onDelete={m.isOwn ? handleDelete : undefined}
                      onEdit={m.isOwn ? handleEdit : undefined} // <-- ADDED
                      onReply={setReplyingTo}
                      onImageClick={setLightboxImage} // <-- PASSED DOWN
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                    />
                  );
                })}
              </div>

              {showNewMessagesBadge && (
                <button
                  onClick={scrollToBottom}
                  className="sticky bottom-4 z-10 mx-auto flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white shadow-lg ring-1 ring-white/10 transition hover:bg-ink-800"
                >
                  <span>↓</span> New Messages
                </button>
              )}
            </div>
          )}

          <Composer
            displayName={displayName.split(" ")[0]}
            onSend={handleSendWithReply}
            onTyping={notifyTyping}
            onRecordingChange={notifyRecording}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
          />
        </div>

        {membersOpen && (
          <div className="hidden w-80 shrink-0 border-l border-line lg:block">
            <MembersPanel
              code={code}
              members={members}
              onClose={() => setMembersOpen(false)}
            />
          </div>
        )}
      </div>

      {membersOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden">
          <button
            className="absolute inset-0 bg-ink/50"
            aria-label="Close members panel"
            onClick={() => setMembersOpen(false)}
          />
          <div className="relative z-10 max-h-[75vh] w-full rounded-t-3xl bg-white shadow-panel">
            <div className="flex justify-center pt-3">
              <span className="h-1.5 w-12 rounded-full bg-line" />
            </div>
            <MembersPanel
              code={code}
              members={members}
              onClose={() => setMembersOpen(false)}
            />
          </div>
        </div>
      )}

      {isLeaveModalOpen && (
        <LeaveRoomModal
          onConfirm={handleConfirmLeave}
          onCancel={() => setIsLeaveModalOpen(false)}
        />
      )}

      {/* FIXED CASING: ImageLightbox */}
      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
}