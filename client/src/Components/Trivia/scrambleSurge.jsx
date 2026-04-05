import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../Utils/toast";

function ScrambleSurge({ userData, setUserData, getAccessTokenSilently }) {
  const navigate = useNavigate();

  const [currentQuestionIndex, setQuestionIndex] = useState(0);
  const [optionChoice, setOptionChoice] = useState("");
  const [pokemonScrambledNameList, setpokemonScrambledNameList] = useState([]);
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
          { type: "scramble", userId: userData._id },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!isMounted) return;
        setpokemonScrambledNameList(
          response.data.questions.map((q) => ({ ...q, selected: "" })),
        );
        setSessionId(response.data.sessionId);
      } catch {
        if (!isMounted) return;
        setErrorMessage(
          "My rock-solid focus slipped! I couldn't load the scramble list. Try again!",
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
    const updatedList = [...pokemonScrambledNameList];
    if (optionChoice) {
      updatedList[currentQuestionIndex].selected = optionChoice;
    }
    setpokemonScrambledNameList(updatedList);

    if (type === "next") {
      setQuestionIndex((prev) => Math.min(prev + 1, updatedList.length - 1));
    } else if (type === "previous") {
      setQuestionIndex((prev) => Math.max(prev - 1, 0));
    } else if (type === "confirm") {
      submitQuiz(updatedList);
    }
    setOptionChoice("");
  };

  const submitQuiz = async (updatedList) => {
    try {
      setLoading(true);
      setErrorMessage("");
      const answers = updatedList.map((q) => ({
        questionId: q.questionId,
        selected: q.selected,
      }));
      const token = await getAccessTokenSilently();
      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/game/submit`,
        { sessionId, answers, userId: userData._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const rewards = res.data.rewards;
      showToast.reward(rewards);
      setScore(res.data.score);
      setUserData(res.data.user);
      setQuizComplete(true);
    } catch (err) {
      console.log(err);
      setErrorMessage(
        "The scorecard is buried under some rocks! Try hitting confirm again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pokemonScrambledNameList[currentQuestionIndex]) {
      setOptionChoice(
        pokemonScrambledNameList[currentQuestionIndex].selected || "",
      );
    }
  }, [currentQuestionIndex, pokemonScrambledNameList]);

  useEffect(() => {
    if (quizComplete) {
      const dialogues = [
        "Outstanding! A perfect score! You're a PokéTrivia Master!",
        "Congratulations! You're making great progress.",
        "Impressive! Your knowledge is growing stronger.",
        "Keep up the good work! You're getting closer.",
        "No worries! Even the greatest trainers started somewhere.",
      ];
      let i =
        score === 10 ? 0 : score >= 8 ? 1 : score >= 6 ? 2 : score >= 4 ? 3 : 4;
      setScoreDialogue(dialogues[i]);
    }
  }, [quizComplete, score]);

  return (
    <div className="center-container">
      <div className="professors wtp-container">
        <img
          draggable="false"
          className="brock"
          src={`${import.meta.env.VITE_APP_CLOUDINARY_BASE}/brock_ncikjz.png`}
          alt="Brock"
        />

        {loading && !quizComplete && pokemonScrambledNameList.length === 0 && (
          <div className="home-container">
            <div className="home-text-container">
              <p>
                <span className="brock">BROCK: </span>Just setting up the
                field...
              </p>
            </div>
          </div>
        )}

        {errorMessage &&
        !quizComplete &&
        pokemonScrambledNameList.length === 0 ? (
          <div className="home-container">
            <div className="home-text-container">
              <p>
                <span className="brock">BROCK: </span>
                {errorMessage}
              </p>
            </div>
            <button className="home-btn next-sm" onClick={() => navigate("/")}>
              Leave
            </button>
          </div>
        ) : (
          pokemonScrambledNameList.length > 0 && (
            <div className="home-container">
              {!quizComplete ? (
                <>
                  <div className="home-text-container">
                    <p>
                      <span className="brock">BROCK: </span>Who's that Pokémon?
                    </p>
                    <p className="pkmn-holder">
                      {pokemonScrambledNameList[currentQuestionIndex]?.question}
                    </p>
                    {errorMessage && (
                      <p style={{ color: "red" }}>
                        <span className="brock">BROCK: </span> {errorMessage}
                      </p>
                    )}
                  </div>
                  <div className="grid-btn-container">
                    {pokemonScrambledNameList[
                      currentQuestionIndex
                    ]?.options.map((opt, i) => (
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
                    <button
                      className="home-btn next"
                      onClick={() =>
                        handleConfirmClick(
                          currentQuestionIndex <
                            pokemonScrambledNameList.length - 1
                            ? "next"
                            : "confirm",
                        )
                      }
                      disabled={
                        (!optionChoice &&
                          !pokemonScrambledNameList[currentQuestionIndex]
                            .selected) ||
                        loading
                      }
                    >
                      {loading
                        ? "..."
                        : currentQuestionIndex <
                            pokemonScrambledNameList.length - 1
                          ? "Next"
                          : "Confirm"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="home-container">
                  <div className="home-text-container">
                    <p>
                      <span className="brock">BROCK: </span>Score: {score}/
                      {pokemonScrambledNameList.length}
                    </p>
                    <p>
                      <span className="brock">BROCK: </span>
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
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default ScrambleSurge;
