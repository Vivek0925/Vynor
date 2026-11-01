"use client";

import { useCallback, useEffect, useState } from "react";

import { getWorkspaceMessages } from "@/lib/chat";
import { socket } from "@/lib/socket";

import type { Message } from "@/types/chats";

interface Attachment {
  fileName: string;
  key: string;
  url: string;
  mimeType: string;
  size: number;
}

export function useChat(slug: string, conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);
  const [loadedConversationId, setLoadedConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    socket.emit("conversation:join", { conversationId });

    let ignore = false;

    async function loadMessages() {
      try {
        setLoading(true);
        if (!conversationId) {
          setMessages([]);
          setLoadedSlug(slug);
          setLoading(false);
          return;
        }
        const data = await getWorkspaceMessages(slug, conversationId);
        if (!ignore) {
          setMessages(data);
          setLoadedSlug(slug);
          setLoadedConversationId(conversationId ?? null);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Failed to load messages", error);
          setLoadedSlug(slug);
          setLoadedConversationId(conversationId ?? null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      void loadMessages();
    }

    return () => {
      socket.emit("conversation:leave", { conversationId });
      ignore = true;
    };
  }, [slug, conversationId]);

  useEffect(() => {
    function handleNewMessage(message: Message) {
      if (message.conversationId !== conversationId) return;
      setMessages((prev) => [...prev, message]);
    }

    function handleUpdatedMessage(message: Message) {
      if (message.conversationId !== conversationId) return;
      setMessages((prev) =>
        prev.map((item) => (item.id === message.id ? message : item)),
      );
    }

    function handleDeletedMessage(data: { messageId: string }) {
      setMessages((prev) =>
        prev.filter((message) => message.id !== data.messageId),
      );
    }

    socket.on("chat:new", handleNewMessage);
    socket.on("chat:updated", handleUpdatedMessage);
    socket.on("chat:deleted", handleDeletedMessage);

    return () => {
      socket.off("chat:new", handleNewMessage);
      socket.off("chat:updated", handleUpdatedMessage);
      socket.off("chat:deleted", handleDeletedMessage);
    };
  }, [slug, conversationId]);

  const sendMessage = useCallback((
    content: string,
    attachments: Attachment[] = [],
    replyToId?: string,
  ) => {
    socket.emit("chat:send", {
      workspaceSlug: slug,
      conversationId,
      content,
      attachments,
      replyToId,
    });
  }, [slug, conversationId]);

  const editMessage = useCallback((messageId: string, content: string) => {
    socket.emit("chat:edit", {
      messageId,
      content,
    });
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    socket.emit("chat:delete", { messageId });
  }, []);

  const reactToMessage = useCallback((messageId: string, emoji: string) => {
    socket.emit("chat:react", { messageId, emoji });
  }, []);

  return {
    messages:
      loadedSlug === slug && loadedConversationId === conversationId
        ? messages
        : [],
    loading: slug && conversationId ? loading : false,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
  };
}
