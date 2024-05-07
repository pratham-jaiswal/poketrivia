import dawn from "../../Images/Characters/dawn.png";
import { useEffect, useState } from "react";
import axios from "axios";

function WhosThatPokemon({ userData, setUserData }) {
  const [currentQuestionIndex, setQuestionIndex] = useState(0);
  const [optionChoice, setOptionChoice] = useState("");
  const [pokemons, setPokemons] = useState([]);
  const [pokemonImageUrls, setPokemonImageUrls] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [scoreDialogue, setScoreDialogue] = useState();
  const [errorMessage, setErrorMessage] = useState("");

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
    const generateOptions = (imageUrl, correctPokemon) => {
      const incorrectPokemons = pokemons.filter(
        (pokemon) => pokemon.name !== correctPokemon
      );

      const incorrectOptions = [];
      while (incorrectOptions.length < 3) {
        const randomPokemon =
          incorrectPokemons[
            Math.floor(Math.random() * incorrectPokemons.length)
          ];
        incorrectOptions.push(randomPokemon.name);
      }

      const options = [correctPokemon, ...incorrectOptions];
      options.sort(() => Math.random() - 0.5);
      return options;
    };

    if (pokemons.length > 0) {
      const tempImageUrls = [];
      pokemons.forEach((pokemon) => {
        tempImageUrls.push({
          imageUrl: pokemon.frontSpriteUrl,
          pokemon: pokemon.name,
        });
      });

      tempImageUrls.sort(() => Math.random() - 0.5);

      const pokemonImageUrlsSet = new Set();
      const pokemonImageUrlsArray = [];
      for (const { imageUrl, pokemon } of tempImageUrls) {
        if (!pokemonImageUrlsSet.has(imageUrl)) {
          pokemonImageUrlsSet.add(imageUrl);
          const options = generateOptions(imageUrl, pokemon);
          pokemonImageUrlsArray.push({ imageUrl, pokemon, options, selected: "" });
        }
        if (pokemonImageUrlsArray.length === 10) break;
      }
      setPokemonImageUrls(pokemonImageUrlsArray);
    }
  }, [pokemons]);

  const handleConfirmClick = (type) => {
    const updatedImageUrls = [...pokemonImageUrls];
    if (optionChoice) {
      updatedImageUrls[currentQuestionIndex].selected = optionChoice;
    }
    setPokemonImageUrls(updatedImageUrls);
    if (type === "next") {
      setQuestionIndex(
        currentQuestionIndex < pokemonImageUrls.length - 1
          ? currentQuestionIndex + 1
          : pokemonImageUrls.length - 1
      );
    } else if (type === "previous") {
      setQuestionIndex(currentQuestionIndex > 0 ? currentQuestionIndex - 1 : 0);
    } else if (type === "confirm") {
      let totalScore = 0;
      updatedImageUrls.forEach((imageUrl) => {
        if (imageUrl.pokemon === imageUrl.selected) {
          totalScore += 1;
        }
      });
      setQuizComplete(true);
      setScore(totalScore);
    }
    setOptionChoice("");
  };

  const handleOptionClick = (option) => {
    const updatedImageUrls = [...pokemonImageUrls];
    updatedImageUrls[currentQuestionIndex].selected = "";
    setPokemonImageUrls(updatedImageUrls);
    setOptionChoice(option);
  };

  useEffect(() => {
    if (quizComplete) {
      const dialogues = [
        {
          dialogue:
            "Outstanding! A perfect score! You're getting closer to becoming a PokéTrivia Master with every question!",
        },
        {
          dialogue:
            "Congratulations! You're making great progress on your journey to becoming a PokéTrivia Master.",
        },
        {
          dialogue:
            "Impressive! Your knowledge of Pokémon is growing stronger with each correct answer.",
        },
        {
          dialogue:
            "Keep up the good work! Every correct answer brings you closer to your goal.",
        },
        {
          dialogue:
            "No worries! Even the greatest trainers started somewhere. Keep going!",
        },
      ];
      let i = 0;
      if (score === 10) {
        i = 0;
      } else if (score >= 8) {
        i = 1;
      } else if (score >= 6) {
        i = 2;
      } else if (score >= 4) {
        i = 3;
      } else {
        i = 4;
      }
      setScoreDialogue(dialogues[i]);
    }
  }, [quizComplete, score]);

  const completeQuiz = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/update-user`, {
        email: userData.email,
        updates: {
          totalScore: parseInt(userData.totalScore) + parseInt(score) * 2,
          pokecoins: parseInt(userData.pokecoins) + parseInt(score) * 4,
        },
      })
      .then((response) => {
        setUserData(response.data.user);
      })
      .then(() => {
        window.location.href = "/";
      })
      .catch((error) => {
        setErrorMessage("");
      });
  };

  return (
    <div className="center-container">
      <div className="professors wtp-container">
        <img
          draggable="false"
          className="dawn"
          src={dawn}
          alt="Dawn"
        />
        {pokemonImageUrls.length > 0 && (
          <>
            {!quizComplete ? (
              <div className="home-container">
                <div className="home-text-container">
                  <p>
                    <span className="dawn">DAWN: </span>Who's that Pokémon?
                    pokemon
                  </p>
                  <p className="pkmn-holder">
                    <img className="wtp-pokemon" src={pokemonImageUrls[currentQuestionIndex]?.imageUrl} alt="pokemon" />
                  </p>
                </div>
                <div className="grid-btn-container">
                  <button
                    className={`trivia-option ${
                      optionChoice ===
                      pokemonImageUrls[currentQuestionIndex]?.options[0]
                        ? "active-btn"
                        : pokemonImageUrls[currentQuestionIndex]?.selected ===
                          pokemonImageUrls[currentQuestionIndex]?.options[0]
                        ? "active-btn"
                        : ""
                    }`}
                    onClick={() => {
                      handleOptionClick(
                        pokemonImageUrls[currentQuestionIndex]?.options[0]
                      );
                    }}
                  >
                    {pokemonImageUrls[currentQuestionIndex]?.options[0]}
                  </button>
                  <button
                    className={`trivia-option ${
                      optionChoice ===
                      pokemonImageUrls[currentQuestionIndex]?.options[1]
                        ? "active-btn"
                        : pokemonImageUrls[currentQuestionIndex]?.selected ===
                          pokemonImageUrls[currentQuestionIndex]?.options[1]
                        ? "active-btn"
                        : ""
                    }`}
                    onClick={() => {
                      handleOptionClick(
                        pokemonImageUrls[currentQuestionIndex]?.options[1]
                      );
                    }}
                  >
                    {pokemonImageUrls[currentQuestionIndex]?.options[1]}
                  </button>
                  <button
                    className={`trivia-option ${
                      optionChoice ===
                      pokemonImageUrls[currentQuestionIndex]?.options[2]
                        ? "active-btn"
                        : pokemonImageUrls[currentQuestionIndex]?.selected ===
                          pokemonImageUrls[currentQuestionIndex]?.options[2]
                        ? "active-btn"
                        : ""
                    }`}
                    onClick={() => {
                      handleOptionClick(
                        pokemonImageUrls[currentQuestionIndex]?.options[2]
                      );
                    }}
                  >
                    {pokemonImageUrls[currentQuestionIndex]?.options[2]}
                  </button>
                  <button
                    className={`trivia-option ${
                      optionChoice ===
                      pokemonImageUrls[currentQuestionIndex]?.options[3]
                        ? "active-btn"
                        : pokemonImageUrls[currentQuestionIndex]?.selected ===
                          pokemonImageUrls[currentQuestionIndex]?.options[3]
                        ? "active-btn"
                        : ""
                    }`}
                    onClick={() => {
                      handleOptionClick(
                        pokemonImageUrls[currentQuestionIndex]?.options[3]
                      );
                    }}
                  >
                    {pokemonImageUrls[currentQuestionIndex]?.options[3]}
                  </button>
                </div>
                <div className="grid-btn-container">
                  <button
                    className="home-btn next"
                    onClick={() => handleConfirmClick("previous")}
                    disabled={currentQuestionIndex > 0 ? false : true}
                  >
                    Previous
                  </button>
                  {currentQuestionIndex < pokemonImageUrls.length - 1 ? (
                    <button
                      className="home-btn next"
                      onClick={() => handleConfirmClick("next")}
                      disabled={
                        optionChoice ||
                        pokemonImageUrls[currentQuestionIndex].selected
                          ? false
                          : true
                      }
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      className="home-btn next"
                      onClick={() => handleConfirmClick("confirm")}
                      disabled={
                        optionChoice ||
                        pokemonImageUrls[currentQuestionIndex].selected
                          ? false
                          : true
                      }
                    >
                      Confirm
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="home-container">
                {scoreDialogue && (
                  <>
                    <div className="home-text-container">
                      <p>
                        <span className="dawn">DAWN: </span>You've completed
                        the quiz with a score of {score}/10
                      </p>
                      <p>
                        <span className="dawn">DAWN: </span>
                        {scoreDialogue.dialogue}
                      </p>
                      {errorMessage && (
                        <p className="dialogue">
                          <span className="mom">MOM: </span>
                          {errorMessage}
                        </p>
                      )}
                    </div>
                    <button className="home-btn next-sm" onClick={completeQuiz}>
                      Close
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default WhosThatPokemon;
