import type { Metadata } from "next";
import ProfileCard from "../components/ProfileCard";
import styles from "./profile.module.scss";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Review your PokéTrivia trainer profile, rewards, PokéCoins, and owned Pokémon count.",
};

export default function ProfilePage() {
  return (
    <main className={`page-shell ${styles.profilePage}`}>
      <section className={styles.header}>
        <div>
          <h1 className={styles.title}>Profile</h1>
          <p className={styles.description}>
            Review your trainer account, points, Pokécoins, and owned Pokémon
            count in a safe profile view.
          </p>
        </div>
      </section>
      <ProfileCard />
    </main>
  );
}
