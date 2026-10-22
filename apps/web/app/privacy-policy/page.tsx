
export const metadata = {
  title: "Privacy Policy | Vynor",
  description: "Learn how Vynor collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-foreground">
      <a href="/" className="text-sm text-muted-foreground hover:underline">
        ← Back to Vynor
      </a>

      <h1 className="mt-8 text-4xl font-bold">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: October 23, 2026
      </p>

      <div className="mt-10 space-y-8 leading-7">
        <section>
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p>
            Vynor is a collaborative workspace for teams. This policy explains
            how information is handled when you use Vynor.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Information We Handle</h2>
          <p>
            Depending on how you use Vynor, we may handle account and profile
            information, workspace membership, messages, meeting details,
            files you upload, and information needed to operate and secure
            the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Google Calendar</h2>
          <p>
            If you connect Google Calendar, Vynor requests permission to create
            and manage calendar events. We use this access to support calendar
            features you initiate, such as scheduling meetings. Google data is
            handled only as needed to provide these features, maintain security,
            and meet applicable legal obligations.
          </p>
          <p>
            You can disconnect Google Calendar through the available
            integration controls. You can also revoke Vynor's access through
            your Google Account settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. How We Use Information</h2>
          <p>
            We use information to provide collaboration features, maintain
            workspaces, troubleshoot issues, protect accounts, and improve
            service reliability. We do not sell personal information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Storage and Security</h2>
          <p>
            We use technical and organizational safeguards intended to protect
            information. No online service can guarantee absolute security.
            Information is retained for as long as reasonably necessary to
            provide the service and meet legal or security requirements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Sharing</h2>
          <p>
            Information may be processed by service providers that help operate
            Vynor, or disclosed when required by law. Workspace information
            may be visible to authorized members of that workspace.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Your Choices</h2>
          <p>
            You may request access, correction, or deletion of personal
            information, subject to applicable law and legitimate retention
            requirements. You can also disconnect integrations you no longer
            want to use.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Contact</h2>
          <p>
            For privacy questions or requests, contact the Vynor service
            operator at the support email published in the application's
            contact information.
          </p>
        </section>
      </div>
    </main>
  );
}
