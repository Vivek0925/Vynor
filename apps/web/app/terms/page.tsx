
export const metadata = {
  title: "Terms of Service | Vynor",
  description: "Terms governing the use of Vynor.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-foreground">
      <a href="/" className="text-sm text-muted-foreground hover:underline">
        ← Back to Vynor
      </a>

      <h1 className="mt-8 text-4xl font-bold">Terms of Service</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: October 23, 2026
      </p>

      <div className="mt-10 space-y-8 leading-7">
        <section>
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Vynor, you agree to these Terms of Service.
            If you do not agree, do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. The Service</h2>
          <p>
            Vynor provides digital workspace features for collaboration,
            communication, meetings, documentation, tasks, and file sharing.
            Features may change as the service develops.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Accounts and Security</h2>
          <p>
            You are responsible for providing accurate account information,
            safeguarding your login credentials, and activity performed
            through your account. Notify us if you suspect unauthorized access.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Acceptable Use</h2>
          <p>
            You must not use Vynor for unlawful activity, interfere with its
            operation, attempt unauthorized access, distribute malicious
            content, or violate the rights of others.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Workspace Content</h2>
          <p>
            You retain applicable rights to content you submit. You are
            responsible for having the necessary rights and permissions to
            upload, share, or process that content. You should only share
            workspace information with authorized people.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Third-Party Services</h2>
          <p>
            Vynor may integrate with third-party services such as Google
            Calendar. Your use of those services may also be subject to their
            own terms and policies. You can disconnect integrations where
            supported.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Availability and Changes</h2>
          <p>
            We aim to keep Vynor available and secure, but uninterrupted
            service cannot be guaranteed. We may update, suspend, or discontinue
            features when reasonably necessary.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Suspension and Termination</h2>
          <p>
            Access may be suspended or terminated for violations of these
            terms, security concerns, legal requirements, or discontinuation
            of the service. Applicable rights and obligations remain subject
            to relevant law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">9. Disclaimers and Liability</h2>
          <p>
            To the extent permitted by applicable law, the service is provided
            on an "as available" basis. Nothing in these terms excludes
            liability or rights that cannot legally be excluded.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">10. Changes to These Terms</h2>
          <p>
            We may update these terms as Vynor evolves. The updated version
            will be published on this page with a revised update date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">11. Contact</h2>
          <p>
            For questions about these terms, contact the Vynor service
            operator using the support email published in the application's
            contact information.
          </p>
        </section>
      </div>
    </main>
  );
}
