import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PokéTrivia",
    short_name: "PokéTrivia",
    description:
      "Test your Pokémon knowledge, earn PokéCoins, hatch Pokémon, and complete your Pokédex in this fan-made trivia game.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#09080b",
    theme_color: "#ffcb05",
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
    id: new URL("/", siteUrl).toString(),
  };
}
