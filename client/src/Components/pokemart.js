import joy from "../Images/Characters/joy.png";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function PokeMart({ userData, setUserData }) {
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [activeMode, setActiveMode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hatching, setHatching] = useState(false);
  const [pokemons, setPokemons] = useState([]);
  const [ownedPokemons, setOwnedPokemons] = useState([]);
  const [ownedMythicalPokemons, setOwnedMythicalPokemons] = useState([]);
  const [ownedLegendaryPokemons, setOwnedLegendaryPokemons] = useState([]);
  const [hatchedPokemonList, setHatchedPokemonList] = useState([]);

  const dialogues = [
    { dialogue: "Welcome to the PokéMart! I'm Nurse Joy." },
    {
      dialogue:
        "Here, you can buy eggs and instantly hatch them with pokécoins.",
    },
    { dialogue: "Would you like to purchase one or more eggs?" },
    { dialogue: "Pokémon are wonderful companions on any journey." },
    { dialogue: "Feel free to browse through the options available." },
    { dialogue: "I'll be here to assist you with any questions you may have." },
  ];

  const eggOptionDialogue = {
    "one-egg": "Would you like to purchase one egg?",
    "five-eggs": "How about a bundle of five eggs?",
    "ten-eggs": "We also offer a special package of ten eggs.",
    "one-legendary-egg":
      "Would you like to purchase a legendary egg? It's a rare find!",
    "one-mythical-egg":
      "Are you interested in a mythical egg? They hold mysterious powers!",
  };

  const eggOptionPrice = {
    "one-egg": 50,
    "five-eggs": 250,
    "ten-eggs": 500,
    "one-legendary-egg": 2000,
    "one-mythical-egg": 8000,
  };

  const isPokemonOwned = useCallback(
    (pokemonId) => {
      return userData.pokemons.some((pokemon) => pokemon.pokemon === pokemonId);
    },
    [userData.pokemons]
  );

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

  useEffect(() => {
    const owned = pokemons.filter((pokemon) => isPokemonOwned(pokemon._id));
    setOwnedPokemons(owned);

    const ownedLegendary = owned.filter((pokemon) => pokemon.isLegendary);
    setOwnedLegendaryPokemons(ownedLegendary);

    const ownedMythical = owned.filter((pokemon) => pokemon.isMythical);
    setOwnedMythicalPokemons(ownedMythical);
  }, [isPokemonOwned, pokemons]);

  const filterOwnedPokemons = (pokemons, owned) => {
    return pokemons.filter(
      (pokemon) =>
        !owned.some((ownedPokemon) => ownedPokemon._id === pokemon._id)
    );
  };

  const getNotOwnedPokemons = (mode) => {
    let notOwnedPokemons = [];
    switch (mode) {
      case "one-egg":
      case "five-eggs":
      case "ten-eggs":
        notOwnedPokemons = filterOwnedPokemons(pokemons, ownedPokemons);
        break;
      case "one-legendary-egg":
        notOwnedPokemons = filterOwnedPokemons(
          pokemons.filter((pokemon) => pokemon.isLegendary),
          ownedLegendaryPokemons
        );
        break;
      case "one-mythical-egg":
        notOwnedPokemons = filterOwnedPokemons(
          pokemons.filter((pokemon) => pokemon.isMythical),
          ownedMythicalPokemons
        );
        break;
      default:
        break;
    }
    return notOwnedPokemons;
  };

  const handleHatch = () => {
    setHatching(true);
    const notOwnedPokemons = getNotOwnedPokemons(activeMode);
    const hatchedPokemons = shuffleArray(notOwnedPokemons).slice(
      0,
      getHatchQuantity(activeMode)
    );
    setHatchedPokemonList(hatchedPokemons);

    const hatchedPokemonsData = hatchedPokemons.map((pokemon) => ({
      pokemon: pokemon._id,
      count: 1,
    }));

    axios
      .post(`${process.env.REACT_APP_API_URL}/api/update-user-pokemons`, {
        email: userData.email,
        pokemonList: hatchedPokemonsData,
        cost: eggOptionPrice[activeMode],
      })
      .then((response) => {
        setUserData(response.data.user);
      })
      .catch((error) => {
        setErrorMessage(
          "Oops, it seems something unexpected occurred. Please take a moment to rest while I work on resolving the issue."
        );
        setHatching(false);
      });
  };

  const getHatchQuantity = (mode) => {
    switch (mode) {
      case "one-egg":
        return 1;
      case "five-eggs":
        return 5;
      case "ten-eggs":
        return 10;
      case "one-legendary-egg":
      case "one-mythical-egg":
        return 1;
      default:
        return 0;
    }
  };

  const shuffleArray = (array) => {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }
    return shuffledArray;
  };

  const handleNextDialogue = () => {
    if (currentDialogueIndex < dialogues.length - 1) {
      setCurrentDialogueIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handleVisited = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/update-user`, {
        email: userData.email,
        updates: {
          visitedPokeMart: true,
        },
      })
      .then((response) => {
        setUserData(response.data.user);
        handleNextDialogue();
      })
      .catch((error) => {
        setErrorMessage(
          "Oops, it seems something unexpected occurred. Please take a moment to rest while I work on resolving the issue."
        );
      });
  };

  return (
    <div className="center-container">
      <div className="professors">
        <img draggable="false" className="joy" src={joy} alt="Joy" />
        {userData.visitedPokeMart ? (
          !hatching ? (
            <>
              <div className="home-container">
                <div className="grid-btn-container">
                  <button
                    className={`mode-btn ${
                      activeMode === "one-egg" ? "active-btn" : ""
                    }`}
                    onClick={() => {
                      setActiveMode(activeMode === "one-egg" ? "" : "one-egg");
                    }}
                  >
                    Hatch 1 Egg - 50₱
                  </button>
                  <button
                    className={`mode-btn ${
                      activeMode === "five-eggs" ? "active-btn" : ""
                    }`}
                    onClick={() => {
                      setActiveMode(
                        activeMode === "five-eggs" ? "" : "five-eggs"
                      );
                    }}
                  >
                    Hatch 5 Eggs - 250₱
                  </button>
                  <button
                    className={`mode-btn ${
                      activeMode === "ten-eggs" ? "active-btn" : ""
                    }`}
                    onClick={() => {
                      setActiveMode(
                        activeMode === "ten-eggs" ? "" : "ten-eggs"
                      );
                    }}
                  >
                    Hatch 10 Eggs - 500₱
                  </button>
                  <button
                    className={`mode-btn legendary-egg ${
                      activeMode === "one-legendary-egg" ? "active-btn" : ""
                    }`}
                    onClick={() => {
                      setActiveMode(
                        activeMode === "one-legendary-egg"
                          ? ""
                          : "one-legendary-egg"
                      );
                    }}
                  >
                    Hatch 1 Legendary Egg - 2000₱
                  </button>
                  <button
                    className={`mode-btn mythical-egg ${
                      activeMode === "one-mythical-egg" ? "active-btn" : ""
                    }`}
                    onClick={() => {
                      setActiveMode(
                        activeMode === "one-mythical-egg"
                          ? ""
                          : "one-mythical-egg"
                      );
                    }}
                  >
                    Hatch 1 Mythical Egg - 8000₱
                  </button>
                </div>
                <>
                  <div className="home-text-container">
                    <p>
                      <span className="joy">JOY: </span>
                      {activeMode
                        ? eggOptionDialogue[activeMode]
                        : "Welcome to the PokéMart! How may I assist you today?"}
                    </p>
                  </div>
                  {activeMode ? (
                    <button
                      className="home-btn next-sm"
                      onClick={handleHatch}
                      disabled={userData.pokecoins < eggOptionPrice[activeMode]}
                    >
                      Hatch
                    </button>
                  ) : (
                    <p></p>
                  )}
                </>
              </div>
            </>
          ) : (
            hatchedPokemonList && (
              // Hatching
              <div className="home-container">
                <div className="grid-btn-container center-grid">
                  {hatchedPokemonList.map((pokemon) => (
                    <button
                      key={pokemon._id}
                      className={`mode-btn capitalize ${activeMode === "one-legendary-egg" ? "legendary-egg" : activeMode === "one-mythical-egg" ? "mythical-egg" : ""}`}
                      onClick={() => {
                        setActiveMode(
                          activeMode === "one-egg" ? "" : "one-egg"
                        );
                      }}
                    >
                      {pokemon.name}
                    </button>
                  ))}
                </div>
                <div className="home-text-container">
                  <p className="dialogue">
                    <span className="joy">JOY: </span>
                    {hatchedPokemonList.length === 1
                      ? "Congratulations, Trainer! Your Pokémon has hatched and is eager to explore the world by your side! You can now check it out in your Pokédex."
                      : "Congratulations, Trainer! Your Pokémons have hatched and are eager to explore the world by your side! You ca now check them out in your Pokédex."}
                  </p>
                  {currentDialogueIndex === dialogues.length - 1 && (
                    <div className="name-input-container">
                      {errorMessage && (
                        <p className="dialogue">
                          <span className="joy">JOY: </span>
                          {errorMessage}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid-btn-container">
                  <button
                    className="home-btn next"
                    onClick={() => {
                      setActiveMode("");
                      setHatching(false);
                    }}
                  >
                    Shop More
                  </button>
                  <Link className="btn-container" to="/">
                    <button className="home-btn next">Leave</button>
                  </Link>
                </div>
              </div>
            )
          )
        ) : (
          <>
            <div className="home-container">
              <div className="home-text-container">
                <p className="dialogue">
                  <span className="joy">JOY: </span>
                  {dialogues[currentDialogueIndex].dialogue}
                </p>
                {currentDialogueIndex === dialogues.length - 1 && (
                  <div className="name-input-container">
                    {errorMessage && (
                      <p className="dialogue">
                        <span className="joy">JOY: </span>
                        {errorMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {currentDialogueIndex < dialogues.length - 1 ? (
                <button
                  className="home-btn next-sm"
                  onClick={handleNextDialogue}
                >
                  Next
                </button>
              ) : (
                <button className="home-btn next-sm" onClick={handleVisited}>
                  Start Shopping
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PokeMart;
