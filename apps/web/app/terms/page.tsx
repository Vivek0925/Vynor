
import Link from "next/link";

const email = "vivekmandal123@gmail.com";
const updated = "October 23, 2026";

const sections = [
  ["acceptance", "Acceptance"],
  ["service", "The service"],
  ["accounts", "Accounts and security"],
  ["acceptable-use", "Acceptable use"],
  ["content", "Your content"],
  ["integrations", "Integrations"],
  ["availability", "Availability"],
  ["termination", "Suspension and termination"],
  ["liability", "Disclaimers and liability"],
  ["changes", "Changes to these terms"],
  ["contact", "Contact"],
];

function TermsSection({
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
  title: "Terms of Service | Vynor",
  description:
    "Read the terms governing access to and use of the Vynor digital workspace.",
  alternates: {
    canonical: "https://vynor.in/terms",
  },
};

export default function TermsPage() {
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
            Built on clear terms.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#fff8f1]/85 sm:text-lg">
            These terms set out the basic rules for using Vynor, managing
            workspace content, and connecting third-party services.
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
              Contact support
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl items-start gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-20">
        <aside className="h-fit self-start rounded-2xl border border-[#302821]/10 bg-white/50 p-5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a45a43]">
            In these terms
          </p>
          <nav className="mt-5 flex flex-col gap-1">
            {sections.map(([id, label], index) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-[#62564c] transition hover:bg-[#c96850]/10 hover:text-[#a94e39]"
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
              Need assistance with Vynor?
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
          <TermsSection id="acceptance" title="01. Acceptance of terms">
            <p>
              These Terms of Service govern your access to and use of Vynor.
              By accessing or using the service, you agree to these terms. If
              you do not agree, do not use Vynor.
            </p>
            <p>
              If you use Vynor on behalf of an organization, you confirm that
              you are authorized to accept these terms on its behalf.
            </p>
          </TermsSection>

          <TermsSection id="service" title="02. The service">
            <p>
              Vynor is a digital workspace intended to support collaboration
              and work management. Depending on the features available, it may
              include workspaces, messaging, meetings, documents, tasks, file
              sharing, and third-party integrations.
            </p>
            <p>
              Features may change as the service develops. We will provide
              notice of material changes where appropriate or required by law.
            </p>
          </TermsSection>

          <TermsSection id="accounts" title="03. Accounts and security">
            <p>
              You are responsible for providing accurate account information,
              protecting your sign-in credentials, and keeping your account
              secure.
            </p>
            <p>
              Do not attempt to access accounts or workspaces without
              authorization. Notify us if you believe your account has been
              compromised.
            </p>
            <p>
              You are responsible for activity through your account, subject
              to rights and protections provided by applicable law.
            </p>
          </TermsSection>

          <TermsSection id="acceptable-use" title="04. Acceptable use">
            <p>You agree not to:</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-[#c96850]">
              <li>Use Vynor in violation of applicable laws.</li>
              <li>Attempt unauthorized access to accounts, workspaces, or systems.</li>
              <li>Interfere with the service's security or operation.</li>
              <li>Upload malware or content designed to harm users or systems.</li>
              <li>Infringe another person's intellectual property, privacy, or rights.</li>
              <li>Abuse the service, exploit vulnerabilities, or bypass access controls.</li>
            </ul>
            <p>
              We may investigate suspected misuse and take reasonable measures
              to protect Vynor, its users, and its infrastructure.
            </p>
          </TermsSection>

          <TermsSection id="content" title="05. Your content and workspaces">
            <p>
              You retain the rights you hold in content you submit to Vynor,
              subject to applicable law and the rights of others.
            </p>
            <p>
              You permit Vynor to host, process, transmit, and display your
              content as reasonably necessary to provide the features you use
              and operate the service.
            </p>
            <p>
              You are responsible for ensuring you have permission to upload
              and share content. Workspace content may be accessible to other
              members according to the workspace's access settings.
            </p>
          </TermsSection>

          <TermsSection id="integrations" title="06. Third-party integrations">
            <p>
              Vynor may allow you to connect services such as Google Calendar.
              By enabling an integration, you authorize the access and actions
              described in the relevant consent screen and settings.
            </p>
            <p>
              Third-party services may have their own terms and privacy
              policies. Your use of those services is subject to their
              applicable conditions.
            </p>
            <p>
              You can revoke Google access through your Google Account
              permissions. Revocation may stop connected features from working
              and does not necessarily delete information already stored in
              Vynor.
            </p>
          </TermsSection>

          <TermsSection id="availability" title="07. Availability and changes">
            <p>
              We aim to keep Vynor useful, secure, and reliable, but we cannot
              guarantee uninterrupted or error-free availability.
            </p>
            <p>
              Maintenance, technical issues, security incidents, or events
              outside our control may affect the service. We may modify or
              discontinue features when reasonably necessary.
            </p>
          </TermsSection>

          <TermsSection
            id="termination"
            title="08. Suspension and termination"
          >
            <p>
              You may stop using Vynor at any time. For account or data
              requests, contact support or use available account controls.
            </p>
            <p>
              We may restrict or suspend access when reasonably necessary to
              address violations of these terms, security risks, misuse, or
              legal requirements.
            </p>
            <p>
              Following termination, some features or content may no longer be
              available. Information handling is described in our{" "}
              <Link
                href="/privacy-policy"
                className="font-medium text-[#a94e39] underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </TermsSection>

          <TermsSection id="liability" title="09. Disclaimers and liability">
            <p>
              To the extent permitted by applicable law, Vynor is provided on
              an “as available” basis. We do not guarantee that the service
              will meet every requirement or always operate without
              interruption.
            </p>
            <p>
              To the extent permitted by law, Vynor will not be liable for
              indirect or consequential losses arising from use of the service.
              Nothing in these terms excludes or limits liability, warranties,
              or consumer rights that cannot legally be excluded or limited.
            </p>
          </TermsSection>

          <TermsSection id="changes" title="10. Changes to these terms">
            <p>
              We may update these terms as Vynor develops or legal requirements
              change. The current version will be published on this page with
              its updated date. We will provide additional notice or seek
              consent when required.
            </p>
          </TermsSection>

          <TermsSection id="contact" title="11. Contact and support">
            <div className="rounded-2xl border border-[#c96850]/25 bg-[#c96850]/[0.07] p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#a94e39]">
                Vynor support
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#302821]">
                We're happy to help.
              </h3>
              <p className="mt-3">
                For questions about these terms, account access, or use of the
                service, contact the Vynor operator.
              </p>
              <a
                href={`mailto:${email}`}
                className="mt-5 inline-flex max-w-full break-all rounded-full bg-[#c96850] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ad503b]"
              >
                {email}
              </a>
            </div>
          </TermsSection>

          <div className="flex flex-col gap-4 border-t border-[#302821]/10 pt-7 text-sm text-[#62564c] sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Vynor</span>
            <div className="flex gap-5">
              <Link
                href="/privacy-policy"
                className="font-medium text-[#a94e39] hover:underline"
              >
                Privacy Policy
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
