"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./ProfileCard.module.scss";

type ProfileResponse = {
  user: {
    id: string;
    username: string;
    email: string;
    totalScore: number;
    pokecoins: number;
    totalOwned: number;
    loginStreak: number;
    createdAt?: string;
    lastDailyBonus?: string;
  } | null;
};

const formatDate = (value?: string) => {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return "Never";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ProfileCard() {
  const [profile, setProfile] = useState<ProfileResponse["user"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user", { credentials: "same-origin" });
        if (!res.ok) {
          if (res.status === 401) {
            setError("You are not logged in.");
          } else {
            setError("Unable to load profile.");
          }
          return;
        }

        const data = (await res.json()) as ProfileResponse;
        if (mounted) setProfile(data.user);
      } catch (err) {
        if (mounted) setError("Unable to load profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className={styles.message}>Loading profile…</div>;
  }

  if (error || !profile) {
    return (
      <div className={styles.emptyState}>
        <p>{error ?? "You are not logged in."}</p>
        <Link href="/auth/login" className="button primary">
          Login
        </Link>
      </div>
    );
  }

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className={styles.tag}>Trainer Profile</p>
          <h2 className={styles.title}>{profile.username}</h2>
          <p className={styles.subtitle}>{profile.email}</p>
        </div>

        <div className={styles.metaBlock}>
          <span className={styles.metaLabel}>Member since</span>
          <span className={styles.metaValue}>
            {formatDate(profile.createdAt)}
          </span>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Total score</span>
          <span className={styles.statValue}>{profile.totalScore}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Pokécoins</span>
          <span className={styles.statValue}>{profile.pokecoins}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Pokémon owned</span>
          <span className={styles.statValue}>{profile.totalOwned}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Login streak</span>
          <span className={styles.statValue}>{profile.loginStreak}</span>
        </div>
      </div>

      <div className={styles.bonusRow}>
        <div className={styles.bonusInfo}>
          <span className={styles.bonusLabel}>Last daily bonus claimed</span>
          <span className={styles.bonusValue}>
            {formatDate(profile.lastDailyBonus)}
          </span>
        </div>
        <div className={styles.actions}>
          <Link href="/auth/logout" className="button secondary">
            Logout
          </Link>
        </div>
      </div>
    </section>
  );
}
