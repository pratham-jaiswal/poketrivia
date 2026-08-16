"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { getPokemonTypeBadgeStyle } from "@/lib/pokemonTypes";
import styles from "./page.module.scss";

type EggOffer = {
  mode: string;
  displayName: string;
  description: string;
  category: "normal" | "legendary" | "mythical";
  quantity: number;
  dialogue: string;
  basePrice: number;
  finalPrice: number;
  discountPercent: number | null;
  discountExpiresAt: string | null;
  availableCount: number;
  canPurchase: boolean;
};

type NurseryProfile = {
  username: string;
  pokecoins: number;
  totalOwned: number;
  totalScore: number;
  loginStreak: number;
};

type HatchResponse = {
  success: boolean;
  hatched: Array<{
    id: number;
    name: string;
    types?: string[];
    frontSpriteUrl: string;
  }>;
  user: {
    username?: string;
    pokecoins?: number;
    pokemons?: Array<{ pokemon: string; count: number }>;
    totalScore?: number;
    loginStreak?: number;
  };
};

type HatchPhase = "idle" | "warming" | "shaking" | "bursting" | "revealed";
type ToastVariant = "error" | "info" | "success";
type ToastItem = {
  id: number;
  title: string;
  message: string;
  variant: ToastVariant;
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const preloadImages = async (urls: string[]) => {
  await Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          image.onload = () => resolve();
          image.onerror = () => resolve();
          image.src = url;
        }),
    ),
  );
};

const titleCase = (value: string) =>
  value
    .split(/([\s-])/)
    .map((part) =>
      part.match(/[\s-]/)
        ? part
        : `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`,
    )
    .join("");

const formatPrice = (value: number) => value.toLocaleString();

const formatDate = (value?: string | null) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const mapUser = (user: HatchResponse["user"]): NurseryProfile | null => {
  if (!user) return null;

  return {
    username: user.username ?? "Trainer",
    pokecoins: user.pokecoins ?? 0,
    totalOwned: Array.isArray(user.pokemons) ? user.pokemons.length : 0,
    totalScore: user.totalScore ?? 0,
    loginStreak: user.loginStreak ?? 0,
  };
};

