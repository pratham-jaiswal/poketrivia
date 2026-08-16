import type { Metadata } from "next";
import { GameClient } from "../GameClient";

export const metadata: Metadata = {
  title: "Scramble Surge",
  description:
    "Play a Pokémon word scramble round and race through a focused PokéTrivia challenge.",
};

export default function ScrambleSurgePage() {
  return (
    <GameClient
      title="Scramble Surge"
      description="Unscramble Pokémon names."
      gameType="scramble"
    />
  );
}
