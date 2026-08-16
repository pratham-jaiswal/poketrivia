import type { Metadata } from "next";
import { GameClient } from "../GameClient";

export const metadata: Metadata = {
  title: "Poké Quiz",
  description:
    "Play a PokéTrivia trivia round and answer lore-based Pokémon questions.",
};

export default function PokeQuizPage() {
  return (
    <GameClient
      title="Poké Quiz"
      description="Answer lore-based Pokémon trivia to sharpen your knowledge."
      gameType="fact"
    />
  );
}
