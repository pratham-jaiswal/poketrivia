import type { Metadata } from "next";
import styles from "../legal.module.scss";

export const metadata: Metadata = {
  title: "Terms | PokéTrivia",
  description: "Terms of use for the PokéTrivia fan project.",
};

export default function TermsPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Terms of Use</p>
        <h1 className={styles.title}>Clear rules for using PokéTrivia.</h1>
        <p className={styles.lead}>Last updated: August 16, 2026.</p>
        <p className={styles.lead}>
          These Terms explain how PokéTrivia works, what is allowed on the
          service, and what you agree to by using the site.
        </p>
      </section>

      <section className={styles.stack}>
        <article className={styles.card}>
          <h2>Acceptance of Terms</h2>
          <p>
            In these Terms, &quot;we&quot;, &quot;us&quot;, and &quot;our&quot;
            refer to the operator of the PokéTrivia service, and &quot;you&quot;
            refers to the person accessing or using the service.
          </p>
          <p className={styles.paragraphGap}>
            By accessing or using PokéTrivia, you confirm that you have read,
            understood, and agree to be bound by these Terms of Use. If you do
            not agree, or if you do not have authority to accept them on behalf
            of another person or organization, you should stop using the service
            immediately. We may update these Terms from time to time, and your
            continued use of PokéTrivia after an update becomes effective means
            you accept the revised version.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Service Description</h2>
          <p>
            PokéTrivia is an unofficial, fan-made Pokémon trivia experience. The
            service is built around short challenge rounds, account-based
            progress tracking, reward systems, and collection-related features
            such as PokéCoins, XP, streaks, and Nursery interaction. We may
            introduce, adjust, or retire features over time as the project
            evolves, and any such change is part of the service you are agreeing
            to use.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Eligibility</h2>
          <p>
            You must be able to form a binding contract under the laws that
            apply to you in order to use the service. If you are under the age
            of majority where you live, you may only use the service with the
            consent and supervision of a parent, guardian, or other responsible
            adult. If you use PokéTrivia on behalf of another person or
            organization, you represent that you have authority to do so and
            that you can bind that person or organization to these Terms.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Moderation and Enforcement</h2>
          <p>
            We may limit, suspend, or remove access if we believe the service is
            being abused, manipulated, or used in a way that harms the platform,
            the underlying systems, or other users. This includes behavior that
            interferes with scoring, reward allocation, account integrity, API
            usage, or normal gameplay.
          </p>
          <ul className={styles.list}>
            <li>
              Do not attempt to cheat, bypass controls, or interfere with
              scoring.
            </li>
            <li>Do not disrupt sessions, APIs, or account access.</li>
            <li>
              Do not use the service for harmful, unlawful, or misleading
              activity.
            </li>
          </ul>
        </article>

        <article className={styles.card}>
          <h2>Privacy and Data Protection</h2>
          <p>
            We collect and process only the data needed to operate the service,
            maintain progress, and secure gameplay. Please review the Privacy
            Policy for a fuller explanation of what data is collected, how it is
            used, how long it is retained, and which third-party services help
            run the site.
          </p>
          <a className={styles.link} href="/privacy">
            Read the Privacy Policy
          </a>
        </article>

        <article className={styles.card}>
          <h2>Disclaimer of Warranties</h2>
          <p>
            PokéTrivia is provided on an &quot;as is&quot; and &quot;as
            available&quot; basis. To the maximum extent permitted by law, we
            disclaim all warranties, express or implied, including implied
            warranties of merchantability, fitness for a particular purpose, and
            non-infringement. We do not guarantee uninterrupted access, complete
            accuracy, or that the service will always be error-free.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, PokéTrivia and its operator
            will not be liable for indirect, incidental, consequential, special,
            exemplary, or punitive damages arising from your use of the service,
            including loss of data, loss of access, or loss of rewards or
            progress.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless the operator from claims,
            losses, damages, or expenses arising from your misuse of the
            service, your violation of these Terms, or your infringement of
            another party&apos;s rights through your use of PokéTrivia.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Third-Party Services</h2>
          <p>
            PokéTrivia relies on third-party services for authentication, hosting, data
            storage, error monitoring, performance monitoring, and other infrastructure.
            These services may process technical, diagnostic, account, or other
            information as necessary to provide their functions, including information
            used to detect errors, investigate technical issues, monitor performance,
            and maintain the reliability and security of the service.
          </p>
          <p className={styles.paragraphGap}>
            Those providers operate under their own terms and privacy policies, and
            their systems may collect or process information independently of us. Please
            review the Privacy Policy for more information about the categories of data
            processed and how third-party services are used.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Governing Law and Jurisdiction</h2>
          <p>
            These Terms are governed by the laws applicable to the
            operator&apos;s principal place of business, without regard to
            conflict-of-law rules. Any dispute will be handled in the courts or
            forums that have proper jurisdiction over that location, unless
            another forum is required by applicable law.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Severability</h2>
          <p>
            If any provision of these terms is found to be unenforceable, the
            remaining provisions will continue in full force and effect.
          </p>
        </article>
      </section>
    </main>
  );
}
