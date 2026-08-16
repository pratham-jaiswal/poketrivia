import Link from "next/link";
import styles from "./Footer.module.scss";

const links = [
  { href: "/contact", label: "Contact" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/source-code", label: "Source code" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.topRow}>
        <p className={styles.brand}>PokéTrivia</p>

        <nav className={styles.linkGroup} aria-label="Footer navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <p className={styles.disclaimer}>
        <strong>Disclaimer.</strong> PokéTrivia is an unofficial fan project.
        Pokémon, the Pokémon name, and related names, characters, and assets are
        trademarks of Nintendo, Game Freak, and The Pokémon Company. This
        project is not affiliated with, endorsed by, or sponsored by any of
        those companies.
      </p>

      <p className={styles.meta}>
        © 2023–{year} PokéTrivia · Built by Pratham Jaiswal (MaxxDevs)
      </p>
    </footer>
  );
}
