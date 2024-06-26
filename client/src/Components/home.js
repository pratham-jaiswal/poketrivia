import oak from "../Images/Characters/oak.png";
import juniper from "../Images/Characters/juniper.png";
import { useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import emailjs from "@emailjs/browser";

function Home({ isAuthenticated, userData, setUserData, userEmail }) {
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);
  const [status, setStatus] = useState({
    message: "",
    type: "",
  });
  const form = useRef();

  const dialogues = [
    { id: 1, dialogue: "Hello, there!", speaker: "both" },
    { id: 2, dialogue: "Glad to meet you!", speaker: "both" },
    { id: 3, dialogue: "Welcome to the world of Pokémon!", speaker: "both" },
    {
      id: 4,
      dialogue: "My name is JUNIPER, and he is OAK.",
      speaker: "juniper",
    },
    {
      id: 5,
      dialogue: "People affectionately refer to us as Pokémon Professors.",
      speaker: "juniper",
    },
    {
      id: 6,
      dialogue:
        "This world is inhabited, far and wide by creatures called Pokémon.",
      speaker: "oak",
    },
    {
      id: 7,
      dialogue:
        "For some people, Pokémon are companions. Others trade them to expand their collection.",
      speaker: "oak",
    },
    {
      id: 8,
      dialogue: "As for us, we study Pokémon as a profession.",
      speaker: "oak",
    },
    {
      id: 9,
      dialogue: "But first, tell us a little about yourself.",
      speaker: "oak",
    },
    {
      id: 10,
      dialogue: "Let's begin with your name. What is it?",
      speaker: "oak",
    },
    {
      id: 11,
      dialogue: `Your very own Pokémon journey is about to begin, ${username}!`,
      speaker: "juniper",
    },
    {
      id: 12,
      dialogue:
        "A world of discovery and excitement with Pokémon awaits! Let's go!",
      speaker: "both",
    },
  ];

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        process.env.REACT_APP_EMAIL_SERVICE_KEY,
        process.env.REACT_APP_EMAIL_TEMPLATE_ID,
        form.current,
        {
          publicKey: process.env.REACT_APP_EMAIL_PUBLIC_KEY,
        }
      )
      .then(
        () => {
          form.current.reset();
          setStatus({
            message:
              "Your message has been successfully sent. We will get back to you as soon as possible.",
            type: "success",
          });
          setTimeout(() => {
            setStatus({
              message: "",
              type: "",
            });
          }, 5000);
        },
        (error) => {
          console.log(error.text);
          setStatus({
            message:
              "Oops! Something went wrong while sending your message. Please try again later or use alternative contact options below.",
            type: "error",
          });
          setTimeout(() => {
            setStatus({
              message: "",
              type: "",
            });
          }, 5000);
        }
      );
  };

  const handleNextDialogue = () => {
    if (currentDialogueIndex < dialogues.length - 1) {
      setCurrentDialogueIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handleNameChange = (e) => {
    const inputValue = e.target.value;
    const isValidUsername = /^[a-zA-Z0-9]*$/.test(inputValue);
    if (inputValue.length <= 20 && isValidUsername) {
      setUsername(inputValue);
      setIsConfirmDisabled(inputValue.length < 3);
      setErrorMessage("");
    }
  };

  const handleNameConfirmation = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/new-user`, {
        username,
        email: userEmail,
      })
      .then((response) => {
        setUserData(response.data.user);
        handleNextDialogue();
      })
      .catch((error) => {
        setErrorMessage(
          "This name is already taken by another user. Try another name."
        );
      });
  };

  return (
    <>
      <div className="center-container">
        <div className="professors">
          <img
            draggable="false"
            className="juniper"
            src={juniper}
            alt="Professor Juniper"
          />
          {!isAuthenticated || (isAuthenticated && userData) ? (
            <>
              <div className="home-container">
                <div className="home-text-container">
                  <h1>Welcome to PokéTrivia!</h1>
                  <p>Test your Pokémon knowledge and win PokéCoins!</p>
                  <p>
                    Use your PokéCoins to collect Pokémon card packs and expand
                    your collection.
                  </p>
                  {/* <p>
                    Trade cards with other players to complete your collection!
                  </p> */}
                </div>
                <div className="home-btn-container">
                  <Link className="btn-container" to="/play-modes">
                    <button className="home-btn">
                      Play
                    </button>
                  </Link>
                  <Link className="btn-container" to="/pokemart">
                    <button className="home-btn">
                      PokéMart
                    </button>
                  </Link>
                  {/* <Link className="btn-container" to="/">
                    <button className="home-btn" disabled>
                      Trade (Coming Soon)
                    </button>
                  </Link> */}
                  <Link className="btn-container" to="/pokedex">
                    <button className="home-btn">
                      Pokédex
                    </button>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="home-container">
                <div className="home-text-container">
                  <p className="dialogue">
                    <span className={dialogues[currentDialogueIndex].speaker}>
                      {currentDialogueIndex + 1 >= 4
                        ? dialogues[currentDialogueIndex].speaker.toUpperCase()
                        : "???"}
                      :{" "}
                    </span>
                    {dialogues[currentDialogueIndex].dialogue}
                  </p>
                  {currentDialogueIndex + 1 === 10 && (
                    <div className="name-input-container">
                      <input
                        type="text"
                        value={username}
                        onChange={handleNameChange}
                        placeholder="Red"
                      />

                      {errorMessage && (
                        <p className="dialogue">
                          <span className="oak">OAK: </span>
                          {errorMessage}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {currentDialogueIndex < dialogues.length - 1 ? (
                  <button
                    className="home-btn next-sm"
                    onClick={
                      currentDialogueIndex + 1 === 10
                        ? handleNameConfirmation
                        : handleNextDialogue
                    }
                    disabled={
                      currentDialogueIndex + 1 === 10
                        ? isConfirmDisabled
                        : false
                    }
                  >
                    Next
                  </button>
                ) : (
                  <button
                    className="home-btn"
                    onClick={() => window.location.reload()}
                  >
                    Wake Up!
                  </button>
                )}
              </div>
            </>
          )}
          <img
            draggable="false"
            className="oak"
            src={oak}
            alt="Professor Oak"
          />
        </div>
      </div>
      <div className="center-container-2">
        <div className="home-text-container">
          <h1>Disclaimer</h1>
          <p>
            This web application is a fan-made project created for educational
            and entertainment purposes. It is not affiliated with, endorsed,
            sponsored, or specifically approved by Nintendo or any of its
            affiliates.
          </p>
          <p>
            All Pokémon characters, names, and related indicia are trademarks of
            Nintendo, Game Freak, and Creatures. This project does not intend to
            infringe upon these trademarks and is not made for profit.
          </p>
          <p>
            We hope you enjoy using this application as much as we enjoyed
            creating it. If you have any questions or concerns, please feel free
            to reach out to us.
          </p>
        </div>
      </div>
      <form className="center-container-2" ref={form} onSubmit={sendEmail}>
        <div className={`status ${status.type}`}>{status.message}</div>
        <input type="text" name="user_name" placeholder="Name" required />
        <input type="email" name="user_email" placeholder="Email" required />
        <input type="text" name="app_name" value="Pokétrivia" hidden />
        <textarea
          placeholder="Message"
          cols="30"
          rows="10"
          name="message"
          required
        ></textarea>
        <button className="home-btn" type="submit">
          Send
        </button>
      </form>
      <div className="center-container-2">
        <div className="home-text-container">
          <Link
            to="https://github.com/pratham-jaiswal/poketrivia"
            target="_blank"
          >
            <i className="fa-brands fa-github"></i>
          </Link>
          <Link to="https://www.instagram.com/_pratham.dev" target="_blank">
            <i className="fa-brands fa-instagram"></i>
          </Link>
          <Link to="mailto:prathamj0502@gmail.com">
            <i className="fa-solid fa-envelope"></i>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Home;
