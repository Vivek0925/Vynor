"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { resendRegistration, verifyRegistration } from "@/lib/auth";

export default function RegistrationVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email || otp.length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await verifyRegistration({ email, otp });
      router.push("/login?verified=1");
    } catch (verificationError) {
      setError(
        verificationError instanceof Error
          ? verificationError.message
          : "Unable to verify your email.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email || cooldown > 0) return;

    try {
      setResending(true);
      setError("");
      setNotice("");
      const response = await resendRegistration(email);
      setNotice(response.message);
      setCooldown(60);
    } catch (resendError) {
      setError(
        resendError instanceof Error
          ? resendError.message
          : "Unable to resend the verification code.",
      );
    } finally {
      setResending(false);
    }
  }

  if (!email) {
    return (
      <div className="flex w-full max-w-[380px] flex-col">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
          Verify email
        </span>
        <h1 className="mt-3 text-[30px] font-light leading-tight text-text">
          Registration link expired
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
          Start registration again to request a new verification code.
        </p>
        <Link
          href="/signup"
          className="mt-8 flex h-11 items-center justify-center rounded-[var(--radius-sm)] bg-primary text-[14px] font-medium text-text transition-colors hover:bg-primary-hover"
        >
          Back to sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[380px] flex-col">
      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
        Verify email
      </span>
      <h1 className="mt-3 text-[30px] font-light leading-tight text-text">
        Check your inbox
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
        Enter the 6-digit code sent to{" "}
        <span className="font-medium text-text">{email}</span>.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label htmlFor="verification-code" className="text-[13px] font-medium text-text">
          Verification code
        </label>
        <input
          id="verification-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoFocus
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
          onPaste={(event) => {
            event.preventDefault();
            setOtp(event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6));
          }}
          placeholder="000000"
          className="h-14 rounded-[var(--radius-sm)] border border-border bg-surface px-4 text-center font-mono text-[24px] tracking-[0.35em] text-text placeholder:text-text-secondary/50 outline-none transition-colors focus:border-primary"
        />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {notice && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {notice}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="h-11 rounded-[var(--radius-sm)] bg-primary text-[14px] font-medium text-text transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify email"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => void handleResend()}
        disabled={resending || cooldown > 0}
        className="mt-6 text-[13px] font-medium text-text-secondary transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-60"
      >
        {resending
          ? "Sending new code..."
          : cooldown > 0
            ? `Resend code in ${cooldown}s`
            : "Resend code"}
      </button>
    </div>
  );
}
