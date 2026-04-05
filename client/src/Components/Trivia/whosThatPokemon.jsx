import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function WhosThatPokemon({ userData, setUserData, getAccessTokenSilently }) {
  const navigate = useNavigate();

  const [currentQuestionIndex, setQuestionIndex] = useState(0);
  const [optionChoice, setOptionChoice] = useState("");
  const [pokemonImageUrls, setPokemonImageUrls] = useState([]);
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
          { type: "image", userId: userData._id },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!isMounted) return;
        setPokemonImageUrls(
          response.data.questions.map((q) => ({ ...q, selected: "" })),
        );
        setSessionId(response.data.sessionId);
      } catch {
        if (!isMounted) return;
        setErrorMessage(
          "No need to worry, but I couldn't load the Pokémon images! Try again.",
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
    const updated = [...pokemonImageUrls];
    if (optionChoice) {
      updated[currentQuestionIndex].selected = optionChoice;
    }
    setPokemonImageUrls(updated);

    if (type === "next") {
      setQuestionIndex((prev) => Math.min(prev + 1, updated.length - 1));
    } else if (type === "previous") {
      setQuestionIndex((prev) => Math.max(prev - 1, 0));
    } else if (type === "confirm") {
      submitQuiz(updated);
    }
    setOptionChoice("");
  };

  const submitQuiz = async (updated) => {
    try {
      setLoading(true);
      setErrorMessage("");
      const answers = updated.map((q) => ({
        questionId: q.questionId,
        selected: q.selected,
      }));
      const token = await getAccessTokenSilently();
      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/game/submit`,
        { sessionId, answers, userId: userData._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setScore(res.data.score);
      setUserData(res.data.user);
      setQuizComplete(true);
    } catch {
      setErrorMessage(
        "Piplup tripped on the way to the server! Try hitting confirm again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pokemonImageUrls[currentQuestionIndex]) {
      setOptionChoice(pokemonImageUrls[currentQuestionIndex].selected || "");
    }
  }, [currentQuestionIndex, pokemonImageUrls]);

  useEffect(() => {
    if (quizComplete) {
      const dialogues = [
        "Outstanding! A perfect score! You're a PokéTrivia Master!",
        "Congratulations! You're making great progress!",
        "Impressive! Your knowledge is growing stronger.",
        "Keep up the good work!",
        "No worries! Even the best coordinators started somewhere.",
      ];
      let i =
        score === 10 ? 0 : score >= 8 ? 1 : score >= 6 ? 2 : score >= 4 ? 3 : 4;
      setScoreDialogue(dialogues[i]);
    }
  }, [quizComplete, score]);

  return (
    <div className="center-container">
      <div className="professors wtp-container">
        <img draggable="false" className="dawn" src={`${import.meta.env.VITE_APP_CLOUDINARY_BASE}/dawn_z5pxu6.png`} alt="Dawn" />

        {loading && !quizComplete && pokemonImageUrls.length === 0 && (
          <div className="home-container">
            <div className="home-text-container">
              <p>
                <span className="dawn">DAWN: </span>Just a moment, getting the
                stage ready!
              </p>
            </div>
          </div>
        )}

        {errorMessage && !quizComplete && pokemonImageUrls.length === 0 ? (
          <div className="home-container">
            <div className="home-text-container">
              <p>
                <span className="dawn">DAWN: </span>
                {errorMessage}
              </p>
            </div>
            <button className="home-btn next-sm" onClick={() => navigate("/")}>
              Leave
            </button>
          </div>
        ) : (
          pokemonImageUrls.length > 0 && (
            <div className="home-container">
              {!quizComplete ? (
                <>
                  <div className="home-text-container">
                    <p>
                      <span className="dawn">DAWN: </span>Who's that Pokémon?
                    </p>
                    <p className="pkmn-holder">
                      <img
                        className="wtp-pokemon"
                        src={pokemonImageUrls[currentQuestionIndex]?.question}
                        alt="pokemon"
                      />
                    </p>
                    {errorMessage && (
                      <p style={{ color: "red" }}>
                        <span className="dawn">DAWN: </span> {errorMessage}
                      </p>
                    )}
                  </div>
                  <div className="grid-btn-container">
                    {pokemonImageUrls[currentQuestionIndex]?.options.map(
                      (opt, i) => (
                        <button
                          key={i}
                          className={`trivia-option ${optionChoice === opt ? "active-btn" : ""}`}
                          onClick={() => setOptionChoice(opt)}
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
                      disabled={currentQuestionIndex === 0 || loading}
                    >
                      Previous
                    </button>
                    <button
                      className="home-btn next"
                      onClick={() =>
                        handleConfirmClick(
                          currentQuestionIndex < pokemonImageUrls.length - 1
                            ? "next"
                            : "confirm",
                        )
                      }
                      disabled={
                        (!optionChoice &&
                          !pokemonImageUrls[currentQuestionIndex].selected) ||
                        loading
                      }
                    >
                      {loading
                        ? "..."
                        : currentQuestionIndex < pokemonImageUrls.length - 1
                          ? "Next"
                          : "Confirm"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="home-container">
                  <div className="home-text-container">
                    <p>
                      <span className="dawn">DAWN: </span>Score: {score}/10
                    </p>
                    <p>
                      <span className="dawn">DAWN: </span>
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

export default WhosThatPokemon;
