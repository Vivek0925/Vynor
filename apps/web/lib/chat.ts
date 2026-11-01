import { api } from "./api";
import type { Message } from "@/types/chats";

export function getWorkspaceMessages(slug: string, conversationId?: string) {
  const query = conversationId
    ? `?conversationId=${encodeURIComponent(conversationId)}`
    : "";
  return api<Message[]>(`/workspaces/${encodeURIComponent(slug)}/messages${query}`);
}