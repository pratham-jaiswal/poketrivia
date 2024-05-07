import { useEffect, useState } from "react";
import Home from "./Components/home";
import Navbar from "./Components/navbar";
import { useAuth0 } from "@auth0/auth0-react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom"; // Import Navigate
import axios from "axios";
import Pokedex from "./Components/pokedex";
import PlayModes from "./Components/playModes";
import PokeMart from "./Components/pokemart";
import PokeQuiz from "./Components/Trivia/pokeQuiz";
import WhosThatPokemon from "./Components/Trivia/whosThatPokemon";

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
            {isAuthenticated ? (
              <>
                <Route
                  path="/play-modes"
                  element={
                    <>
                      <PlayModes
                        userData={userData}
                        setUserData={setUserData}
                      />
                    </>
                  }
                />
                <Route
                  path="/play-modes/poke-quiz"
                  element={
                    <PokeQuiz userData={userData} setUserData={setUserData} />
                  }
                />                
                <Route
                  path="/play-modes/whos-that-pokemon"
                  element={
                    <WhosThatPokemon userData={userData} setUserData={setUserData} />
                  }
                />
                {/* <Route path="/profile" element={"profile"} /> */}
                <Route
                  path="/pokemart"
                  element={
                    <PokeMart userData={userData} setUserData={setUserData} />
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
                {/* <Route path="/trade" element={"trade"} />
                <Route path="/leaderboard" element={"leaderboard"} /> */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/" replace />} />
            )}
          </Routes>
        </Router>
      )}
    </div>
  );
}

export default App;
