import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteMessage,
  editMessage,
  fetchMessages,
  sendMessage,
  subscribeToMessageUpdates,
  subscribeToMessages,
} from "../services/messageService";
import type {
  ChatMessage,
  Member,
  MessagePayload,
  ReplyMetadata,
} from "../types";
import { formatTime } from "../lib/utils";

export function useMessages(roomCode: string, currentUser: Member, joinText?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    })
  }, [])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const history = await fetchMessages(roomCode, currentUser.id)
        if (active) {
          setMessages(history)
          scrollToBottom()
        }
      } catch (error) {
        console.error('Failed to load messages:', error)
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()

    const unsubscribeInsert = subscribeToMessages(roomCode, currentUser.id, (message) => {
      setMessages((prev) => prev.some((item) => item.id === message.id) ? prev : [...prev, message])
    })
    
    const unsubscribeUpdates = subscribeToMessageUpdates(
      roomCode,
      currentUser.id,
      (updatedMessage) => {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === updatedMessage.id ? updatedMessage : message,
          ),
        );
      },
    );

    return () => {
      active = false
      unsubscribeInsert()
      unsubscribeUpdates()
    }
  }, [roomCode, currentUser.id, scrollToBottom])

    const pushSystemMessage = useCallback(
      (systemText: string) => {
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${crypto.randomUUID()}`,
            kind: "system",
            systemText,
            time: formatTime(new Date()),
            localOnly: true,
          },
        ]);
        scrollToBottom();
      },
      [scrollToBottom],
    );

    // Only the client that just joined sees this message.
    // It is never persisted to the database or broadcast, so it stays local.
    useEffect(() => {
      if (!joinText) return;
      const timer = setTimeout(() => pushSystemMessage(joinText), 0);
      return () => clearTimeout(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomCode]);

  const handleSend = useCallback(
    async (payload: MessagePayload, reply?: ReplyMetadata) => {
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        kind: "message",
        authorId: currentUser.id,
        authorName: currentUser.name,
        color: currentUser.color,
        ...payload,
        replyToId: reply?.id,
        replyToText: reply?.text,
        replyToAuthor: reply?.authorName,
        time: formatTime(new Date()),
        isOwn: true,
        status: "sending",
      };
      setMessages((prev) => [...prev, message]);
      scrollToBottom();

      try {
        await sendMessage(roomCode, message);
        setMessages((prev) =>
          prev.map((item) =>
            item.id === message.id ? { ...item, status: "sent" } : item,
          ),
        );
      } catch (error) {
        console.error("Failed to send message:", error);
        setMessages((prev) => prev.filter((item) => item.id !== message.id));
      }
    },
    [currentUser, roomCode, scrollToBottom],
  );

  // NEW: Handle Edit
  const handleEdit = useCallback(async (messageId: string, newText: string) => {
    try {
      await editMessage(messageId, newText)
      setMessages((prev) => prev.map((m) => 
        m.id === messageId ? { ...m, text: newText, isEdited: true } : m
      ))
    } catch (error) {
      console.error('Failed to edit message:', error)
    }
  }, [])

  const handleDelete = useCallback(async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                isDeleted: true,
                text: undefined,
                audioUrl: undefined,
                duration: undefined,
                fileUrl: undefined,
                fileName: undefined,
              }
            : message,
        ),
      );
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  }, []);

  return {
    messages,
    scrollRef,
    handleSend,
    handleEdit,
    handleDelete,
    pushSystemMessage,
    isLoading,
  }; // <-- ADDED isLoading
}