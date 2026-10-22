
import Link from "next/link";

const email = "vivekmandal123@gmail.com";
const updated = "October 23, 2026";

const sections = [
  ["overview", "Overview"],
  ["information", "Information we handle"],
  ["google-calendar", "Google Calendar"],
  ["usage", "How information is used"],
  ["sharing", "Sharing and service providers"],
  ["security", "Security and retention"],
  ["your-choices", "Your choices"],
  ["children", "Children's privacy"],
  ["changes", "Policy updates"],
  ["contact", "Contact"],
];

function PolicySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-xl font-semibold tracking-tight text-[#302821] sm:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#5d5148]">
        {children}
      </div>
    </section>
  );
}

export const metadata = {
  title: "Privacy Policy | Vynor",
  description:
    "Learn how Vynor handles personal information, workspace content, and Google Calendar data.",
  alternates: {
    canonical: "https://vynor.in/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-warm text-[#302821]">
      <header className="border-b border-[#302821]/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            aria-label="Vynor home"
            className="text-2xl font-bold tracking-[-0.07em] text-[#302821]"
          >
            vynor<span className="text-[#c96850]">.</span>
          </Link>

          <Link
            href="/"
            className="rounded-full border border-[#302821]/15 px-4 py-2 text-sm font-medium text-[#51463d] transition hover:border-[#c96850] hover:text-[#a94e39]"
          >
            Back to home
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-coral px-5 py-14 sm:px-8 sm:py-20">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-[#fff7ef]/20 sm:h-96 sm:w-96" />
        <div className="pointer-events-none absolute -right-5 -top-12 h-48 w-48 rounded-full border border-[#fff7ef]/20 sm:h-72 sm:w-72" />

        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#fff5ed]/80">
            Vynor · Legal
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.04] tracking-[-0.05em] text-[#fff8f1] sm:text-6xl md:text-7xl">
            Privacy, with clarity.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#fff8f1]/85 sm:text-lg">
            Your workspace holds information that matters. This policy explains
            what Vynor may handle, why it is used, and the choices available
            when you use the service.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-[#fff8f1]/80">
            <span className="rounded-full border border-[#fff8f1]/30 px-3 py-1.5">
              Last updated: {updated}
            </span>
            <span aria-hidden="true">•</span>
            <a
              href={`mailto:${email}`}
              className="underline decoration-[#fff8f1]/50 underline-offset-4 hover:text-white"
            >
              Contact privacy support
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-20">
        <aside className="h-fit rounded-2xl border border-[#302821]/10 bg-white/50 p-5 lg:sticky lg:top-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a45a43]">
            In this policy
          </p>
          <nav className="mt-5 flex flex-col gap-1">
            {sections.map(([id, label], index) => (
              <a
                key={id}
                href={`#${id}`}
                className="group flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-[#62564c] transition hover:bg-[#c96850]/10 hover:text-[#a94e39]"
              >
                <span className="w-5 text-xs text-[#a45a43]/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-6 border-t border-[#302821]/10 pt-5">
            <p className="text-sm leading-6 text-[#62564c]">
              Have a question about your data?
            </p>
            <a
              href={`mailto:${email}`}
              className="mt-2 inline-block break-all text-sm font-semibold text-[#a94e39] underline underline-offset-4"
            >
              {email}
            </a>
          </div>
        </aside>

        <article className="min-w-0 max-w-3xl space-y-11">
          <PolicySection id="overview" title="01. Overview">
            <p>
              Vynor is a digital workspace designed to support collaboration
              and work management. In this policy, “Vynor,” “we,” and “us”
              refer to the Vynor service and its operator.
            </p>
            <p>
              The information involved depends on the features you use, the
              content you submit, your workspace permissions, and the
              integrations you choose to connect.
            </p>
          </PolicySection>

          <PolicySection id="information" title="02. Information we handle">
            <p>Depending on how you use Vynor, information may include:</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-[#c96850]">
              <li>
                <strong className="text-[#302821]">Account information:</strong>{" "}
                name, email address, profile details, and authentication
                identifiers.
              </li>
              <li>
                <strong className="text-[#302821]">Workspace content:</strong>{" "}
                messages, tasks, documents, meeting details, and content shared
                by workspace members.
              </li>
              <li>
                <strong className="text-[#302821]">Files:</strong> files you
                upload or share using Vynor.
              </li>
              <li>
                <strong className="text-[#302821]">Connected services:</strong>{" "}
                information and permissions needed to provide integrations
                such as Google Calendar.
              </li>
              <li>
                <strong className="text-[#302821]">Technical information:</strong>{" "}
                operational logs, diagnostic details, and browser or device
                information where collected.
              </li>
            </ul>
          </PolicySection>

          <PolicySection id="google-calendar" title="03. Google Calendar">
            <p>
              If you choose to connect Google Calendar, Vynor requests the
              permissions shown during Google's authorization flow. The
              integration is intended to support calendar actions you request,
              such as creating or managing meeting events.
            </p>
            <p>
              Depending on the feature used, Vynor may process event details
              such as event titles, dates, times, and other fields needed to
              complete the requested action.
            </p>
            <p>
              <strong className="text-[#302821]">Use of Google data.</strong>{" "}
              Google Calendar data is used to provide the requested calendar
              functionality, operate the integration, and protect the service.
              We do not sell Google user data or use it to serve advertising.
            </p>
            <p>
              <strong className="text-[#302821]">Access and storage.</strong>{" "}
              Vynor can make requests allowed by the permissions you approve.
              Any stored authorization tokens must be protected and used only
              for the integration's intended purposes. The exact handling and
              retention of tokens and calendar data depend on the
              implementation and applicable requirements.
            </p>
            <p>
              <strong className="text-[#302821]">Disconnecting access.</strong>{" "}
              You can revoke Vynor's access in your{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#a94e39] underline underline-offset-4"
              >
                Google Account permissions
              </a>
              . Revoking access prevents future authorized requests but may
              not automatically remove information already stored by Vynor.
              Email us to request deletion of associated data.
            </p>
            <p>
              Vynor's use and transfer of information received from Google APIs
              will comply with the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#a94e39] underline underline-offset-4"
              >
                Google API Services User Data Policy
              </a>
              , including its Limited Use requirements.
            </p>
          </PolicySection>

          <PolicySection id="usage" title="04. How information is used">
            <p>Information may be used to:</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-[#c96850]">
              <li>Provide workspace, messaging, meeting, and file features.</li>
              <li>Authenticate users and manage workspace access.</li>
              <li>Perform actions requested through connected integrations.</li>
              <li>Diagnose errors and maintain service reliability.</li>
              <li>Detect abuse, address security issues, and meet legal obligations.</li>
              <li>Respond to support and privacy requests.</li>
            </ul>
            <p>We do not sell personal information.</p>
          </PolicySection>

          <PolicySection id="sharing" title="05. Sharing and service providers">
            <p>
              Information may be processed by service providers that help host,
              store, secure, or operate Vynor. They may process information on
              our behalf to provide those services.
            </p>
            <p>
              Workspace content may be accessible to members who have
              permission to access the relevant workspace. Review membership
              and sharing permissions before posting information.
            </p>
            <p>
              Information may also be disclosed when required by law or when
              reasonably necessary to investigate abuse or protect the service,
              users, or other people.
            </p>
          </PolicySection>

          <PolicySection id="security" title="06. Security and retention">
            <p>
              We use safeguards intended to protect information against
              unauthorized access, loss, misuse, or alteration. No online
              service can guarantee absolute security.
            </p>
            <p>
              Information should be retained only as long as reasonably
              necessary to provide the service, meet applicable legal
              obligations, and address legitimate security needs. Retention
              periods may vary by information type.
            </p>
            <p>
              When information is no longer needed, it should be deleted or
              anonymized where appropriate, subject to legal requirements and
              legitimate backup or security constraints.
            </p>
          </PolicySection>

          <PolicySection id="your-choices" title="07. Your choices">
            <p>
              Depending on applicable law, you may request access to,
              correction of, or deletion of your personal information. You can
              also disconnect integrations and stop using Vynor.
            </p>
            <p>
              To make a request, email{" "}
              <a
                href={`mailto:${email}`}
                className="font-semibold text-[#a94e39] underline underline-offset-4"
              >
                {email}
              </a>
              . We may need to verify your identity. Some information may need
              to be retained where required by law or for legitimate security
              purposes.
            </p>
          </PolicySection>

          <PolicySection id="children" title="08. Children's privacy">
            <p>
              Vynor is a general-purpose workspace and is not intended for
              people who are not legally able to use the service under
              applicable law. If you believe a child has provided personal
              information inappropriately, contact us so we can review it.
            </p>
          </PolicySection>

          <PolicySection id="changes" title="09. Policy updates">
            <p>
              We may update this policy as Vynor's features or legal
              obligations change. The latest version will be published on this
              page with a revised date. Additional notice will be provided
              where required.
            </p>
          </PolicySection>

          <PolicySection id="contact" title="10. Contact and privacy support">
            <div className="rounded-2xl border border-[#c96850]/25 bg-[#c96850]/[0.07] p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#a94e39]">
                We're here to help
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#302821]">
                Questions about your information?
              </h3>
              <p className="mt-3">
                Contact the Vynor operator about this policy, Google Calendar
                data, or privacy requests.
              </p>
              <a
                href={`mailto:${email}`}
                className="mt-5 inline-flex max-w-full break-all rounded-full bg-[#c96850] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ad503b]"
              >
                {email}
              </a>
            </div>
          </PolicySection>

          <div className="flex flex-col gap-4 border-t border-[#302821]/10 pt-7 text-sm text-[#62564c] sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Vynor</span>
            <div className="flex gap-5">
              <Link
                href="/terms"
                className="font-medium text-[#a94e39] hover:underline"
              >
                Terms of Service
              </Link>
              <Link href="/" className="hover:text-[#302821]">
                Back to Vynor
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
