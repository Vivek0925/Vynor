CREATE TYPE "ConversationType" AS ENUM ('CHANNEL', 'DM');

CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" "ConversationType" NOT NULL,
    "name" TEXT,
    "slug" TEXT,
    "dmKey" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "conversation_participants" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "messages" ADD COLUMN "conversationId" TEXT;

CREATE UNIQUE INDEX "conversations_workspaceId_slug_key"
ON "conversations"("workspaceId", "slug");

CREATE UNIQUE INDEX "conversations_workspaceId_dmKey_key"
ON "conversations"("workspaceId", "dmKey");

CREATE INDEX "conversations_workspaceId_type_idx"
ON "conversations"("workspaceId", "type");

CREATE UNIQUE INDEX "conversation_participants_conversationId_userId_key"
ON "conversation_participants"("conversationId", "userId");

CREATE INDEX "conversation_participants_userId_idx"
ON "conversation_participants"("userId");

CREATE INDEX "messages_conversationId_createdAt_idx"
ON "messages"("conversationId", "createdAt");

ALTER TABLE "conversations"
ADD CONSTRAINT "conversations_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "conversations"
ADD CONSTRAINT "conversations_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "conversation_participants"
ADD CONSTRAINT "conversation_participants_conversationId_fkey"
FOREIGN KEY ("conversationId") REFERENCES "conversations"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "conversation_participants"
ADD CONSTRAINT "conversation_participants_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages"
ADD CONSTRAINT "messages_conversationId_fkey"
FOREIGN KEY ("conversationId") REFERENCES "conversations"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "conversations" (
    "id", "workspaceId", "type", "name", "slug", "createdById", "updatedAt"
)
SELECT
    'general_' || w."id",
    w."id",
    'CHANNEL'::"ConversationType",
    'general',
    'general',
    w."ownerId",
    CURRENT_TIMESTAMP
FROM "workspaces" w;

UPDATE "messages" m
SET "conversationId" = 'general_' || m."workspaceId";
