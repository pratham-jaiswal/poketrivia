import kukui from "../../Images/Characters/kukui.png";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PokeQuiz({ userData, setUserData, getAccessTokenSilently }) {
  const navigate = useNavigate();

  const [currentQuestionIndex, setQuestionIndex] = useState(0);
  const [optionChoice, setOptionChoice] = useState("");
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState("");

  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [scoreDialogue, setScoreDialogue] = useState();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const startGame = async () => {
      const token = await getAccessTokenSilently();
      axios
        .post(
          `${import.meta.env.VITE_APP_API_URL}/api/game/start`,
          {
            type: "fact",
            userId: userData._id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then((response) => {
          setQuestions(
            response.data.questions.map((q) => ({
              ...q,
              selected: "",
            })),
          );
          setSessionId(response.data.sessionId);
        })
        .catch((error) => {
          console.error("Error starting game:", error);
        });
    };

    startGame();
  }, []);

  const handleConfirmClick = (type) => {
    const updatedFacts = [...questions];

    if (optionChoice) {
      updatedFacts[currentQuestionIndex].selected = optionChoice;
    }

    setQuestions(updatedFacts);

    if (type === "next") {
      setQuestionIndex(
        currentQuestionIndex < updatedFacts.length - 1
          ? currentQuestionIndex + 1
          : updatedFacts.length - 1,
      );
    } else if (type === "previous") {
      setQuestionIndex(currentQuestionIndex > 0 ? currentQuestionIndex - 1 : 0);
    } else if (type === "confirm") {
      submitQuiz(updatedFacts);
    }

    setOptionChoice("");
  };

  const handleOptionClick = (option) => {
    // const updatedFacts = [...questions];
    // updatedFacts[currentQuestionIndex].selected = "";
    // setQuestions(updatedFacts);
    setOptionChoice(option);
  };

  const submitQuiz = async (updatedFacts) => {
    try {
      const answers = updatedFacts.map((fact) => ({
        questionId: fact.questionId,
        selected: fact.selected,
      }));
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/game/submit`,
        {
          sessionId,
          answers,
          userId: userData._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setScore(response.data.score);
      setUserData(response.data.user);
      setQuizComplete(true);
    } catch (error) {
      console.error(err);
      setErrorMessage("Failed to submit quiz. Try again.");
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
    navigate("/");
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
        {questions.length > 0 && (
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
                    {questions[currentQuestionIndex]?.question}
                  </p>
                </div>

                <div className="grid-btn-container">
                  {questions[currentQuestionIndex]?.options.map((opt, i) => (
                    <button
                      key={i}
                      className={`trivia-option ${
                        optionChoice === opt ||
                        questions[currentQuestionIndex]?.selected === opt
                          ? "active-btn"
                          : ""
                      }`}
                      onClick={() => handleOptionClick(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <div className="grid-btn-container">
                  <button
                    className="home-btn next"
                    onClick={() => handleConfirmClick("previous")}
                    disabled={currentQuestionIndex > 0 ? false : true}
                  >
                    Previous
                  </button>
                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      className="home-btn next"
                      onClick={() => handleConfirmClick("next")}
                      disabled={
                        optionChoice || questions[currentQuestionIndex].selected
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
                        optionChoice || questions[currentQuestionIndex].selected
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
