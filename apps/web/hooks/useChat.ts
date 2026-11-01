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

export function useChat(slug: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadMessages() {
      try {
        setLoading(true);
        const data = await getWorkspaceMessages(slug);
        if (!ignore) {
          setMessages(data);
          setLoadedSlug(slug);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Failed to load messages", error);
          setLoadedSlug(slug);
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
      ignore = true;
    };
  }, [slug]);

  useEffect(() => {
    function handleNewMessage(message: Message) {
      setMessages((prev) => [...prev, message]);
    }

    function handleUpdatedMessage(message: Message) {
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
  }, [slug]);

  const sendMessage = useCallback((
    content: string,
    attachments: Attachment[] = [],
    replyToId?: string,
  ) => {
    socket.emit("chat:send", {
      workspaceSlug: slug,
      content,
      attachments,
      replyToId,
    });
  }, [slug]);

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
    messages: loadedSlug === slug ? messages : [],
    loading: slug ? loading : false,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
  };
}
