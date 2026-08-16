import type { Metadata } from "next";
import { GameClient } from "../GameClient";

export const metadata: Metadata = {
  title: "Who's That Pokémon?",
  description:
    "Play the silhouette challenge and test your Pokémon recognition in PokéTrivia.",
};

export default function WTPPage() {
  return (
    <GameClient
      title="Who's That Pokémon?"
      description="Identify the silhouette and prove your Pokémon recognition skills."
      gameType="image"
    />
  );
}
