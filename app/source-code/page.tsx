import type { Metadata } from "next";
import styles from "../legal.module.scss";

export const metadata: Metadata = {
  title: "Source Code | PokéTrivia",
  description: "Source code information for the PokéTrivia fan project.",
};

export default function SourceCodePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Source Code</p>
        <h1 className={styles.title}>Open source and easy to review.</h1>
        <p className={styles.lead}>
          PokéTrivia is developed in the open so the code, structure, and
          gameplay systems can be inspected directly on GitHub.
        </p>
      </section>

      <section className={styles.stack}>
        <article className={styles.card}>
          <h2>Open Source</h2>
          <p>The full repository is available here:</p>
          <a
            className={styles.link}
            href="https://github.com/pratham-jaiswal/poketrivia"
            target="_blank"
            rel="noreferrer"
          >
            github.com/pratham-jaiswal/poketrivia
          </a>
        </article>

        <article className={styles.card}>
          <h2>Contributing</h2>
          <p>
            If you would like to contribute, please review the contribution
            guidelines before opening a pull request.
          </p>
          <a
            className={styles.link}
            href="https://github.com/pratham-jaiswal/poketrivia/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noreferrer"
          >
            View contributing guidelines
          </a>
        </article>

        <article className={styles.card}>
          <h2>License</h2>
          <p>The project is distributed under the MIT License.</p>
          <a
            className={styles.link}
            href="https://github.com/pratham-jaiswal/poketrivia/blob/main/LICENSE.md"
            target="_blank"
            rel="noreferrer"
          >
            Read the license on GitHub
          </a>
        </article>

        <article className={styles.card}>
          <h2>Reporting Issues</h2>
          <p>
            Bug reports, feature requests, and technical issues can be submitted
            through the repository issue tracker.
          </p>
          <a
            className={styles.link}
            href="https://github.com/pratham-jaiswal/poketrivia/issues"
            target="_blank"
            rel="noreferrer"
          >
            Open the issues tab
          </a>
        </article>
      </section>
    </main>
  );
}
