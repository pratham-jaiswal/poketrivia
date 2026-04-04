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
    async (reset = false, targetOffset = 0) => {
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
          },
        );

        setPokemons((prev) =>
          reset ? res.data.data : [...prev, ...res.data.data],
        );
        const next = res.data.pagination.hasNext;
        setHasNext(next);
        hasNextRef.current = next;
      } catch (err) {
        const errorDetail = err.response?.data?.error || "Pokedex signal lost!";
        showToast.error(errorDetail);
        setHasNext(false);
        hasNextRef.current = false;
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    },
    [option, ownCategory, userData?._id, getAccessTokenSilently],
  );

  useEffect(() => {
    setOffset(0);
    setHasNext(true);
    fetchPokemons(true, 0);
  }, [option, ownCategory, userData?._id, fetchPokemons]);

  useEffect(() => {
    if (offset > 0) {
      fetchPokemons(false, offset);
    }
  }, [offset, fetchPokemons]);

  useEffect(() => {
    if (loading || isFetching.current) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNext && !isFetching.current) {
        setOffset((prev) => prev + 1);
      }
    });

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
          onClick={() => setOption("all")}
        >
          All
        </button>

        <button
          className={`option-btn ${option === "owned" ? "active" : ""}`}
          onClick={() => {
            setOption("owned");
            setOwnCategory("all");
          }}
        >
          Owned
        </button>
      </div>

      {option === "owned" && (
        <div className="button-container own-btn">
          <button
            className={`option-btn ${ownCategory === "all" ? "active" : ""}`}
            onClick={() => setOwnCategory("all")}
          >
            All
          </button>

          <button
            className={`option-btn ${
              ownCategory === "legendary" ? "active" : ""
            }`}
            onClick={() => setOwnCategory("legendary")}
          >
            Legendary
          </button>

          <button
            className={`option-btn ${
              ownCategory === "mythical" ? "active" : ""
            }`}
            onClick={() => setOwnCategory("mythical")}
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

      {/* 🔥 invisible trigger element */}
      <div id="scroll-anchor" style={{ height: "20px" }} />

      {loading && (
        <p style={{ textAlign: "center", margin: "10px" }}>Loading...</p>
      )}
    </div>
  );
}

export default Pokedex;
