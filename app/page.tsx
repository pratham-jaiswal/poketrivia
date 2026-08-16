import type { Metadata } from "next";
import Link from "next/link";
import styles from "./home.module.scss";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Play PokéTrivia, earn rewards, hatch Pokémon in the Nursery, and build your Pokédex in this fan-made Pokémon game.",
};

export default function HomePage() {
  return (
    <main className={styles.homePage}>
      <section className={styles.heroPanel}>
        <div className={styles.heroIntro}>
          <p className={styles.eyebrow}>Fan-made Pokémon trivia game</p>
          <h1 className={styles.title}>PokéTrivia</h1>
          <p className={styles.intro}>
            Think you know Pokémon? Prove it and complete your Pokédex.
          </p>

          <div className={styles.buttonRow}>
            <Link
              className={`${styles.button} ${styles.primary}`}
              href="/games"
            >
              Start Playing
            </Link>
            <Link
              className={`${styles.button} ${styles.secondary}`}
              href="/pokedex"
            >
              Open Pokédex
            </Link>
          </div>
        </div>

        <aside className={styles.heroCard}>
          <div className={styles.cardBadge}>How it works</div>
          <h2>Your journey starts here.</h2>
          <ul className={styles.heroList}>
            <li>Choose from multiple game modes</li>
            <li>Earn PokéCoins and XP</li>
            <li>
              Spend PokéCoins in the Nursery to hatch Pokémon and complete your
              Pokédex
            </li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
