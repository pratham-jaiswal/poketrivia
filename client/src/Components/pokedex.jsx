import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Card from "./card";
import { showToast } from "../Utils/toast";

function Pokedex({ userData, getAccessTokenSilently }) {
  const [pokemons, setPokemons] = useState([]);
  const [option, setOption] = useState("all");
  const [ownCategory, setOwnCategory] = useState("all");

  const [offset, setOffset] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);

  const observerRef = useRef(null);
  const hasNextRef = useRef(true);
  const isFetching = useRef(false);

  const fetchPokemons = useCallback(
    async (reset = false, targetOffset = 0, signal = null) => {
      if (isFetching.current || (!reset && !hasNextRef.current)) return;

      try {
        isFetching.current = true;
        setLoading(true);

        const params = {
          view: option,
          category: option === "owned" ? ownCategory : "all",
          offset: targetOffset,
          limit: 20,
        };

        if (userData?._id) params.userId = userData._id;

        const token = await getAccessTokenSilently();
        const res = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/api/pokemons`,
          {
            params,
            headers: { Authorization: `Bearer ${token}` },
            signal,
          },
        );

        setPokemons((prev) =>
          reset ? res.data.data : [...prev, ...res.data.data],
        );
        const next = res.data.pagination.hasNext;
        setHasNext(next);
        hasNextRef.current = next;
      } catch (err) {
        if (axios.isCancel(err)) return;
        const errorDetail = err.response?.data?.error || "Pokedex signal lost!";
        showToast.error(errorDetail);
        setHasNext(false);
        hasNextRef.current = false;
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
          isFetching.current = false;
        }
      }
    },
    [option, ownCategory, userData?._id, getAccessTokenSilently],
  );

  useEffect(() => {
    const controller = new AbortController();

    if (offset === 0) {
      setPokemons([]);
      isFetching.current = false;
    }

    fetchPokemons(offset === 0, offset, controller.signal);

    return () => {
      controller.abort();
      isFetching.current = false;
    };
  }, [option, ownCategory, offset, userData?._id, fetchPokemons]);

  const handleFilterChange = (newOption, newCategory = "all") => {
    if (newOption === option && newCategory === ownCategory) return;

    isFetching.current = false;

    setPokemons([]);
    setHasNext(true);
    hasNextRef.current = true;

    setOption(newOption);
    setOwnCategory(newCategory);

    setOffset(0);
  };

  useEffect(() => {
    if (loading || !hasNext) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextRef.current &&
          !isFetching.current
        ) {
          setOffset((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );

    const el = document.querySelector("#scroll-anchor");
    if (el) observerRef.current.observe(el);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loading, hasNext, fetchPokemons]);

  return (
    <div className="pokedex-container">
      <div className="button-container">
        <button
          className={`option-btn ${option === "all" ? "active" : ""}`}
          onClick={() => handleFilterChange("all")}
        >
          All
        </button>

        <button
          className={`option-btn ${option === "owned" ? "active" : ""}`}
          onClick={() => handleFilterChange("owned", "all")}
        >
          Owned
        </button>
      </div>

      {option === "owned" && (
        <div className="button-container own-btn">
          <button
            className={`option-btn ${ownCategory === "all" ? "active" : ""}`}
            onClick={() => handleFilterChange("owned", "all")}
          >
            All
          </button>

          <button
            className={`option-btn ${ownCategory === "legendary" ? "active" : ""}`}
            onClick={() => handleFilterChange("owned", "legendary")}
          >
            Legendary
          </button>

          <button
            className={`option-btn ${ownCategory === "mythical" ? "active" : ""}`}
            onClick={() => handleFilterChange("owned", "mythical")}
          >
            Mythical
          </button>
        </div>
      )}

      <div className="card-container">
        {pokemons.map((pokemon) => (
          <Card key={pokemon.id} pokemon={pokemon} isOwned={pokemon.isOwned} />
        ))}
      </div>

      {/* invisible trigger element */}
      <div id="scroll-anchor" style={{ height: "20px" }} />

      {loading && (
        <p style={{ textAlign: "center", margin: "10px" }}>Loading...</p>
      )}
    </div>
  );
}

export default Pokedex;
