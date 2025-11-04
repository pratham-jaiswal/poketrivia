import { useEffect, useState } from "react";
import Home from "./Components/home";
import Navbar from "./Components/navbar";
import { useAuth0 } from "@auth0/auth0-react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom"; // Import Navigate
import axios from "axios";
import Pokedex from "./Components/pokedex";
import PlayModes from "./Components/playModes";
import PokeMart from "./Components/pokemart";
import PokeQuiz from "./Components/Trivia/pokeQuiz";
import WhosThatPokemon from "./Components/Trivia/whosThatPokemon";
import ScrambleSurge from "./Components/Trivia/scrambleSurge";

export const NotAuthenticatedComponent = ({ message }) => (
  <div style={{ textAlign: "center" }}>
    <h1>Unauthorized Access</h1>
    <p style={{ fontSize: "20px" }}>{message}</p>
  </div>
);

const NotFoundComponent = () => (
  <div style={{ textAlign: "center" }}>
    <h1>404 - Not Found</h1>
    <p style={{ fontSize: "20px" }}>
      The page you are looking for does not exist.
    </p>
  </div>
);

function App() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [userData, setUserData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        axios
          .get(`${process.env.REACT_APP_API_URL}/api/user?email=${user.email}`)
          .then((response) => {
            setUserData(response.data.user);
            setIsLoaded(true);
          })
          .catch((error) => {
            console.error("Error sending user data to backend:", error);
            setIsLoaded(false);
          });
      } else {
        setIsLoaded(true);
      }
    }
  }, [isAuthenticated, user, isLoading]);

  return (
    <div className="app">
      <a
        href="https://www.patreon.com/collection/1819237"
        target="_blank"
        rel="noopener"
        id="floating-patreon-btn"
        area-label="Support Me on Patreon"
      >
        <img width={20} src="https://res.cloudinary.com/dhzmockpa/image/upload/v1745674680/PATREON_SYMBOL_1_BLACK_RGB_trsdty.svg" alt="Support Me on Patreon" />
      </a>
      {isLoaded && (
        <Router>
          <Navbar userData={userData} isAuthenticated={isAuthenticated} />
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Home
                    isAuthenticated={isAuthenticated}
                    userData={userData}
                    setUserData={setUserData}
                    userEmail={isAuthenticated ? user.email : null}
                  />
                </>
              }
            />
            <Route
              path="/play-modes"
              element={
                <>
                  <PlayModes userData={userData} setUserData={setUserData} />
                </>
              }
            />
            <Route
              path="/pokedex"
              element={
                <>
                  <Pokedex userData={userData} setUserData={setUserData} />
                </>
              }
            />
            {isAuthenticated ? (
              <>
                <Route
                  path="/play-modes/poke-quiz"
                  element={
                    <PokeQuiz userData={userData} setUserData={setUserData} />
                  }
                />
                <Route
                  path="/play-modes/whos-that-pokemon"
                  element={
                    <WhosThatPokemon
                      userData={userData}
                      setUserData={setUserData}
                    />
                  }
                />
                <Route
                  path="/play-modes/scramble-surge"
                  element={
                    <ScrambleSurge
                      userData={userData}
                      setUserData={setUserData}
                    />
                  }
                />
                <Route
                  path="/pokemart"
                  element={
                    <PokeMart userData={userData} setUserData={setUserData} />
                  }
                />
                {/* <Route path="/profile" element={"profile"} /> */}
                {/* <Route path="/trade" element={"trade"} />
                <Route path="/leaderboard" element={"leaderboard"} /> */}
              </>
            ) : (
              <>
                <Route
                  path="/play-modes/poke-quiz"
                  element={
                    <NotAuthenticatedComponent message="Please log in to access this page." />
                  }
                />
                <Route
                  path="/play-modes/whos-that-pokemon"
                  element={
                    <NotAuthenticatedComponent message="Please log in to access this page." />
                  }
                />
                <Route
                  path="/play-modes/scramble-surge"
                  element={
                    <NotAuthenticatedComponent message="Please log in to access this page." />
                  }
                />
                <Route
                  path="/pokemart"
                  element={
                    <NotAuthenticatedComponent message="Please log in to access this page." />
                  }
                />
              </>
            )}
            <Route path="*" element={<NotFoundComponent />} />
          </Routes>
        </Router>
      )}
    </div>
  );
}

export default App;