export default function NurseryClient() {
  const [offers, setOffers] = useState<EggOffer[]>([]);
  const [profile, setProfile] = useState<NurseryProfile | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [hatchPhase, setHatchPhase] = useState<HatchPhase>("idle");
  const [hatchResult, setHatchResult] = useState<HatchResponse | null>(null);
  const [activeHatchIndex, setActiveHatchIndex] = useState(0);
  const [isHatching, setIsHatching] = useState(false);
  const timersRef = useRef<number[]>([]);
  const toastIdRef = useRef(0);

  const selectedOffer = useMemo(
    () =>
      offers.find((offer) => offer.mode === selectedMode) ?? offers[0] ?? null,
    [offers, selectedMode],
  );
  const coins = profile?.pokecoins ?? 0;
  const owned = profile?.totalOwned ?? 0;
  const insufficientCoins =
    Boolean(selectedOffer) && coins < (selectedOffer?.finalPrice ?? 0);
  const stockAvailable = selectedOffer?.canPurchase ?? true;
  const hasEnoughCoins = Boolean(selectedOffer) && !insufficientCoins;
  const isReady =
    Boolean(selectedOffer) && hasEnoughCoins && stockAvailable && !isHatching;
  const hatchCount = hatchResult?.hatched.length ?? 0;
  const activeHatchedPokemon = hatchResult?.hatched[activeHatchIndex];

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const removeToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const notify = (
    message: string,
    options?: { title?: string; variant?: ToastVariant; timeoutMs?: number },
  ) => {
    const id = ++toastIdRef.current;
    const toast: ToastItem = {
      id,
      title:
        options?.title ||
        (options?.variant === "success"
          ? "Success"
          : options?.variant === "info"
            ? "Heads up"
            : "Something went wrong"),
      message,
      variant: options?.variant ?? "error",
    };

    setToasts((current) => [toast, ...current].slice(0, 3));

    const timeout = window.setTimeout(() => {
      removeToast(id);
    }, options?.timeoutMs ?? 4200);

    timersRef.current.push(timeout);
  };

  const friendlyErrorMessage = (
    responseStatus?: number,
    payload?: Record<string, any> | null,
  ) => {
    const code = payload?.code || payload?.extraData?.code;

    if (responseStatus === 401) {
      return "Please log in again to continue in the Nursery.";
    }

    if (responseStatus === 403) {
      return "You do not have access to that Nursery action right now.";
    }

    if (responseStatus === 404) {
      return "The Nursery could not find that request.";
    }

    if (responseStatus === 429) {
      return "Please wait a moment before trying that again.";
    }

    if (code === "PRICE_MISMATCH") {
      return "That egg price changed just now. Please review the updated price and try again.";
    }

    if (code === "NO_AVAILABLE_POKEMON") {
      return "That egg is out of stock for now. Try another one.";
    }

    if (code === "STOCK_CHANGED") {
      return "That hatch sold out a moment ago. Please try another egg.";
    }

    if (code === "INSUFFICIENT_COINS") {
      return "You do not have enough Pokecoins for that egg.";
    }

    if (typeof payload?.message === "string" && payload.message.length > 0) {
      return payload.message;
    }

    return "We could not complete that Nursery action right now. Please try again.";
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [pricingResponse, profileResponse] = await Promise.all([
          fetch("/api/pokemon-nursery/pricing", { credentials: "same-origin" }),
          fetch("/api/user", { credentials: "same-origin" }),
        ]);

        if (!pricingResponse.ok) {
          const payload = await pricingResponse.json().catch(() => null);
          const message = friendlyErrorMessage(pricingResponse.status, payload);
          notify(message);
          throw new Error(message);
        }

        if (!profileResponse.ok) {
          const payload = await profileResponse.json().catch(() => null);
          const message = friendlyErrorMessage(profileResponse.status, payload);
          notify(message);
          throw new Error(message);
        }

        const pricingJson = await pricingResponse.json();
        const profileJson = await profileResponse.json();

        if (!mounted) return;

        const nextOffers = pricingJson.data || [];
        setOffers(nextOffers);
        setSelectedMode(
          (nextOffers.find((offer: EggOffer) => offer.canPurchase)?.mode ||
            nextOffers[0]?.mode ||
            "") as string,
        );
        setProfile(profileJson.user ?? null);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Unable to load Nursery.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const markVisited = async () => {
      try {
        await fetch("/api/user/visited", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field: "visitedPokemonNursery" }),
        });
      } catch {
        // Non-blocking. The Nursery should still function without this update.
      }
    };

    load();
    markVisited();

    return () => {
      mounted = false;
      clearTimers();
    };
  }, []);

  useEffect(() => {
    if (!offers.length) return;
    if (!selectedMode) {
      setSelectedMode(
        offers.find((offer) => offer.canPurchase)?.mode || offers[0].mode,
      );
      return;
    }

    const modeExists = offers.some((offer) => offer.mode === selectedMode);
    if (!modeExists) {
      setSelectedMode(
        offers.find((offer) => offer.canPurchase)?.mode || offers[0].mode,
      );
    }
  }, [offers, selectedMode]);

  const handleSelectOffer = (mode: string) => {
    if (isHatching) return;
    setSelectedMode(mode);
    setError(null);
    setHatchResult(null);
    setActiveHatchIndex(0);
    setHatchPhase("idle");
  };

  const handleHatch = async () => {
    if (!selectedOffer || isHatching) return;

    if (!stockAvailable) {
      notify("That egg is out of stock right now. Try another one.");
      return;
    }

    if (insufficientCoins) {
      notify(
        `You need ${formatPrice(
          selectedOffer.finalPrice - coins,
        )} more Pokecoins to hatch this egg.`,
      );
      return;
    }

    setError(null);
    setHatchResult(null);
    setActiveHatchIndex(0);
    setIsHatching(true);
    setHatchPhase("warming");
    clearTimers();

    timersRef.current.push(
      window.setTimeout(() => setHatchPhase("shaking"), 520),
    );

    try {
      const response = await fetch("/api/pokemon-nursery/hatch", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: selectedOffer.mode,
          clientPrice: selectedOffer.finalPrice,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = friendlyErrorMessage(response.status, payload);
        notify(message);
        throw new Error(message);
      }

      const data = (await response.json()) as HatchResponse;
      const spriteUrls = data.hatched
        .map((pokemon) => pokemon.frontSpriteUrl)
        .filter(Boolean);

      await preloadImages(spriteUrls);

      setHatchPhase("bursting");
      await sleep(650);

      setHatchResult(data);
      setActiveHatchIndex(0);
      setProfile(mapUser(data.user));
      setHatchPhase("revealed");
    } catch (err: any) {
      setError(null);
      setHatchPhase("idle");
    } finally {
      clearTimers();
      setIsHatching(false);
    }
  };

  const handleReset = () => {
    if (isHatching) return;
    setHatchResult(null);
    setActiveHatchIndex(0);
    setHatchPhase("idle");
    setError(null);
  };

  const hatchStatus =
    hatchPhase === "idle"
      ? "Choose an egg to begin."
      : hatchPhase === "warming"
        ? "The egg is warming up..."
        : hatchPhase === "shaking"
          ? "Something is moving inside..."
          : hatchPhase === "bursting"
            ? "The shell is cracking!"
            : "A Pokemon has hatched!";

  if (loading) {
    return (
      <section className={styles.loadingPanel}>
        <p className={styles.kicker}>Pokemon Nursery</p>
        <h2 className={styles.loadingTitle}>Loading your hatchery...</h2>
        <p className={styles.description}>
          Gathering the Nursery stock and checking your trainer records.
        </p>
      </section>
    );
  }

  if (error && !offers.length) {
    return (
      <section className={styles.errorPanel}>
        <p className={styles.kicker}>Pokemon Nursery</p>
        <h1 className={styles.title}>The incubator is offline.</h1>
        <p className={styles.description}>{error}</p>
      </section>
    );
  }

  return (
    <div className={styles.nurseryLayout}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Pokemon Nursery</p>
          <p className={styles.heroLead}>
            Spend Pokecoins to crack open a Nursery run and reveal what
            hatches.
          </p>
        </div>

        <div className={styles.statsStrip}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Pokecoins</span>
            <strong>{formatPrice(coins)}</strong>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Pokemon owned</span>
            <strong>{formatPrice(owned)}</strong>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Hatch state</span>
            <strong>{isHatching ? "In progress" : "Ready"}</strong>
          </div>
        </div>
      </section>

      <section className={styles.mainGrid}>
        <div className={styles.offerColumn}>
          <div className={styles.sectionHeader}>
            <h2>Catalog</h2>
            <span>Tap an egg to set the hatch chamber.</span>
          </div>

          <div className={styles.offerGrid}>
            {offers.map((offer) => {
              const active = offer.mode === selectedOffer?.mode;
              const locked = isHatching;

              return (
                <button
                  key={offer.mode}
                  type="button"
                  className={`${styles.offerCard} ${active ? styles.offerCardActive : ""}`}
                  onClick={() => handleSelectOffer(offer.mode)}
                  disabled={locked || !offer.canPurchase}
                >
                  <div className={styles.offerTop}>
                    <span className={styles.offerBadge}>
                      {titleCase(offer.category)}
                    </span>
                    <span className={styles.offerPrice}>
                      {formatPrice(offer.finalPrice)} coins
                    </span>
                  </div>
                  <h3>{offer.displayName}</h3>
                  <p>{offer.description}</p>
                  <div className={styles.offerMeta}>
                    {offer.discountPercent ? (
                      <span>
                        Discount {offer.discountPercent}% until{" "}
                        {formatDate(offer.discountExpiresAt)}
                      </span>
                    ) : (
                      <span>Standard Nursery run</span>
                    )}
                  </div>
                  <div className={styles.offerFooter}>
                    <span className={styles.offerDialogue}>
                      {offer.dialogue}
                    </span>
                    <span className={styles.offerSelect}>
                      {!offer.canPurchase
                        ? "Sold out"
                        : active
                          ? "Selected"
                          : "Select"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className={styles.chamberColumn}>
          <div className={styles.sectionHeader}>
            <h2>Hatch chamber</h2>
            <span>{hatchStatus}</span>
          </div>

          <div className={`${styles.chamber} ${styles[`phase_${hatchPhase}`]}`}>
            <div className={styles.chamberGlow} />
            {hatchResult ? (
              <div className={styles.chamberResults}>
                <div className={styles.chamberResultHeader}>
                  <span className={styles.revealBadge}>Hatch complete</span>
                  <strong>{hatchCount} Pokemon hatched</strong>
                </div>

                <div className={styles.hatchedCarousel}>
                  <button
                    type="button"
                    className={styles.carouselArrow}
                    onClick={() =>
                      setActiveHatchIndex((current) =>
                        (current - 1 + hatchCount) % hatchCount,
                      )
                    }
                    disabled={hatchCount < 2}
                    aria-label="Show previous hatched Pokemon"
                  >
                    &#8592;
                  </button>

                  {activeHatchedPokemon && (
                    <article
                      className={styles.revealCard}
                      key={activeHatchedPokemon.id}
                    >
                      <div className={styles.spriteWrap}>
                        <img
                          src={activeHatchedPokemon.frontSpriteUrl}
                          alt={titleCase(activeHatchedPokemon.name)}
                          className={styles.sprite}
                        />
                      </div>

                      <h3 className={styles.revealName}>
                        {titleCase(activeHatchedPokemon.name)}
                      </h3>

                      <div className={styles.revealTypes}>
                        {activeHatchedPokemon.types?.length ? (
                          activeHatchedPokemon.types.map((type) => (
                            <span
                              key={type}
                              className={styles.typeBadge}
                              style={getPokemonTypeBadgeStyle(type)}
                            >
                              {titleCase(type)}
                            </span>
                          ))
                        ) : (
                          <span className={styles.typeBadge}>Unknown</span>
                        )}
                      </div>
                    </article>
                  )}

                  <button
                    type="button"
                    className={styles.carouselArrow}
                    onClick={() =>
                      setActiveHatchIndex((current) =>
                        (current + 1) % hatchCount,
                      )
                    }
                    disabled={hatchCount < 2}
                    aria-label="Show next hatched Pokemon"
                  >
                    &#8594;
                  </button>
                </div>

                <div className={styles.carouselDots} aria-hidden="true">
                  {hatchResult.hatched.map((pokemon, index) => (
                    <span
                      key={pokemon.id}
                      className={`${styles.carouselDot} ${index === activeHatchIndex ? styles.carouselDotActive : ""}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.eggshellWrap}>
                <motion.div
                  className={styles.eggAura}
                  animate={
                    hatchPhase === "warming"
                      ? {
                        scale: [1, 1.08, 1],
                        opacity: [0.72, 0.95, 0.72],
                      }
                      : hatchPhase === "shaking"
                        ? {
                          scale: [1, 1.12, 1],
                          opacity: [0.72, 1, 0.72],
                        }
                        : hatchPhase === "bursting"
                          ? {
                            scale: [1, 1.2, 1.08, 1.2],
                            opacity: [0.8, 1, 0.85, 1],
                          }
                          : {
                            scale: 1,
                            opacity: 0.72,
                          }
                  }
                  transition={{
                    duration:
                      hatchPhase === "bursting"
                        ? 0.7
                        : hatchPhase === "shaking"
                          ? 0.6
                          : 1.2,
                    ease: "easeInOut",
                    repeat:
                      hatchPhase === "warming" ||
                        hatchPhase === "shaking" ||
                        hatchPhase === "bursting"
                        ? Infinity
                        : 0,
                  }}
                />

                <motion.div
                  className={styles.eggShell}
                  animate={
                    hatchPhase === "shaking"
                      ? {
                        rotate: [0, -3, 3, -4, 4, -2, 0],
                        x: [0, -2, 2, -3, 3, -1, 0],
                        scale: [1, 1.01, 0.99, 1.02, 0.99, 1],
                      }
                      : hatchPhase === "bursting"
                        ? {
                          rotate: [0, -5, 6, -7, 5, -5, 3, 0],
                          x: [0, -3, 4, -4, 3, -3, 2, 0],
                          scale: [1, 1.025, 0.975, 1.03, 0.985, 1.015, 1],
                        }
                        : {
                          rotate: 0,
                          x: 0,
                          scale: 1,
                        }
                  }
                  transition={{
                    duration: hatchPhase === "bursting" ? 0.7 : 0.6,
                    ease: "easeInOut",
                    repeat:
                      hatchPhase === "shaking" || hatchPhase === "bursting"
                        ? Infinity
                        : 0,
                  }}
                >
                  <div className={styles.eggHighlight} />
                  <motion.svg
                    className={styles.eggCrack}
                    viewBox="0 0 176 224"
                    aria-hidden="true"
                  >
                    <motion.path
                      d="M88 82 L79 91 L91 99 L76 110 L91 118 L78 130 L92 137"
                      fill="none"
                      stroke="rgba(74, 48, 18, 0.82)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={
                        hatchPhase === "bursting" || hatchPhase === "revealed"
                          ? { pathLength: 1, opacity: 1 }
                          : { pathLength: 0, opacity: 0 }
                      }
                      transition={{
                        pathLength: {
                          duration: 0.42,
                          ease: "easeOut",
                        },
                        opacity: {
                          duration: 0.05,
                        },
                      }}
                    />

                    <motion.path
                      d="M79 91 L63 87 L54 96"
                      fill="none"
                      stroke="rgba(74, 48, 18, 0.72)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={
                        hatchPhase === "bursting" || hatchPhase === "revealed"
                          ? { pathLength: 1, opacity: 1 }
                          : { pathLength: 0, opacity: 0 }
                      }
                      transition={{
                        pathLength: {
                          delay: 0.18,
                          duration: 0.24,
                          ease: "easeOut",
                        },
                        opacity: {
                          duration: 0.05,
                        },
                      }}
                    />

                    <motion.path
                      d="M91 118 L106 114 L116 122"
                      fill="none"
                      stroke="rgba(74, 48, 18, 0.72)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={
                        hatchPhase === "bursting" || hatchPhase === "revealed"
                          ? { pathLength: 1, opacity: 1 }
                          : { pathLength: 0, opacity: 0 }
                      }
                      transition={{
                        pathLength: {
                          delay: 0.28,
                          duration: 0.22,
                          ease: "easeOut",
                        },
                        opacity: {
                          duration: 0.05,
                        },
                      }}
                    />

                    <motion.circle
                      cx="88"
                      cy="110"
                      r="31"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.72)"
                      strokeWidth="3"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={
                        hatchPhase === "bursting"
                          ? {
                            scale: [0.7, 1.08, 1],
                            opacity: [0, 0.8, 0],
                          }
                          : {
                            scale: 0.7,
                            opacity: 0,
                          }
                      }
                      transition={{
                        duration: 0.5,
                        ease: "easeOut",
                      }}
                    />
                  </motion.svg>
                </motion.div>
              </div>
            )}

            {!hatchResult && (
              <div className={styles.chamberText}>
                <p className={styles.chamberLabel}>
                  {selectedOffer ? selectedOffer.displayName : "No egg selected"}
                </p>
                <p>
                  {selectedOffer?.dialogue ||
                    "Choose an egg to begin the hatch."}
                </p>
              </div>
            )}
          </div>

          <div className={styles.actionBar}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={hatchResult ? handleReset : handleHatch}
              disabled={hatchResult ? isHatching : !isReady}
            >
              {hatchResult
                ? "Choose another egg"
                : isHatching
                  ? "Hatching..."
                  : selectedOffer && !hasEnoughCoins
                    ? "Need more coins"
                    : "Hatch Egg"}
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleReset}
              disabled={isHatching}
            >
              Reset
            </button>
          </div>

          {error && offers.length > 0 && (
            <p className={styles.inlineError}>{error}</p>
          )}

          {selectedOffer && insufficientCoins && !error && (
            <p className={styles.balanceHint}>
              You need {formatPrice(selectedOffer.finalPrice - coins)} more
              Pokecoins to hatch this egg.
            </p>
          )}

          <div className={styles.toastStack} aria-live="polite" aria-atomic="true">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`${styles.toast} ${styles[`toast_${toast.variant}`]}`}
              >
                <strong>{toast.title}</strong>
                <span>{toast.message}</span>
                <button
                  type="button"
                  className={styles.toastDismiss}
                  onClick={() => removeToast(toast.id)}
                  aria-label="Dismiss notification"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
