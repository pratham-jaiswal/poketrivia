import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Card from "./card";

function Pokedex({ userData }) {
  const [pokemons, setPokemons] = useState([]);
  const [option, setOption] = useState("all");
  const [ownCategory, setOwnCategory] = useState("all");
  const [ownedPokemons, setOwnedPokemons] = useState([]);
  const [ownedMythicalPokemons, setOwnedMythicalPokemons] = useState([]);
  const [ownedLegendaryPokemons, setOwnedLegendaryPokemons] = useState([]);
  const [pokemonList, setPokemonList] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/pokemons`)
      .then((response) => {
        setPokemons(response.data);
      })
      .catch((error) => {
        console.error("Error sending user data to backend:", error);
      });
  }, []);

  const isPokemonOwned = useCallback(
    (pokemonId) => {
      return userData.pokemons.some((pokemon) => pokemon.pokemon === pokemonId);
    },
    [userData.pokemons]
  );

  useEffect(() => {
    const owned = pokemons.filter((pokemon) => isPokemonOwned(pokemon._id));
    setOwnedPokemons(owned);

    const ownedLegendary = owned.filter((pokemon) => pokemon.isLegendary);
    setOwnedLegendaryPokemons(ownedLegendary);

    const ownedMythical = owned.filter((pokemon) => pokemon.isMythical);
    setOwnedMythicalPokemons(ownedMythical);
  }, [pokemons, isPokemonOwned]);

  useEffect(() => {
    if (option === "all") {
      setPokemonList(pokemons);
    } else if (option === "owned") {
      if (ownCategory === "all") {
        setPokemonList(ownedPokemons);
      } else if (ownCategory === "legendary") {
        setPokemonList(ownedLegendaryPokemons);
      } else if (ownCategory === "mythical") {
        setPokemonList(ownedMythicalPokemons);
      }
    }
  }, [
    option,
    ownCategory,
    ownedLegendaryPokemons,
    ownedMythicalPokemons,
    ownedPokemons,
    pokemons,
  ]);

  return (
    <div className="pokedex-container">
      <div className="button-container">
        <button
          className={`option-btn ${option === "all" ? "active" : ""}`}
          onClick={() => {
            setOption("all");
          }}
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
            onClick={() => {
              setOwnCategory("all");
            }}
          >
            All
          </button>
          <button
            className={`option-btn ${
              ownCategory === "legendary" ? "active" : ""
            }`}
            onClick={() => {
              setOwnCategory("legendary");
            }}
          >
            Legendary
          </button>
          <button
            className={`option-btn ${
              ownCategory === "mythical" ? "active" : ""
            }`}
            onClick={() => {
              setOwnCategory("mythical");
            }}
          >
            Mythical
          </button>
        </div>
      )}
      <div className="card-container">
        {pokemonList.map((pokemon) => (
          <>
            <Card
              key={pokemon.id}
              pokemon={pokemon}
              isOwned={isPokemonOwned(pokemon._id)}
            />
          </>
        ))}
      </div>
    </div>
  );
}

export default Pokedex;
