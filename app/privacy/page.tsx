import type { Metadata } from "next";
import styles from "../legal.module.scss";

export const metadata: Metadata = {
  title: "Privacy | PokéTrivia",
  description: "Privacy policy for the PokéTrivia fan project.",
};

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Privacy Policy</p>
        <h1 className={styles.title}>How PokéTrivia handles data.</h1>
        <p className={styles.lead}>Last updated: August 16, 2026.</p>
        <p className={styles.lead}>
          This policy explains what data the site collects, why it is used, how
          it is protected, and the choices you have when you play PokéTrivia.
        </p>
      </section>

      <section className={styles.stack}>
        <article className={styles.card}>
          <h2>1. Information we collect</h2>
          <p>
            We collect only the information needed to operate the service,
            maintain your progress, and keep the platform secure. Depending on
            how you use PokéTrivia, this may include:
          </p>
          <ul className={styles.list}>
            <li>
              Account details returned by the authentication provider, such as
              your name, email address, and profile image if available.
            </li>
            <li>
              Gameplay data, including session records, scores, XP, coins,
              streaks, quiz choices, and collection progress.
            </li>
            <li>
              Basic technical and diagnostic data needed to operate, secure, and improve
              the site, which may include device and browser information, request and
              session metadata, timestamps, error reports, stack traces, and information
              about page or request performance.
            </li>
          </ul>
        </article>

        <article className={styles.card}>
          <h2>2. How we use information</h2>
          <p>
            We use the information we collect to deliver the experience you
            expect from the site, to keep accounts working, and to protect the
            service from abuse or misuse.
          </p>
          <ul className={styles.list}>
            <li>Authenticate users and maintain account access.</li>
            <li>
              Save progress, rewards, and collection state between visits.
            </li>
            <li>
              Prevent abuse, enforce rate limits, and secure game sessions.
            </li>
            <li>
              Detect, investigate, and resolve errors and technical problems.
            </li>
            <li>
              Monitor site performance and identify slow or failing requests and pages.
            </li>
            <li>
              Improve the reliability, security, and performance of the service.
            </li>
            <li>
              Respond to support questions, bug reports, and service issues.
            </li>
          </ul>
        </article>

        <article className={styles.card}>
          <h2>3. Error and performance monitoring</h2>
          <p>
            We use third-party monitoring and diagnostic services to help us detect,
            investigate, and fix technical problems and to understand how the site
            performs. These services may receive technical information such as error
            reports, stack traces, browser and device information, request or page
            metadata, timestamps, and performance measurements such as request or page
            loading times.
          </p>
          <p className={styles.paragraphGap}>
            This information is used for debugging, reliability, performance
            monitoring, and improving the service. We do not use this information for advertising
            or unrelated tracking. Depending on the circumstances, diagnostic events may
            be associated with technical or account-related identifiers available to
            the service at the time the event occurs.
          </p>
        </article>

        <article className={styles.card}>
          <h2>4. Sharing and third parties</h2>
          <p>
            We do not sell personal information. Data may be processed by third-party
            service providers that help us run, secure, monitor, and improve the site,
            including authentication, hosting, database, error monitoring, and
            performance monitoring providers. These providers may process technical,
            diagnostic, account, or gameplay-related information as necessary to
            provide their services. Those providers operate under their own privacy
            policies and may retain information according to their applicable terms
            and configurations.
          </p>
        </article>

        <article className={styles.card}>
          <h2>5. Cookies and sessions</h2>
          <p>
            The site may use authentication cookies or similar session
            mechanisms so you can stay signed in and continue playing. These are
            used for account access, session continuity, and security, not for
            advertising or unrelated tracking.
          </p>
        </article>

        <article className={styles.card}>
          <h2>6. Retention</h2>
          <p>
            We keep account, gameplay, technical, and diagnostic information
            for as long as it is needed to operate the service, maintain progress,
            monitor and improve reliability and performance, or satisfy legal and
            security requirements. If the service changes or you request
            removal, data may be updated or deleted where reasonably possible,
            although some information may remain in backups or records for a
            limited period.
          </p>
        </article>

        <article className={styles.card}>
          <h2>7. Your choices</h2>
          <p>
            You may review or update your account information through the
            relevant authentication provider or by contacting us. If you want to
            ask about access, correction, deletion, or portability of your data,
            use the contact details below and we will review the request where
            applicable.
          </p>
        </article>

        <article className={styles.card}>
          <h2>8. Security</h2>
          <p>
            We use reasonable technical and operational safeguards to protect
            the service, but no system can be guaranteed to be perfectly secure.
            You should also protect your own account access and let us know if
            you suspect unauthorized activity.
          </p>
        </article>

        <article className={styles.card}>
          <h2>9. Contact</h2>
          <p>
            Questions about this policy can be sent to
            contact@prathamjaiswal.com. You may also use the contact page for
            support or privacy-related requests.
          </p>
        </article>
      </section>
    </main>
  );
}
