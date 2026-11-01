import type { Metadata } from "next";
import { Suspense } from "react";
import AuthVisualPanel from "@/components/auth/AuthVisualPanel";
import { RedirectIfAuthenticated } from "@/components/auth/AuthRedirect";
import RegistrationVerificationForm from "@/components/auth/RegistrationVerificationForm";

export const metadata: Metadata = {
  title: "Verify your email — Vynor",
};

export default function RegistrationVerificationPage() {
  return (
    <RedirectIfAuthenticated>
      <main className="grid min-h-screen lg:grid-cols-2">
        <AuthVisualPanel />
        <div className="flex items-center justify-center bg-background px-6 py-16">
          <Suspense fallback={null}>
            <RegistrationVerificationForm />
          </Suspense>
        </div>
      </main>
    </RedirectIfAuthenticated>
  );
}
