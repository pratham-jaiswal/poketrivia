import type { Metadata } from "next";
import Link from "next/link";
import { validateAuth } from "@/lib/authMiddleware";
import PokedexShell from "./PokedexShell";

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
      <main className="page-shell">
        <h1>Pokedex</h1>
        <p>You must be logged in to view the Pokedex.</p>
        <div style={{ marginTop: "1rem" }}>
          <Link href="/auth/login" className="button primary">
            Login
          </Link>
        </div>
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
