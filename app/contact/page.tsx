import type { Metadata } from "next";
import styles from "../legal.module.scss";

export const metadata: Metadata = {
  title: "Contact | PokéTrivia",
  description: "Contact details for the PokéTrivia fan project.",
};

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Contact</p>
        <h1 className={styles.title}>Reach the developer directly.</h1>
        <p className={styles.lead}>
          For bug reports, licensing questions, project feedback, or
          collaboration inquiries, use the channels below. This is the most
          direct way to get a response about PokéTrivia.
        </p>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>Email</h2>
          <p>
            Best for support, questions about the project, or fan-game licensing
            concerns.
          </p>
          <a className={styles.link} href="mailto:contact@prathamjaiswal.com">
            contact@prathamjaiswal.com
          </a>
        </article>

        <article className={styles.card}>
          <h2>GitHub</h2>
          <p>
            Use the repository for source review, issue tracking, and project
            updates.
          </p>
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
          <h2>Developer</h2>
          <p>Pratham Jaiswal</p>
          <p className={styles.meta}>Also known as MaxxDevs</p>
        </article>

        <article className={styles.card}>
          <h2>Website</h2>
          <p>For professional information and additional contact context.</p>
          <a
            className={styles.link}
            href="https://prathamjaiswal.com"
            target="_blank"
            rel="noreferrer"
          >
            prathamjaiswal.com
          </a>
        </article>
      </section>
    </main>
  );
}
