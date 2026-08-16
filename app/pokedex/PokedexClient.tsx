"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { BookOpen, Funnel } from "lucide-react";
import { getPokemonTypeBadgeStyle } from "@/lib/pokemonTypes";
import { useToast } from "@/app/components/ToastProvider";
import styles from "./pokedex.module.scss";

type Pokemon = any;

const titleCase = (value: string) =>
  value
    .split(/([\s-])/)
    .map((part) =>
      part.match(/\s|-/)
        ? part
        : `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`,
    )
    .join("");

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

export default function PokedexClient() {
  const { notify } = useToast();
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"all" | "owned">("all");
  const [category, setCategory] = useState<"all" | "legendary" | "mythical">(
    "all",
  );
  const [showFilters, setShowFilters] = useState(false);
  const loadingRef = useRef(false);
  const filterToggleRef = useRef<HTMLButtonElement | null>(null);
  const filterPanelRef = useRef<HTMLDivElement | null>(null);

  const limit = 20;

  const fetchPage = useCallback(
    async (pageOffset = 0) => {
      if (loadingRef.current) return;
      setLoading(true);
      loadingRef.current = true;
      try {
        const res = await fetch(
          `/api/pokemon/list?offset=${pageOffset}&limit=${limit}&view=${view}&category=${category}`,
          {
            credentials: "same-origin",
          },
        );
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          const message =
            payload?.message ||
            "The Pokedex could not load that page right now.";
          notify({ message, variant: "error" });
          console.error("Pokedex API error", res.status, await res.text());
          setHasNext(false);
          return;
        }
        const json = await res.json();
        const data = json.data || [];
        const imageUrls = data
          .map((pokemon: Pokemon) =>
            pokemon.isOwned ? pokemon.frontSpriteUrl : pokemon.silhouetteData,
          )
          .filter(Boolean);

        if (imageUrls.length) {
          await preloadImages(imageUrls);
        }

        if (pageOffset === 0) setPokemons(data);
        else setPokemons((p) => [...p, ...data]);
        setHasNext(json.pagination?.hasNext ?? false);
      } catch (err) {
        console.error("Failed to load pokedex", err);
        notify({
          message: "The Pokedex could not load right now. Please try again.",
          variant: "error",
        });
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [limit, view, category],
  );

  useEffect(() => {
    setOffset(0);
    setPokemons([]);
    setHasNext(true);
    fetchPage(0);
  }, [fetchPage]);

  // infinite scroll
  const anchorRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!anchorRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !loading) {
          setOffset((o) => o + 1);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(anchorRef.current);
    return () => obs.disconnect();
  }, [hasNext, loading]);

  useEffect(() => {
    if (offset === 0) return;
    fetchPage(offset);
  }, [offset, fetchPage]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (
        showFilters &&
        filterPanelRef.current &&
        filterToggleRef.current &&
        !filterPanelRef.current.contains(target) &&
        !filterToggleRef.current.contains(target)
      ) {
        setShowFilters(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showFilters]);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleLabel}>
          <BookOpen className={styles.titleIcon} size={20} aria-hidden="true" />
          <h1 className={styles.title}>Pokédex</h1>
        </div>

        <div className={styles.actionsRow}>
          <button
            type="button"
            className={styles.filterToggle}
            onClick={() => setShowFilters((current) => !current)}
            ref={filterToggleRef}
            aria-expanded={showFilters}
            aria-label="Open Pokédex filters"
          >
            <Funnel size={16} />
          </button>

          {showFilters && (
            <div className={styles.filterPanel} ref={filterPanelRef}>
              <label className={styles.filterLabel}>
                View
                <select
                  className={styles.filterSelect}
                  value={view}
                  onChange={(event) =>
                    setView(event.target.value as "all" | "owned")
                  }
                >
                  <option value="all">All</option>
                  <option value="owned">Owned</option>
                </select>
              </label>

              <label className={styles.filterLabel}>
                Category
                <select
                  className={styles.filterSelect}
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value as "all" | "legendary" | "mythical",
                    )
                  }
                >
                  <option value="all">All</option>
                  <option value="legendary">Legendary</option>
                  <option value="mythical">Mythical</option>
                </select>
              </label>
            </div>
          )}
        </div>
      </div>
      <div className={styles.grid}>
        {pokemons.map((p) => (
          <article
            key={p.id}
            className={`${styles.card} ${p.isOwned ? styles.owned : styles.unknown}`}
          >
            <div className={styles.cardId}>
              #{String(p.id).padStart(3, "0")}
            </div>
            <div className={styles.imgWrap}>
              {p.isOwned ? (
                <img
                  src={p.frontSpriteUrl}
                  alt={titleCase(p.name)}
                  loading="lazy"
                />
              ) : (
                <img src={p.silhouetteData} alt="unknown" loading="lazy" />
              )}
            </div>
            <div className={styles.cardBody}>
              <div className={styles.name}>
                {p.isOwned ? titleCase(p.name) : "???"}
              </div>
              <div className={styles.meta}>
                {p.isOwned && p.types ? (
                  p.types.map((t: string) => (
                    <span
                      key={t}
                      className={styles.type}
                      style={getPokemonTypeBadgeStyle(t)}
                    >
                      {titleCase(t)}
                    </span>
                  ))
                ) : (
                  <span className={styles.typeUnknown}>???</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div ref={anchorRef} style={{ height: 20 }} />

      {loading && <p className={styles.loading}>Loading…</p>}
    </div>
  );
}
