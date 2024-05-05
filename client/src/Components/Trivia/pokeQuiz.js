import kukui from "../../Images/Characters/kukui.png";
import { useEffect, useState } from "react";
import axios from "axios";

function PokeQuiz({ userData, setUserData }) {
  const [currentQuestionIndex, setQuestionIndex] = useState(0);
  const [optionChoice, setOptionChoice] = useState("");
  const [pokemons, setPokemons] = useState([]);
  const [uniqueFacts, setUniqueFacts] = useState([]);
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
    const generateOptions = (fact, correctPokemon) => {
      const incorrectPokemons = pokemons.filter(
        (pokemon) => pokemon.name !== correctPokemon
      );

      const incorrectOptions = [];
      while (incorrectOptions.length < 3) {
        const randomPokemon =
          incorrectPokemons[
            Math.floor(Math.random() * incorrectPokemons.length)
          ];
        if (!randomPokemon.facts.includes(fact)) {
          incorrectOptions.push(randomPokemon.name);
        }
      }

      const options = [correctPokemon, ...incorrectOptions];
      options.sort(() => Math.random() - 0.5);
      return options;
    };

    if (pokemons.length > 0) {
      const tempFacts = [];
      pokemons.forEach((pokemon) => {
        pokemon.facts.forEach((fact) => {
          const sanitizedFact = fact.replace(
            new RegExp(pokemon.name, "gi"),
            "_____"
          );
          tempFacts.push({ fact: sanitizedFact, pokemon: pokemon.name });
        });
      });

      tempFacts.sort(() => Math.random() - 0.5);

      const uniqueFactsSet = new Set();
      const uniqueFactsArray = [];
      for (const { fact, pokemon } of tempFacts) {
        if (!uniqueFactsSet.has(fact)) {
          uniqueFactsSet.add(fact);
          const options = generateOptions(fact, pokemon);
          uniqueFactsArray.push({ fact, pokemon, options, selected: "" });
        }
        if (uniqueFactsArray.length === 20) break;
      }
      setUniqueFacts(uniqueFactsArray);
    }
  }, [pokemons]);

  const handleConfirmClick = (type) => {
    const updatedFacts = [...uniqueFacts];
    if (optionChoice) {
      updatedFacts[currentQuestionIndex].selected = optionChoice;
    }
    setUniqueFacts(updatedFacts);
    if (type === "next") {
      setQuestionIndex(
        currentQuestionIndex < uniqueFacts.length - 1
          ? currentQuestionIndex + 1
          : uniqueFacts.length - 1
      );
    } else if (type === "previous") {
      setQuestionIndex(currentQuestionIndex > 0 ? currentQuestionIndex - 1 : 0);
    } else if (type === "confirm") {
      let totalScore = 0;
      updatedFacts.forEach((fact) => {
        if (fact.pokemon === fact.selected) {
          totalScore += 1;
        }
      });
      setQuizComplete(true);
      setScore(totalScore);
    }
    setOptionChoice("");
  };

  const handleOptionClick = (option) => {
    const updatedFacts = [...uniqueFacts];
    updatedFacts[currentQuestionIndex].selected = "";
    setUniqueFacts(updatedFacts);
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
      if (score === 20) {
        i = 0;
      } else if (score >= 16) {
        i = 1;
      } else if (score >= 12) {
        i = 2;
      } else if (score >= 8) {
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
          totalScore: parseInt(userData.totalScore) + parseInt(score),
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
      <div className="professors">
        <img
          draggable="false"
          className="kukui"
          src={kukui}
          alt="Professor Kukui"
        />
        {uniqueFacts.length > 0 && (
          <>
            {!quizComplete ? (
              <div className="home-container">
                <div className="home-text-container">
                  <p>
                    <span className="kukui">KUKUI: </span>Choose the correct
                    pokemon
                  </p>
                  <p>
                    <span className="kukui">KUKUI: </span>
                    {uniqueFacts[currentQuestionIndex]?.fact}
                  </p>
                </div>
                <div className="grid-btn-container">
                  <button
                    className={`trivia-option ${
                      optionChoice ===
                      uniqueFacts[currentQuestionIndex]?.options[0]
                        ? "active-btn"
                        : uniqueFacts[currentQuestionIndex]?.selected ===
                          uniqueFacts[currentQuestionIndex]?.options[0]
                        ? "active-btn"
                        : ""
                    }`}
                    onClick={() => {
                      handleOptionClick(
                        uniqueFacts[currentQuestionIndex]?.options[0]
                      );
                    }}
                  >
                    {uniqueFacts[currentQuestionIndex]?.options[0]}
                  </button>
                  <button
                    className={`trivia-option ${
                      optionChoice ===
                      uniqueFacts[currentQuestionIndex]?.options[1]
                        ? "active-btn"
                        : uniqueFacts[currentQuestionIndex]?.selected ===
                          uniqueFacts[currentQuestionIndex]?.options[1]
                        ? "active-btn"
                        : ""
                    }`}
                    onClick={() => {
                      handleOptionClick(
                        uniqueFacts[currentQuestionIndex]?.options[1]
                      );
                    }}
                  >
                    {uniqueFacts[currentQuestionIndex]?.options[1]}
                  </button>
                  <button
                    className={`trivia-option ${
                      optionChoice ===
                      uniqueFacts[currentQuestionIndex]?.options[2]
                        ? "active-btn"
                        : uniqueFacts[currentQuestionIndex]?.selected ===
                          uniqueFacts[currentQuestionIndex]?.options[2]
                        ? "active-btn"
                        : ""
                    }`}
                    onClick={() => {
                      handleOptionClick(
                        uniqueFacts[currentQuestionIndex]?.options[2]
                      );
                    }}
                  >
                    {uniqueFacts[currentQuestionIndex]?.options[2]}
                  </button>
                  <button
                    className={`trivia-option ${
                      optionChoice ===
                      uniqueFacts[currentQuestionIndex]?.options[3]
                        ? "active-btn"
                        : uniqueFacts[currentQuestionIndex]?.selected ===
                          uniqueFacts[currentQuestionIndex]?.options[3]
                        ? "active-btn"
                        : ""
                    }`}
                    onClick={() => {
                      handleOptionClick(
                        uniqueFacts[currentQuestionIndex]?.options[3]
                      );
                    }}
                  >
                    {uniqueFacts[currentQuestionIndex]?.options[3]}
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
                  {currentQuestionIndex < uniqueFacts.length - 1 ? (
                    <button
                      className="home-btn next"
                      onClick={() => handleConfirmClick("next")}
                      disabled={
                        optionChoice ||
                        uniqueFacts[currentQuestionIndex].selected
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
                        uniqueFacts[currentQuestionIndex].selected
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
                        <span className="kukui">KUKUI: </span>You've completed
                        the quiz with a score of {score}/20
                      </p>
                      <p>
                        <span className="kukui">KUKUI: </span>
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

export default PokeQuiz;
