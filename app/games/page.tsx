import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.scss";
import { validateAuth } from "@/lib/authMiddleware";

export const metadata: Metadata = {
  title: "Games",
  description:
    "Choose a PokéTrivia challenge mode, earn rewards, and jump into quick Pokémon-themed rounds.",
};

const modes = [
  {
    id: "poke-quiz",
    title: "Poké Quiz",
    description:
      "Answer lore-based Pokémon trivia to sharpen your knowledge and earn rewards.",
    badge: "Trivia",
    href: "/trivia/poke-quiz",
  },
  {
    id: "scramble-surge",
    title: "Scramble Surge",
    description:
      "Unscramble Pokémon names and earn rewards.",
    badge: "Word Challenge",
    href: "/trivia/scramble-surge",
  },
  {
    id: "whos-that-pokemon",
    title: "Who's That Pokémon?",
    description:
      "Identify the silhouette and prove you can recognize every pokémon.",
    badge: "Silhouette Puzzle",
    href: "/trivia/whos-that-pokemon",
  },
];

export default async function PlayModesPage() {
  let user = null;

  try {
    const auth = await validateAuth();
    user = auth.user;
  } catch (err) {
    user = null;
  }

  return (
    <main className={styles.playModesPage}>
      <section className={styles.hero}>
        <p className={styles.badge}>Play Modes</p>
        <h1>Step into the Trivia Arena</h1>
        <p>
          Choose your battle mode, challenge your Pokémon knowledge, and track
          your progress as you grow your Pokédex with every win.
        </p>
      </section>

      <section className={styles.grid}>
        {modes.map((mode) => (
          <article key={mode.id} className={styles.card}>
            <div className={styles.cardHeading}>
              <span className={styles.badge}>{mode.badge}</span>
              <h2>{mode.title}</h2>
              <p className={styles.description}>{mode.description}</p>
            </div>
            <div className={styles.cardFooter}>
              {
                user ?
                  <Link className={styles.cta} href={mode.href}>
                    Play now
                  </Link> :
                  <Link href="/auth/login" className={styles.cta}>
                    Login to play
                  </Link>
              }
            </div>
          </article>
        ))}
      </section>

      <aside className={styles.notice}>
        <strong>Tip:</strong> Try each mode to rack up rewards, then come back
        when you’re ready for a new challenge.
      </aside>
    </main>
  );
}
