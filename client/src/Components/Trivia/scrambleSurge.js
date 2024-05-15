import dawn from "../../Images/Characters/dawn.png";
import { useEffect, useState } from "react";
import axios from "axios";

function ScrambleSurge({ userData, setUserData }) {
  const [currentQuestionIndex, setQuestionIndex] = useState(0);
  const [optionChoice, setOptionChoice] = useState("");
  const [pokemons, setPokemons] = useState([]);
  const [pokemonScrambledNameList, setpokemonScrambledNameList] = useState([]);
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
    const generateOptions = (scrambledName, correctPokemon) => {
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
      const tempList = [];
      pokemons.forEach((pokemon) => {
        tempList.push({
          scrambledName: pokemon.name.split('').sort(() => 0.5 - Math.random()).join(''),
          pokemon: pokemon.name,
        });
      });

      tempList.sort(() => Math.random() - 0.5);

      const pokemonScrambledNameListSet = new Set();
      const pokemonScrambledNameListArray = [];
      for (const { scrambledName, pokemon } of tempList) {
        if (!pokemonScrambledNameListSet.has(scrambledName)) {
          pokemonScrambledNameListSet.add(scrambledName);
          const options = generateOptions(scrambledName, pokemon);
          pokemonScrambledNameListArray.push({
            scrambledName,
            pokemon,
            options,
            selected: "",
          });
        }
        if (pokemonScrambledNameListArray.length === 10) break;
      }
      setpokemonScrambledNameList(pokemonScrambledNameListArray);
    }
  }, [pokemons]);

  const handleConfirmClick = (type) => {
    const updatedList = [...pokemonScrambledNameList];
    if (optionChoice) {
      updatedList[currentQuestionIndex].selected = optionChoice;
    }
    setpokemonScrambledNameList(updatedList);
    if (type === "next") {
      setQuestionIndex(
        currentQuestionIndex < pokemonScrambledNameList.length - 1
          ? currentQuestionIndex + 1
          : pokemonScrambledNameList.length - 1
      );
    } else if (type === "previous") {
      setQuestionIndex(currentQuestionIndex > 0 ? currentQuestionIndex - 1 : 0);
    } else if (type === "confirm") {
      let totalScore = 0;
      updatedList.forEach((scrambledName) => {
        if (scrambledName.pokemon === scrambledName.selected) {
          totalScore += 1;
        }
      });
      setQuizComplete(true);
      setScore(totalScore);
    }
    setOptionChoice("");
  };

  const handleOptionClick = (option) => {
    const updatedList = [...pokemonScrambledNameList];
    updatedList[currentQuestionIndex].selected = "";
    setpokemonScrambledNameList(updatedList);
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
          totalScore: parseInt(userData.totalScore) + parseInt(score) * 1,
          pokecoins: parseInt(userData.pokecoins) + parseInt(score) * 2,
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
        <img draggable="false" className="dawn" src={dawn} alt="Dawn" />
        {pokemonScrambledNameList.length > 0 && (
          <>
            {!quizComplete ? (
              <div className="home-container">
                <div className="home-text-container">
                  <p>
                    <span className="dawn">DAWN: </span>Who's that Pokémon?
                  </p>
                  <p className="pkmn-holder">
                    {pokemonScrambledNameList[currentQuestionIndex]?.scrambledName}
                  </p>
                </div>
                <div className="grid-btn-container">
                  <button
                    className={`trivia-option ${
                      optionChoice ===
                      pokemonScrambledNameList[currentQuestionIndex]?.options[0]
                        ? "active-btn"
                        : pokemonScrambledNameList[currentQuestionIndex]?.selected ===
                          pokemonScrambledNameList[currentQuestionIndex]?.options[0]
                        ? "active-btn"
                        : ""
                    }`}
                    onClick={() => {
                      handleOptionClick(
                        pokemonScrambledNameList[currentQuestionIndex]?.options[0]
                      );
                    }}
                  >
                    {pokemonScrambledNameList[currentQuestionIndex]?.options[0]}
                  </button>
                  <button
                    className={`trivia-option ${
                      optionChoice ===
                      pokemonScrambledNameList[currentQuestionIndex]?.options[1]
                        ? "active-btn"
                        : pokemonScrambledNameList[currentQuestionIndex]?.selected ===
                          pokemonScrambledNameList[currentQuestionIndex]?.options[1]
                        ? "active-btn"
                        : ""
                    }`}
                    onClick={() => {
                      handleOptionClick(
                        pokemonScrambledNameList[currentQuestionIndex]?.options[1]
                      );
                    }}
                  >
                    {pokemonScrambledNameList[currentQuestionIndex]?.options[1]}
                  </button>
                  <button
                    className={`trivia-option ${
                      optionChoice ===
                      pokemonScrambledNameList[currentQuestionIndex]?.options[2]
                        ? "active-btn"
                        : pokemonScrambledNameList[currentQuestionIndex]?.selected ===
                          pokemonScrambledNameList[currentQuestionIndex]?.options[2]
                        ? "active-btn"
                        : ""
                    }`}
                    onClick={() => {
                      handleOptionClick(
                        pokemonScrambledNameList[currentQuestionIndex]?.options[2]
                      );
                    }}
                  >
                    {pokemonScrambledNameList[currentQuestionIndex]?.options[2]}
                  </button>
                  <button
                    className={`trivia-option ${
                      optionChoice ===
                      pokemonScrambledNameList[currentQuestionIndex]?.options[3]
                        ? "active-btn"
                        : pokemonScrambledNameList[currentQuestionIndex]?.selected ===
                          pokemonScrambledNameList[currentQuestionIndex]?.options[3]
                        ? "active-btn"
                        : ""
                    }`}
                    onClick={() => {
                      handleOptionClick(
                        pokemonScrambledNameList[currentQuestionIndex]?.options[3]
                      );
                    }}
                  >
                    {pokemonScrambledNameList[currentQuestionIndex]?.options[3]}
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
                  {currentQuestionIndex < pokemonScrambledNameList.length - 1 ? (
                    <button
                      className="home-btn next"
                      onClick={() => handleConfirmClick("next")}
                      disabled={
                        optionChoice ||
                        pokemonScrambledNameList[currentQuestionIndex].selected
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
                        pokemonScrambledNameList[currentQuestionIndex].selected
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
                        <span className="dawn">DAWN: </span>You've completed the
                        quiz with a score of {score}/10
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

export default ScrambleSurge;
