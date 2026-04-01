import joy from "../Images/Characters/joy.png";
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function PokeMart({ userData, setUserData, getAccessTokenSilently }) {
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [activeMode, setActiveMode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hatching, setHatching] = useState(false);
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

  const handleHatch = async () => {
    try {
      setHatching(true);
      const token = await getAccessTokenSilently();
      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/pokemart/hatch`,
        {
          userId: userData._id,
          mode: activeMode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setHatchedPokemonList(res.data.hatched);
      setUserData(res.data.user);
    } catch (err) {
      setErrorMessage(
        "Oops, it seems something unexpected occurred. Please take a moment to rest while I work on resolving the issue.",
      );
      setHatching(false);
    }
  };

  const handleNextDialogue = () => {
    if (currentDialogueIndex < dialogues.length - 1) {
      setCurrentDialogueIndex((prev) => prev + 1);
    }
  };

  const handleVisited = async () => {
    try {
      const token = await getAccessTokenSilently();
      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/user/visited`,
        {
          userId: userData._id,
          field: "visitedPokeMart",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUserData(res.data.user);
      handleNextDialogue();
    } catch {
      setErrorMessage(
        "Oops, it seems something unexpected occurred. Please take a moment to rest while I work on resolving the issue.",
      );
    }
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
                  {Object.keys(eggOptionPrice).map((mode) => (
                    <button
                      key={mode}
                      className={`mode-btn ${
                        mode.includes("legendary")
                          ? "legendary-egg"
                          : mode.includes("mythical")
                            ? "mythical-egg"
                            : ""
                      } ${activeMode === mode ? "active-btn" : ""}`}
                      onClick={() =>
                        setActiveMode(activeMode === mode ? "" : mode)
                      }
                    >
                      {mode === "one-egg" && "Hatch 1 Egg - 50₱"}
                      {mode === "five-eggs" && "Hatch 5 Eggs - 250₱"}
                      {mode === "ten-eggs" && "Hatch 10 Eggs - 500₱"}
                      {mode === "one-legendary-egg" &&
                        "Hatch 1 Legendary Egg - 2000₱"}
                      {mode === "one-mythical-egg" &&
                        "Hatch 1 Mythical Egg - 8000₱"}
                    </button>
                  ))}
                </div>

                <div className="home-text-container">
                  <p>
                    <span className="joy">JOY: </span>
                    {activeMode
                      ? eggOptionDialogue[activeMode]
                      : "Welcome to the PokéMart! How may I assist you today?"}
                  </p>
                </div>

                {activeMode && (
                  <button
                    className="home-btn next-sm"
                    onClick={handleHatch}
                    disabled={userData.pokecoins < eggOptionPrice[activeMode]}
                  >
                    Hatch
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="home-container">
              <div className="grid-btn-container center-grid">
                {hatchedPokemonList.map((pokemon) => (
                  <button
                    key={pokemon._id}
                    className={`mode-btn capitalize ${
                      activeMode === "one-legendary-egg"
                        ? "legendary-egg"
                        : activeMode === "one-mythical-egg"
                          ? "mythical-egg"
                          : ""
                    }`}
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

                {errorMessage && (
                  <p className="dialogue">
                    <span className="joy">JOY: </span>
                    {errorMessage}
                  </p>
                )}
              </div>

              <div className="grid-btn-container">
                <button
                  className="home-btn next"
                  onClick={() => {
                    setActiveMode("");
                    setHatching(false);
                    setHatchedPokemonList([]);
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
        ) : (
          <div className="home-container">
            <div className="home-text-container">
              <p className="dialogue">
                <span className="joy">JOY: </span>
                {dialogues[currentDialogueIndex].dialogue}
              </p>
            </div>

            {currentDialogueIndex < dialogues.length - 1 ? (
              <button className="home-btn next-sm" onClick={handleNextDialogue}>
                Next
              </button>
            ) : (
              <button className="home-btn next-sm" onClick={handleVisited}>
                Start Shopping
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PokeMart;
