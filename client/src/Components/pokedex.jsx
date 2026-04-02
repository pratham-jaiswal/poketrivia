import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Card from "./card";

function Pokedex({ userData, getAccessTokenSilently }) {
  const [pokemons, setPokemons] = useState([]);
  const [option, setOption] = useState("all");
  const [ownCategory, setOwnCategory] = useState("all");

  const [offset, setOffset] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);

  const observerRef = useRef(null);

  useEffect(() => {
    if (offset > 0) {
      fetchPokemons(false);
    }
  }, [offset]);

  useEffect(() => {
    setOffset(0);
    setHasNext(true);
    fetchPokemons(true);
  }, [option, ownCategory, userData]);

  const fetchPokemons = async (reset = false) => {
    if (loading || (!reset && !hasNext)) return;

    try {
      setLoading(true);

      const params = {
        view: option,
        category: option === "owned" ? ownCategory : "all",
        offset: reset ? 0 : offset,
        limit: 20,
      };

      if (userData) {
        params.userId = userData._id;
      }
      const token = await getAccessTokenSilently();
      const res = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/api/pokemons`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPokemons((prev) => (reset ? res.data.data : [...prev, ...res.data.data]));
      setHasNext(res.data.pagination.hasNext);
    } catch (err) {
      console.error("Error fetching pokemons:", err);
      setHasNext(false);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 infinite scroll observer
  useEffect(() => {
    if (loading) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNext && !loading) {
        setOffset((prev) => prev + 1);
      }
    });

    const el = document.querySelector("#scroll-anchor");
    if (el) observerRef.current.observe(el);
  }, [loading, hasNext]);

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
