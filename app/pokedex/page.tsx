import type { Metadata } from "next";
import Link from "next/link";
import { validateAuth } from "@/lib/authMiddleware";
import PokedexShell from "./PokedexShell";
import styles from "./pokedex.module.scss";

export const metadata: Metadata = {
  title: "Pokédex",
  description:
    "Browse your PokéTrivia Pokédex, review owned Pokémon, and explore the collection you have unlocked.",
};

export default async function PokedexPage() {
  let user = null;

  try {
    const auth = await validateAuth();
    user = auth.user;
  } catch (err) {
    user = null;
  }

  if (!user) {
    return (
      <main className={`page-shell ${styles.pokedexPage}`}>
        <section className={styles.loginPanel}>
          <p className={styles.kicker}>Pokedex</p>
          <p className={styles.description}>
            You must be logged in to view the Pokedex.
          </p>
          <Link href="/auth/login" className={styles.primaryButton}>
            Login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      {/* Pokedex client handles filtering, pagination, and rendering */}
      <PokedexShell />
    </main>
  );
}
