import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const routes = [
  "/",
  "/games",
  "/pokedex",
  "/nursery",
  "/profile",
  "/contact",
  "/terms",
  "/privacy",
  "/source-code",
  "/trivia/poke-quiz",
  "/trivia/scramble-surge",
  "/trivia/whos-that-pokemon",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.map((route) => ({
    url: new URL(route, siteUrl).toString(),
    lastModified: now,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
