"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import styles from "./Navbar.module.scss";

const links = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/pokedex", label: "Pokédex" },
  { href: "/nursery", label: "Nursery" },
];

export function Navbar() {
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`${styles.header} ${mobileOpen ? styles.mobileOpen : ""}`}
    >
      <div className={styles.brand}>
        <Link href="/">PokéTrivia</Link>
        <span className={styles.pokeball} aria-hidden="true" />
      </div>

      <button
        type="button"
        className={styles.hamburger}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
        aria-controls="primary-navigation"
        onClick={() => setMobileOpen((s) => !s)}
      >
        <span className={styles.hamburgerBox} />
      </button>

      <nav className={styles.nav} id="primary-navigation">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={styles.link}
            aria-current={isActive(link.href) ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}

        {isLoading ? (
          <div className={`${styles.link} ${styles.secondary}`}>Loading…</div>
        ) : user ? (
          <div className={styles.userWrap}>
            <button
              type="button"
              className={styles.userBtn}
              aria-label="Open user menu"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((s) => !s)}
            >
              {(() => {
                const placeholder =
                  "data:image/svg+xml;utf8," +
                  encodeURIComponent(
                    "<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='%2307101d'/><circle cx='64' cy='64' r='46' fill='%23ffffff'/></svg>",
                  );

                return (
                  <img
                    src={user.picture || placeholder}
                    alt={user.name || "User avatar"}
                    className={styles.avatar}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = placeholder;
                    }}
                  />
                );
              })()}
            </button>

            {open && (
              <div className={styles.dropdown} role="menu">
                <Link
                  href="/profile"
                  className={styles.dropdownItem}
                  role="menuitem"
                >
                  Profile
                </Link>
                <a
                  className={styles.dropdownItem}
                  href="/auth/logout"
                  role="menuitem"
                >
                  Logout
                </a>
              </div>
            )}
          </div>
        ) : (
          <a
            className={`${styles.link} ${styles.secondary}`}
            href="/auth/login"
          >
            Login
          </a>
        )}
      </nav>

      {mobileOpen && (
        <div className={styles.mobileMenu} id="mobile-navigation">
          <div className={styles.mobileLinks}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.mobileLink}
                aria-current={isActive(link.href) ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className={styles.mobileAuth}>
            {isLoading ? (
              <div className={`${styles.link} ${styles.secondary}`}>
                Loading…
              </div>
            ) : user ? (
              <>
                <Link
                  href="/profile"
                  className={styles.mobileLink}
                  onClick={() => setMobileOpen(false)}
                >
                  {user.nickname || user.name || "Profile"}
                </Link>
                <a className={styles.mobileLink} href="/auth/logout">
                  Logout
                </a>
              </>
            ) : (
              <a className={styles.mobileLink} href="/auth/login">
                Login
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
