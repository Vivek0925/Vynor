ALTER TYPE "NotificationType" ADD VALUE 'PROJECT_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'TASK_ASSIGNED';

ALTER TABLE "notifications" ADD COLUMN "projectId" TEXT;
ALTER TABLE "notifications" ADD COLUMN "taskId" TEXT;

CREATE INDEX "notifications_projectId_idx" ON "notifications"("projectId");
CREATE INDEX "notifications_taskId_idx" ON "notifications"("taskId");

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_taskId_fkey"
  FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
