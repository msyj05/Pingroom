import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useMembers } from "./useMembers";
import { useMessages } from "./useMessages";
import { useTypingIndicator } from "./useTypingIndicator";
import { useConnectionStatus } from "./useConnectionStatus";
import { useVoiceRecordingIndicator } from "./useVoiceRecordingIndicator";
import type { ChatRoomNavState, Member } from "../types";

const getSessionId = () => {
  let id = sessionStorage.getItem("pingroom_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("pingroom_session_id", id);
  }
  return id;
};

const getStoredDisplayName = (): string | null => {
  return sessionStorage.getItem("pingroom_display_name");
};

const storeDisplayName = (name: string) => {
  sessionStorage.setItem("pingroom_display_name", name);
};

export function useChatRoom() {
  const { code = "X7K2P9" } = useParams();
  const location = useLocation();
  const state = location.state as ChatRoomNavState | undefined;

  const initialDisplayName =
    state?.displayName || getStoredDisplayName() || "Guest";
  const [currentUser] = useState<Member>({
    id: getSessionId(),
    name: initialDisplayName,
    color: "purple",
    status: "online",
    isYou: true,
  });

  useEffect(() => {
    if (state?.displayName) {
      storeDisplayName(state.displayName);
    }
  }, [state?.displayName]);

  const [roomName, setRoomName] = useState(state?.roomName || "Chat Room");

  useEffect(() => {
    if (!supabase || state?.roomName) return;
    const fetchRoomName = async () => {
      const { data } = await supabase
        .from("rooms")
        .select("name")
        .eq("code", code)
        .single();
      if (data?.name) setRoomName(data.name);
    };
    void fetchRoomName();
  }, [code, state?.roomName]);

  const { members, leaveRoom } = useMembers(code, currentUser);
  const {
    messages,
    scrollRef,
    handleSend,
    handleEdit, // <-- ADDED
    handleDelete,
    pushSystemMessage,
    isLoading,
  } = useMessages(
    code,
    currentUser,
    `You joined the room as ${initialDisplayName}`,
  );
  const { typingName, notifyTyping } = useTypingIndicator(code, currentUser);
  const { recordingName, notifyRecording } = useVoiceRecordingIndicator(
    code,
    currentUser,
  );
  const { connectionLost, setConnectionLost } = useConnectionStatus();

  const [membersOpen, setMembersOpen] = useState(false);
  const prevMembersRef = useRef<Member[]>([]);
  const hasLoadedMembersRef = useRef(false); // <-- ADDED: Prevents false "joined" messages on load

  useEffect(() => {
    if (!hasLoadedMembersRef.current) {
      // First time loading members: just set the ref and skip notifications
      prevMembersRef.current = members;
      hasLoadedMembersRef.current = true;
      return;
    }

    const prev = prevMembersRef.current;
    const current = members;

    const joined = current.filter(
      (m) => !prev.find((p) => p.id === m.id) && m.id !== currentUser.id,
    );
    joined.forEach((m) => pushSystemMessage(`${m.name} joined the room`));

    const left = prev.filter(
      (p) => !current.find((m) => m.id === p.id) && p.id !== currentUser.id,
    );
    left.forEach((m) => pushSystemMessage(`${m.name} left the room`));

    prevMembersRef.current = current;
  }, [members, currentUser.id, pushSystemMessage]);

  return {
    code,
    roomName,
    displayName: initialDisplayName,
    currentUser,
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
    leaveRoom,
    isLoading, // <-- ADDED
  };
}
