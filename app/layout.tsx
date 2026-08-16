import "./globals.scss";
import styles from "./layout.module.scss";
import type { Metadata } from "next";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ToastProvider } from "./components/ToastProvider";
import { validateAppConfig } from "@/lib/config";

validateAppConfig();

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
  title: {
    default: "PokéTrivia",
    template: "%s | PokéTrivia",
  },
  description:
    "Test your Pokémon knowledge, earn PokéCoins, hatch Pokémon, and complete your Pokédex in this fan-made trivia game.",
  applicationName: "PokéTrivia",
  keywords: ["Pokémon", "trivia", "Pokédex", "fan game", "quiz", "nursery"],
  authors: [{ name: "Pratham Jaiswal (MaxxDevs)" }],
  creator: "Pratham Jaiswal (MaxxDevs)",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    title: "PokéTrivia",
    description:
      "Test your Pokémon knowledge, earn PokéCoins, hatch Pokémon, and complete your Pokédex in this fan-made trivia game.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "PokéTrivia",
    description:
      "Test your Pokémon knowledge, earn PokéCoins, hatch Pokémon, and complete your Pokédex in this fan-made trivia game.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <div className={styles.app}>
            <a className={styles.skipLink} href="#main-content">
              Skip to content
            </a>
            <Navbar />
            <div className={styles.pageShell} id="main-content">
              {children}
            </div>
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
