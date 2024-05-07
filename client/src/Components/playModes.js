import delia from "../Images/Characters/delia.png";
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function PlayModes({ userData, setUserData }) {
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [disabledMode, setDisabledMode] = useState(true);
  const [activeMode, setActiveMode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const dialogues = [
    { dialogue: "Hello, dear! It's so nice to see you." },
    {
      dialogue:
        "Seems like you're finally ready to become a PokéTrivia Master!",
    },
    {
      dialogue:
        "I've always known you had a knack for collecting knowledge about Pokémon.",
    },
    {
      dialogue:
        "Remember, in the world of PokéTrivia, every question is an opportunity to learn something new!",
    },
    {
      dialogue:
        "You're going to have so much fun exploring different Pokémon and testing your knowledge.",
    },
    {
      dialogue:
        "And if you ever need any help or guidance, I'll be right here for you.",
    },
    {
      dialogue:
        "So go ahead, my dear. Dive into the world of PokéTrivia and make me proud!",
    },
  ];

  const activeModeDialogue = {
    "poke-quiz":
      "Let's put your Pokémon knowledge to the test with 20 questions!",
    "speedy-showdown":
      "(Coming Soon) Get ready for a rapid-fire challenge where you answer as many questions as you can in just 120 seconds!",
    "whos-that-pokemon":
      "Try to identify the hidden Pokémon from its silhouette in this classic guessing game!",
    "scramble-surge":
      "(Coming Soon) Unscramble the names of 5 Pokémon before time runs out in this word scramble challenge!",
    "type-matchup":
      "(Coming Soon) Match Pokémon with their corresponding types in this exciting test of knowledge and strategy!",
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
          visitedPlayModes: true,
        },
      })
      .then((response) => {
        setUserData(response.data.user);
        handleNextDialogue();
      })
      .catch((error) => {
        setErrorMessage(
          "Oh dear, it looks like something went wrong. Why don't you take a little break while I figure out what happened and fix it?"
        );
      });
  };

  return (
    <div className="center-container">
      <div className="professors">
        <img draggable="false" className="mom" src={delia} alt="Delia - Mom" />
        {userData.visitedPlayModes ? (
          <>
            <div className="home-container">
              <div className="grid-btn-container">
                <button
                  className={`mode-btn ${
                    activeMode === "poke-quiz" ? "active-btn" : ""
                  }`}
                  onClick={() => {
                    setActiveMode(
                      activeMode === "poke-quiz" ? "" : "poke-quiz"
                    );
                    setDisabledMode(false);
                  }}
                >
                  PokéQuiz
                </button>
                <button
                  className={`mode-btn ${
                    activeMode === "whos-that-pokemon" ? "active-btn" : ""
                  }`}
                  onClick={() => {
                    setActiveMode(
                      activeMode === "whos-that-pokemon"
                        ? ""
                        : "whos-that-pokemon"
                    );
                    setDisabledMode(false);
                  }}
                >
                  Who's That Pokémon?
                </button>
                <button
                  className={`mode-btn disabled-mode ${
                    activeMode === "speedy-showdown" ? "active-btn" : ""
                  }`}
                  onClick={() => {
                    setActiveMode(
                      activeMode === "speedy-showdown" ? "" : "speedy-showdown"
                    );
                    setDisabledMode(true);
                  }}
                >
                  Speedy Showdown (Coming Soon)
                </button>
                <button
                  className={`mode-btn disabled-mode ${
                    activeMode === "scramble-surge" ? "active-btn" : ""
                  }`}
                  onClick={() => {
                    setActiveMode(
                      activeMode === "scramble-surge" ? "" : "scramble-surge"
                    );
                    setDisabledMode(true);
                  }}
                >
                  Scramble Surge (Coming Soon)
                </button>
                <button
                  className={`mode-btn disabled-mode ${
                    activeMode === "type-matchup" ? "active-btn" : ""
                  }`}
                  onClick={() => {
                    setActiveMode(
                      activeMode === "type-matchup" ? "" : "type-matchup"
                    );
                    setDisabledMode(true);
                  }}
                >
                  Type Matchup (Coming Soon)
                </button>
              </div>
              {activeMode && (
                <>
                  <div className="home-text-container">
                    <p>
                      <span className="mom">MOM: </span>
                      {activeModeDialogue[activeMode]}
                    </p>
                  </div>
                  <Link
                    className="btn-container"
                    to={`/play-modes/${activeMode}`}
                  >
                    <button
                      className="home-btn next-sm"
                      disabled={disabledMode}
                    >
                      Start
                    </button>
                  </Link>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="home-container">
              <div className="home-text-container">
                <p className="dialogue">
                  <span className="mom">MOM: </span>
                  {dialogues[currentDialogueIndex].dialogue}
                </p>
                {currentDialogueIndex === dialogues.length - 1 && (
                  <div className="name-input-container">
                    {errorMessage && (
                      <p className="dialogue">
                        <span className="mom">MOM: </span>
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
                  Get Started
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PlayModes;
