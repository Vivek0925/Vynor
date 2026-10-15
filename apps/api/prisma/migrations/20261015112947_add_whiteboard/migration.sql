-- CreateTable
CREATE TABLE "whiteboards" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "scene" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whiteboards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "whiteboards_workspaceId_key" ON "whiteboards"("workspaceId");

-- AddForeignKey
ALTER TABLE "whiteboards" ADD CONSTRAINT "whiteboards_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
