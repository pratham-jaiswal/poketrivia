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
  const [scoreDialogue, setScoreDialogue] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const startGame = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/api/game/start`,
          { type: "fact", userId: userData._id },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!isMounted) return;
        setQuestions(
          response.data.questions.map((q) => ({
            ...q,
            selected: "",
          })),
        );
        setSessionId(response.data.sessionId);
      } catch {
        if (!isMounted) return;
        setErrorMessage(
          "Oh no! I couldn't find my quiz notes. Try coming back later!",
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    startGame();
    return () => {
      isMounted = false;
    };
  }, [getAccessTokenSilently, userData._id]);

  const handleConfirmClick = (type) => {
    const updatedFacts = [...questions];

    if (optionChoice) {
      updatedFacts[currentQuestionIndex].selected = optionChoice;
    }

    setQuestions(updatedFacts);

    if (type === "next") {
      setQuestionIndex((prev) => Math.min(prev + 1, updatedFacts.length - 1));
    } else if (type === "previous") {
      setQuestionIndex((prev) => Math.max(prev - 1, 0));
    } else if (type === "confirm") {
      submitQuiz(updatedFacts);
    }

    setOptionChoice("");
  };

  const submitQuiz = async (updatedFacts) => {
    try {
      setLoading(true);
      setErrorMessage("");
      const answers = updatedFacts.map((fact) => ({
        questionId: fact.questionId,
        selected: fact.selected,
      }));
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/game/submit`,
        { sessionId, answers, userId: userData._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setScore(response.data.score);
      setUserData(response.data.user);
      setQuizComplete(true);
    } catch {
      setErrorMessage(
        "Something went wrong with the scorecard! Try hitting confirm again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questions[currentQuestionIndex]) {
      setOptionChoice(questions[currentQuestionIndex].selected || "");
    }
  }, [currentQuestionIndex, questions]);

  useEffect(() => {
    if (quizComplete) {
      const dialogues = [
        "Outstanding! A perfect score! You're a PokéTrivia Master!",
        "Congratulations! You're making great progress on your journey.",
        "Impressive! Your knowledge of Pokémon is growing stronger.",
        "Keep up the good work! Every correct answer helps.",
        "No worries! Even the greatest trainers started somewhere. Keep going!",
      ];

      let i =
        score === 20
          ? 0
          : score >= 16
            ? 1
            : score >= 12
              ? 2
              : score >= 8
                ? 3
                : 4;
      setScoreDialogue(dialogues[i]);
    }
  }, [quizComplete, score]);

  return (
    <div className="center-container">
      <div className="professors">
        <img
          draggable="false"
          className="kukui"
          src={kukui}
          alt="Professor Kukui"
        />

        {loading && !quizComplete && questions.length === 0 && (
          <div className="home-container">
            <div className="home-text-container">
              <p>
                <span className="kukui">KUKUI: </span>Just getting the stadium
                ready, Cousin!
              </p>
            </div>
          </div>
        )}

        {errorMessage && !quizComplete && questions.length === 0 ? (
          <div className="home-container">
            <div className="home-text-container">
              <p>
                <span className="kukui">KUKUI: </span>
                {errorMessage}
              </p>
            </div>
            <button className="home-btn next-sm" onClick={() => navigate("/")}>
              Leave
            </button>
          </div>
        ) : (
          questions.length > 0 && (
            <>
              {!quizComplete ? (
                <div className="home-container">
                  <div className="home-text-container">
                    <p>
                      <span className="kukui">KUKUI: </span>
                      {questions[currentQuestionIndex]?.question}
                    </p>
                    {errorMessage && (
                      <p className="error-text" style={{ color: "red" }}>
                        <span className="kukui">KUKUI: </span> {errorMessage}
                      </p>
                    )}
                  </div>

                  <div className="grid-btn-container">
                    {questions[currentQuestionIndex]?.options.map((opt, i) => (
                      <button
                        key={i}
                        className={`trivia-option ${optionChoice === opt ? "active-btn" : ""}`}
                        onClick={() => setOptionChoice(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <div className="grid-btn-container">
                    <button
                      className="home-btn next"
                      onClick={() => handleConfirmClick("previous")}
                      disabled={currentQuestionIndex === 0 || loading}
                    >
                      Previous
                    </button>

                    {currentQuestionIndex < questions.length - 1 ? (
                      <button
                        className="home-btn next"
                        onClick={() => handleConfirmClick("next")}
                        disabled={
                          (!optionChoice &&
                            !questions[currentQuestionIndex].selected) ||
                          loading
                        }
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        className="home-btn next"
                        onClick={() => handleConfirmClick("confirm")}
                        disabled={
                          (!optionChoice &&
                            !questions[currentQuestionIndex].selected) ||
                          loading
                        }
                      >
                        {loading ? "Submitting..." : "Confirm"}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="home-container">
                  <div className="home-text-container">
                    <p>
                      <span className="kukui">KUKUI: </span>Score: {score}/20
                    </p>
                    <p>
                      <span className="kukui">KUKUI: </span>
                      {scoreDialogue}
                    </p>
                  </div>
                  <button
                    className="home-btn next-sm"
                    onClick={() => navigate("/")}
                  >
                    Close
                  </button>
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}

export default PokeQuiz;
