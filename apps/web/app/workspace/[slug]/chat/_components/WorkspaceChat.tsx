"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Hash, MessageCircle, Plus, Users, X } from "lucide-react";

import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

import { useChat } from "@/hooks/useChat";
import {
  createChannel,
  createDirectMessage,
  getConversations,
  markConversationRead,
  type Conversation,
} from "@/lib/conversations";
import { getWorkspaceMembers, type WorkspaceMember } from "@/lib/workspace";
import { useAuth } from "@/context/AuthContext";
import { socket } from "@/lib/socket";

import type { Message } from "@/types/chats";

interface WorkspaceChatProps {
  slug: string;
}

export default function WorkspaceChat({ slug }: WorkspaceChatProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [showChannelForm, setShowChannelForm] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [showDmPicker, setShowDmPicker] = useState(false);
  const [conversationError, setConversationError] = useState<string | null>(null);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadConversationData() {
      try {
        const [loadedConversations, loadedMembers] = await Promise.all([
          getConversations(slug),
          getWorkspaceMembers(slug),
        ]);
        if (ignore) return;
        setConversations(loadedConversations);
        setMembers(loadedMembers);
        setSelectedId(
          (current) =>
            current &&
            loadedConversations.some((conversation) => conversation.id === current)
              ? current
              : loadedConversations.find(
                  (conversation) =>
                    conversation.type === "CHANNEL" && conversation.slug === "general",
                )?.id ?? loadedConversations[0]?.id,
        );
      } catch (error) {
        if (!ignore) {
          setConversationError(
            error instanceof Error ? error.message : "Unable to load conversations.",
          );
        }
      }
    }
    void loadConversationData();
    return () => {
      ignore = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!selectedId) return;
    void markConversationRead(slug, selectedId).then(() => {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === selectedId
            ? { ...conversation, unreadCount: 0 }
            : conversation,
        ),
      );
    });
  }, [selectedId, slug]);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedId,
  );
  const selectedLabel =
    selectedConversation?.type === "DM"
      ? selectedConversation.participants.find(
          (participant) => participant.userId !== user?.id,
        )?.user.name ?? "direct message"
      : `#${selectedConversation?.name ?? "general"}`;

  useEffect(() => {
    if (conversations.length === 0) return;

    const conversationIds = conversations.map((conversation) => conversation.id);
    const handleBackgroundMessage = (message: Message) => {
      if (
        !message.conversationId ||
        message.conversationId === selectedId ||
        message.sender.id === user?.id ||
        !conversationIds.includes(message.conversationId)
      ) {
        return;
      }

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === message.conversationId
            ? {
                ...conversation,
                unreadCount: (conversation.unreadCount ?? 0) + 1,
              }
            : conversation,
        ),
      );
    };

    conversationIds.forEach((conversationId) => {
      socket.emit("conversation:join", { conversationId });
    });
    socket.on("chat:new", handleBackgroundMessage);

    return () => {
      socket.off("chat:new", handleBackgroundMessage);
      conversationIds.forEach((conversationId) => {
        socket.emit("conversation:leave", { conversationId });
      });
    };
  }, [conversations, selectedId, user?.id]);
  const canManageChannels = useMemo(() => {
    const membership = members.find((member) => member.userId === user?.id);
    return membership?.role === "OWNER" || membership?.role === "ADMIN";
  }, [members, user?.id]);

  async function handleCreateChannel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!channelName.trim()) return;
    try {
      const channel = await createChannel(slug, channelName.trim());
      setConversations((current) => [...current, channel]);
      setSelectedId(channel.id);
      setChannelName("");
      setShowChannelForm(false);
      setConversationError(null);
    } catch (error) {
      setConversationError(
        error instanceof Error ? error.message : "Unable to create channel.",
      );
    }
  }

  async function handleCreateDm(userId: string) {
    try {
      const dm = await createDirectMessage(slug, userId);
      setConversations((current) =>
        current.some((conversation) => conversation.id === dm.id)
          ? current
          : [...current, dm],
      );
      setSelectedId(dm.id);
      setShowDmPicker(false);
      setConversationError(null);
    } catch (error) {
      setConversationError(
        error instanceof Error ? error.message : "Unable to start direct message.",
      );
    }
  }

  const {
    messages,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
  } = useChat(slug, selectedId);

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const handleEdit = useCallback(
    (message: Message) => editMessage(message.id, message.content),
    [editMessage],
  );
  const handleDelete = useCallback(
    (message: Message) => deleteMessage(message.id),
    [deleteMessage],
  );
  const handleReact = useCallback(
    (message: Message, emoji: string) => reactToMessage(message.id, emoji),
    [reactToMessage],
  );

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden rounded-[22px] border border-[var(--workspace-line)] bg-[var(--workspace-surface)] shadow-[0_10px_30px_rgba(23,32,26,0.04)] sm:rounded-[22px]">
      {mobileChatOpen && (
        <button
          type="button"
          aria-label="Close chat navigation"
          onClick={() => setMobileChatOpen(false)}
          className="absolute inset-0 z-20 bg-transparent sm:hidden"
        />
      )}
      <aside
        className={`${
          mobileChatOpen ? "absolute inset-y-0 left-0 z-30 flex w-[min(86vw,280px)]" : "hidden"
        } shrink-0 flex-col border-r border-[var(--workspace-line)] bg-[var(--workspace-surface)] p-3 shadow-[8px_0_24px_rgba(23,32,26,0.06)] sm:static sm:flex sm:w-[240px] sm:shadow-none`}
      >
        <div className="mb-3 flex items-center justify-between px-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--workspace-muted)]">
            Chat
          </span>
          <button
            type="button"
            onClick={() => setMobileChatOpen(false)}
            className="rounded-md p-1 text-[var(--workspace-muted)] hover:bg-[var(--workspace-bg)] sm:hidden"
            aria-label="Close chat navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mb-3 px-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--workspace-muted)]">
          Channels
        </div>
        <div className="space-y-1">
          {conversations
            .filter((conversation) => conversation.type === "CHANNEL")
            .map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => {
                  setSelectedId(conversation.id);
                  setMobileChatOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm ${
                  selectedId === conversation.id
                    ? "bg-[var(--workspace-coral-tint)] font-medium text-[var(--workspace-coral)]"
                    : "text-[var(--workspace-ink)] hover:bg-[var(--workspace-bg)]"
                }`}
              >
                <Hash className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{conversation.name}</span>
                {!!conversation.unreadCount && (
                  <span className="rounded-full bg-[var(--workspace-coral)] px-1.5 py-0.5 text-[10px] text-white">
                    {conversation.unreadCount}
                  </span>
                )}
              </button>
            ))}
        </div>
        {canManageChannels && (
          <div className="mt-1">
            {showChannelForm ? (
              <form onSubmit={handleCreateChannel} className="flex gap-1">
                <input
                  autoFocus
                  value={channelName}
                  onChange={(event) => setChannelName(event.target.value)}
                  placeholder="New channel"
                  className="min-w-0 flex-1 rounded-md border border-[var(--workspace-line)] bg-[var(--workspace-surface)] px-2 py-1.5 text-xs outline-none"
                />
                <button type="submit" className="rounded-md bg-[var(--workspace-coral-tint)] px-2 text-[var(--workspace-coral)]">
                  <Plus className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowChannelForm(true)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-[var(--workspace-muted)] hover:bg-[var(--workspace-bg)]"
              >
                <Plus className="h-4 w-4" />
                Create channel
              </button>
            )}
          </div>
        )}

        <div className="mb-2 mt-7 flex items-center justify-between px-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--workspace-muted)]">
            Direct messages
          </span>
          <button
            type="button"
            onClick={() => setShowDmPicker((current) => !current)}
            className="rounded-md p-1 text-[var(--workspace-muted)] hover:bg-[var(--workspace-bg)]"
            aria-label="Start direct message"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {showDmPicker && (
          <div className="mb-2 rounded-lg border border-[var(--workspace-line)] bg-[var(--workspace-surface)] p-1">
            {members
              .filter((member) => member.userId !== user?.id)
              .map((member) => (
                <button
                  key={member.userId}
                  type="button"
                  onClick={() => void handleCreateDm(member.userId)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-[var(--workspace-ink)] hover:bg-[var(--workspace-bg)]"
                >
                  <Users className="h-3.5 w-3.5 text-[var(--workspace-muted)]" />
                  <span className="truncate">{member.user.name}</span>
                </button>
              ))}
          </div>
        )}
        <div className="space-y-1 overflow-y-auto">
          {conversations
            .filter((conversation) => conversation.type === "DM")
            .map((conversation) => {
              const other = conversation.participants.find(
                (participant) => participant.userId !== user?.id,
              );
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(conversation.id);
                    setMobileChatOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm ${
                    selectedId === conversation.id
                      ? "bg-[var(--workspace-coral-tint)] font-medium text-[var(--workspace-coral)]"
                      : "text-[var(--workspace-ink)] hover:bg-[var(--workspace-bg)]"
                  }`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--workspace-sage-tint)] text-[10px] font-medium text-[var(--workspace-ink)]">
                    {other?.user.avatar ? (
                      <img
                        src={other.user.avatar}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (other?.user.name ?? "D").charAt(0).toUpperCase()
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px]">{other?.user.name ?? "Direct message"}</span>
                  {!!conversation.unreadCount && (
                    <span className="rounded-full bg-[var(--workspace-coral)] px-1.5 py-0.5 text-[10px] text-white">
                      {conversation.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-[58px] shrink-0 items-center gap-3 border-b border-[var(--workspace-line)] bg-[var(--workspace-surface)] px-4 sm:px-5">
        <button
          type="button"
          onClick={() => setMobileChatOpen(true)}
          className="rounded-lg p-1.5 text-[var(--workspace-muted)] hover:bg-[var(--workspace-bg)] sm:hidden"
          aria-label="Open chat navigation"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
        {selectedConversation?.type === "DM" ? (
          <MessageCircle className="h-5 w-5 text-[var(--workspace-muted)]" />
        ) : (
          <Hash className="h-5 w-5 text-[var(--workspace-muted)]" />
        )}
        <button
          type="button"
          onClick={() => setMobileChatOpen(true)}
          className="flex min-w-0 items-baseline gap-2.5 text-left sm:cursor-default"
          aria-label="Open chat navigation"
        >
          <h1 className="max-w-[min(52vw,320px)] truncate text-[17px] font-medium tracking-[-0.02em] text-[var(--workspace-ink)] sm:max-w-none sm:text-[18px]">
            {selectedConversation?.type === "DM"
              ? selectedLabel
              : selectedConversation?.name ?? "general"}
          </h1>
          {selectedConversation?.type === "CHANNEL" && (
            <span className="truncate text-sm text-[var(--workspace-muted)]">Everything team-wide</span>
          )}
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden bg-[var(--workspace-bg)]">
        {conversationError ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-red-600">
            {conversationError}
          </div>
        ) : loading ? (
          <div className="flex h-full items-center justify-center text-sm text-[var(--workspace-muted)]">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--workspace-coral-tint)] text-[var(--workspace-coral)]">
              <Hash className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-medium text-[var(--workspace-ink)]">
              No conversations yet
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[var(--workspace-muted)]">
              Start collaborating with everyone in this workspace.
            </p>
          </div>
        ) : (
          <MessageList
            messages={messages}
            onReply={setReplyingTo}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReact={handleReact}
          />
        )}
      </div>

      <MessageInput
        workspaceSlug={slug}
        conversationLabel={selectedLabel}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        onSend={(content, attachments, replyToId) => {
          sendMessage(content, attachments, replyToId);

          setReplyingTo(null);
        }}
      />
      </section>
    </div>
  );
}
