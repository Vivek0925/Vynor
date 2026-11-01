"use client";

import dynamic from "next/dynamic";
import { AuthProvider } from "../context/AuthContext";
import InvitationProvider from "../context/InvitationProvider";
import { ActiveMeetingProvider } from "@/app/workspace/[slug]/_components/ActiveMeetingProvider";
import { ToastProvider } from "@/components/ui/Toast";

const ActiveMeeting = dynamic(
  () => import("@/app/workspace/[slug]/_components/ActiveMeeting"),
  { ssr: false },
);

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