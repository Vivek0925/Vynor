-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'IN_PROGRESS', 'IN_REVIEW', 'READY_FOR_DELIVERY', 'COMPLETED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "projectId" TEXT;

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "clientName" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "startDate" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "workspaceId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_workspaceId_status_idx" ON "projects"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "projects_workspaceId_deadline_idx" ON "projects"("workspaceId", "deadline");

-- CreateIndex
CREATE INDEX "projects_createdById_idx" ON "projects"("createdById");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
