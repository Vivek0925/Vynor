export interface MeetingNotification {
  id: string;
  type: "MEETING_SCHEDULED" | "PROJECT_CREATED" | "TASK_ASSIGNED";
  title: string;
  message: string;
  meetingId: string | null;
  projectId: string | null;
  taskId: string | null;
  readAt: string | null;
  createdAt: string;
}
