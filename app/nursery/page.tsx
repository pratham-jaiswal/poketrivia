import type { Metadata } from "next";
import Link from "next/link";
import { validateAuth } from "@/lib/authMiddleware";
import NurseryClient from "./NurseryClient";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Nursery",
  description:
    "Spend PokéCoins in the PokéTrivia Nursery, hatch Pokémon, and grow your collection.",
};

export default async function NurseryPage() {
  let user = null;

  try {
    const auth = await validateAuth();
    user = auth.user;
  } catch (err) {
    user = null;
  }

  if (!user) {
    return (
      <main className={`page-shell ${styles.nurseryPage}`}>
        <section className={styles.loginPanel}>
          <p className={styles.kicker}>Pokémon Nursery</p>
          <h1 className={styles.title}>
            Your eggs are waiting in the Nursery.
          </h1>
          <p className={styles.description}>
            Log in to hatch Pokémon, spend Pokécoins, and expand your collection
            with a full Nursery run.
          </p>
          <Link href="/auth/login" className={styles.primaryButton}>
            Login to hatch
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={`page-shell ${styles.nurseryPage}`}>
      <NurseryClient />
    </main>
  );
}
