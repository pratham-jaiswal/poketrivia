import { useEffect, useState, Suspense, lazy } from "react";
import Home from "./Components/home";
import Navbar from "./Components/navbar";
import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import { showToast } from "./Utils/toast";

const Pokedex = lazy(() => import("./Components/pokedex"));
const PlayModes = lazy(() => import("./Components/playModes"));
const PokemonNursery = lazy(() => import("./Components/pokemonNursery"));
const PokeQuiz = lazy(() => import("./Components/Trivia/pokeQuiz"));
const WhosThatPokemon = lazy(
  () => import("./Components/Trivia/whosThatPokemon"),
);
const ScrambleSurge = lazy(() => import("./Components/Trivia/scrambleSurge"));

const NotFoundComponent = () => (
  <div style={{ textAlign: "center" }}>
    <h1>404 - Not Found</h1>
    <p style={{ fontSize: "20px" }}>
      The page you are looking for does not exist.
    </p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading || !isAuthenticated) {
    return;
  }

  return children;
};

function App() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } =
    useAuth0();
  const [userData, setUserData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      if (isLoading) return;

      if (isAuthenticated && user?.email) {
        try {
          const token = await getAccessTokenSilently();
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/api/user?email=${user.email}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );

          if (isMounted) {
            setUserData(response.data.user);
            setIsLoaded(true);
          }
        } catch {
          if (isMounted) {
            showToast.error(
              "PokéCenter connection failed! Unable to retrieve Trainer data.",
            );
            setIsLoaded(true);
          }
        }
      } else {
        if (isMounted) setIsLoaded(true);
      }
    };

    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.email, isLoading, getAccessTokenSilently]);

  return (
    <div className="app">
      <ToastContainer stacked style={{ lineHeight: 1.5 }} />
      {/* <a
        href="https://www.patreon.com/collection/1819237"
        target="_blank"
        rel="noopener"
        id="floating-patreon-btn"
        aria-label="Support Me on Patreon"
      >
        <img
          width={20}
          src="https://res.cloudinary.com/dhzmockpa/image/upload/v1745674680/PATREON_SYMBOL_1_BLACK_RGB_trsdty.svg"
          alt="Support Me on Patreon"
        />
      </a> */}
      {!isLoaded ? (
        <div
          className="status"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            width: "100vw",
          }}
        >
          Loading PokéTrivia...
        </div>
      ) : (
        <Router>
          <Navbar userData={userData} isAuthenticated={isAuthenticated} />
          <Suspense
            fallback={
              <div
                className="status"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "90vh",
                  width: "100vw",
                }}
              >
                Loading Application...
              </div>
            }
          >
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    isAuthenticated={isAuthenticated}
                    userData={userData}
                    setUserData={setUserData}
                    userEmail={isAuthenticated ? user.email : null}
                    getAccessTokenSilently={getAccessTokenSilently}
                  />
                }
              />
              <Route
                path="/play-modes"
                element={
                  <PlayModes
                    userData={userData}
                    setUserData={setUserData}
                    getAccessTokenSilently={getAccessTokenSilently}
                  />
                }
              />
              <Route
                path="/pokedex"
                element={
                  <ProtectedRoute>
                    <Pokedex
                      userData={userData}
                      setUserData={setUserData}
                      getAccessTokenSilently={getAccessTokenSilently}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/play-modes/poke-quiz"
                element={
                  <ProtectedRoute>
                    <PokeQuiz
                      userData={userData}
                      setUserData={setUserData}
                      getAccessTokenSilently={getAccessTokenSilently}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/play-modes/whos-that-pokemon"
                element={
                  <ProtectedRoute>
                    <WhosThatPokemon
                      userData={userData}
                      setUserData={setUserData}
                      getAccessTokenSilently={getAccessTokenSilently}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/play-modes/scramble-surge"
                element={
                  <ProtectedRoute>
                    <ScrambleSurge
                      userData={userData}
                      setUserData={setUserData}
                      getAccessTokenSilently={getAccessTokenSilently}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pokemon-nursery"
                element={
                  <ProtectedRoute>
                    <PokemonNursery
                      userData={userData}
                      setUserData={setUserData}
                      getAccessTokenSilently={getAccessTokenSilently}
                    />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundComponent />} />
            </Routes>
          </Suspense>
        </Router>
      )}
    </div>
  );
}

export default App;
