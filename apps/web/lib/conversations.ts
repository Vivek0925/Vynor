import { api } from "./api";

export interface ConversationParticipant {
  userId: string;
  user: { id: string; name: string; avatar: string | null };
}

export interface Conversation {
  id: string;
  type: "CHANNEL" | "DM";
  name?: string | null;
  slug?: string | null;
  dmKey?: string | null;
  participants: ConversationParticipant[];
  unreadCount?: number;
}

export function markConversationRead(slug: string, conversationId: string) {
  return api<void>(
    `/workspaces/${encodeURIComponent(slug)}/conversations/${encodeURIComponent(conversationId)}/read`,
    {
    method: "POST",
    },
  );
}

export function getConversations(slug: string) {
  return api<Conversation[]>(`/workspaces/${encodeURIComponent(slug)}/conversations`);
}

export function createChannel(slug: string, name: string) {
  return api<Conversation>(`/workspaces/${encodeURIComponent(slug)}/conversations/channels`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function createDirectMessage(slug: string, userId: string) {
  return api<Conversation>(`/workspaces/${encodeURIComponent(slug)}/conversations/dms`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}
