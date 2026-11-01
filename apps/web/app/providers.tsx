"use client";

import { AuthProvider } from "../context/AuthContext";
import InvitationProvider from "../context/InvitationProvider";
import { ActiveMeetingProvider } from "@/app/workspace/[slug]/_components/ActiveMeetingProvider";
import ActiveMeeting from "@/app/workspace/[slug]/_components/ActiveMeeting";
import { ToastProvider } from "@/components/ui/Toast";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AuthProvider>
        <InvitationProvider>
          <ActiveMeetingProvider>
            {children}
            <ActiveMeeting />
          </ActiveMeetingProvider>
        </InvitationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}