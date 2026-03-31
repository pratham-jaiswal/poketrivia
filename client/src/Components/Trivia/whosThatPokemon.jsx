import dawn from "../../Images/Characters/dawn.png";
import { useEffect, useState } from "react";
import axios from "axios";

function WhosThatPokemon({ userData, setUserData }) {
  const [currentQuestionIndex, setQuestionIndex] = useState(0);
  const [optionChoice, setOptionChoice] = useState("");
  const [pokemonImageUrls, setPokemonImageUrls] = useState([]);
  const [sessionId, setSessionId] = useState("");

  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [scoreDialogue, setScoreDialogue] = useState();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    axios
      .post(`${import.meta.env.VITE_APP_API_URL}/api/game/start`, {
        type: "image",
        userId: userData._id,
      })
      .then((response) => {
        setPokemonImageUrls(
          response.data.questions.map((q) => ({
            ...q,
            selected: "",
          })),
        );
        setSessionId(response.data.sessionId);
      })
      .catch(console.error);
  }, []);

  const handleConfirmClick = (type) => {
    const updated = [...pokemonImageUrls];

    if (optionChoice) {
      updated[currentQuestionIndex].selected = optionChoice;
    }

    setPokemonImageUrls(updated);

    if (type === "next") {
      setQuestionIndex(
        currentQuestionIndex < updated.length - 1
          ? currentQuestionIndex + 1
          : updated.length - 1,
      );
    } else if (type === "previous") {
      setQuestionIndex(currentQuestionIndex > 0 ? currentQuestionIndex - 1 : 0);
    } else if (type === "confirm") {
      submitQuiz(updated);
    }

    setOptionChoice("");
  };

  const handleOptionClick = (option) => {
    const updated = [...pokemonImageUrls];
    updated[currentQuestionIndex].selected = "";
    setPokemonImageUrls(updated);
    setOptionChoice(option);
  };

  const submitQuiz = async (updated) => {
    try {
      const answers = updated.map((q) => ({
        questionId: q.questionId,
        selected: q.selected,
      }));

      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/game/submit`,
        {
          sessionId,
          answers,
          userId: userData._id,
        },
      );

      setScore(res.data.score);
      setUserData(res.data.user);
      setQuizComplete(true);
    } catch (err) {
      setErrorMessage("");
    }
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
      if (score === 10) i = 0;
      else if (score >= 8) i = 1;
      else if (score >= 6) i = 2;
      else if (score >= 4) i = 3;
      else i = 4;

      setScoreDialogue(dialogues[i]);
    }
  }, [quizComplete, score]);

  const completeQuiz = () => {
    window.location.href = "/";
  };

  return (
    <div className="center-container">
      <div className="professors wtp-container">
        <img draggable="false" className="dawn" src={dawn} alt="Dawn" />

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
                    <img
                      className="wtp-pokemon"
                      src={pokemonImageUrls[currentQuestionIndex]?.question}
                      alt="pokemon"
                    />
                  </p>
                </div>

                <div className="grid-btn-container">
                  {pokemonImageUrls[currentQuestionIndex]?.options.map(
                    (opt, i) => (
                      <button
                        key={i}
                        className={`trivia-option ${
                          optionChoice === opt ||
                          pokemonImageUrls[currentQuestionIndex]?.selected ===
                            opt
                            ? "active-btn"
                            : ""
                        }`}
                        onClick={() => handleOptionClick(opt)}
                      >
                        {opt}
                      </button>
                    ),
                  )}
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

export default WhosThatPokemon;
