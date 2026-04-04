import joy from "../Images/Characters/joy.png";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PokemonNursery({ userData, setUserData, getAccessTokenSilently }) {
  const navigate = useNavigate();

  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [activeMode, setActiveMode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hatching, setHatching] = useState(false);
  const [hatchedPokemonList, setHatchedPokemonList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pricingData, setPricingData] = useState([]);
  const [priceChangedData, setPriceChangedData] = useState(null);

  const dialogues = [
    { dialogue: "Welcome to the Pokémon Nursery! I'm Nurse Joy." },
    {
      dialogue:
        "Here, you can buy eggs and instantly hatch them with pokécoins.",
    },
    { dialogue: "Would you like to purchase one or more eggs?" },
    { dialogue: "Pokémon are wonderful companions on any journey." },
    { dialogue: "Feel free to browse through the options available." },
    { dialogue: "I'll be here to assist you with any questions you may have." },
  ];

  useEffect(() => {
    setLoading(true);
    setHatchedPokemonList([]);
    const fetchPricing = async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/api/pokemon-nursery/pricing`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setPricingData(res.data.data);
      } catch {
        setErrorMessage("The Nursery list is missing! I'll have it sorted out shortly.");
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, [getAccessTokenSilently]);

  const handleHatch = async (confirmedPrice = null) => {
    const currentSelection = pricingData.find((p) => p.mode === activeMode);
    try {
      setHatching(true);
      setErrorMessage("");
      const token = await getAccessTokenSilently();

      const priceToSend =
        confirmedPrice !== null ? confirmedPrice : currentSelection?.finalPrice;

      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/pokemon-nursery/hatch`,
        {
          userId: userData._id,
          mode: activeMode,
          clientPrice: priceToSend,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setHatchedPokemonList(res.data.hatched);
      setUserData(res.data.user);
      setPriceChangedData(null);
    } catch (err) {
      if (
        err.response?.status === 409 &&
        err.response?.data?.error === "PRICE_CHANGED"
      ) {
        setPriceChangedData({
          newPrice: err.response.data.newPrice,
          oldPrice: pricingData.find((p) => p.mode === activeMode)?.finalPrice,
        });
        setHatching(false);
      } else {
        setErrorMessage(
          err.response?.data?.message ||
            "Oh no! The eggs aren't quite ready to hatch yet. Try again later!",
        );
      }
    }
  };

  const resetNurseryState = () => {
    setActiveMode("");
    setHatching(false);
    setHatchedPokemonList([]);
    setErrorMessage("");
    setPriceChangedData(null);
  };

  const handleNextDialogue = () => {
    if (currentDialogueIndex < dialogues.length - 1) {
      setCurrentDialogueIndex((prev) => prev + 1);
    }
  };

  const handleVisited = async () => {
    try {
      const token = await getAccessTokenSilently();
      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/user/visited`,
        { userId: userData._id, field: "visitedPokemonNursery" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setUserData(res.data.user);
      handleNextDialogue();
    } catch {
      setErrorMessage("Failed to save your visit to the Nursery log!");
    }
  };

  const selectedOption = pricingData.find((p) => p.mode === activeMode);

  const getDiscountInfo = () => {
    if (
      !selectedOption ||
      selectedOption.finalPrice >= selectedOption.basePrice
    )
      return null;
    const expiryDate = new Date(
      selectedOption.discountExpiresAt,
    ).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return ` This is a discounted price (was ${selectedOption.basePrice}₱) available until ${expiryDate}!`;
  };

  if (loading) {
    return (
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
        Loading...
      </div>
    );
  }

  return (
    <div className="center-container">
      <div className="professors">
        <img draggable="false" className="joy" src={joy} alt="Joy" />

        {userData.visitedPokemonNursery ? (
          !hatching && hatchedPokemonList.length === 0 && !errorMessage ? (
            <div className="home-container">
              {!priceChangedData ? (
                <>
                  <div className="grid-btn-container">
                    {pricingData.map((item) => (
                      <button
                        key={item.mode}
                        className={`mode-btn ${item.category === "legendary" ? "legendary-egg" : item.category === "mythical" ? "mythical-egg" : ""} ${activeMode === item.mode ? "active-btn" : ""}`}
                        onClick={() =>
                          setActiveMode(
                            activeMode === item.mode ? "" : item.mode,
                          )
                        }
                      >
                        {item.displayName} -{" "}
                        {item.finalPrice < item.basePrice && (
                          <small style={{ textDecoration: "line-through" }}>
                            {item.basePrice}₱
                          </small>
                        )}{" "}
                        {item.finalPrice}₱
                      </button>
                    ))}
                  </div>
                  <div className="home-text-container">
                    <p>
                      <span className="joy">JOY: </span>
                      {pricingData.length > 0
                        ? activeMode
                          ? `${selectedOption?.dialogue}${getDiscountInfo() || ""}`
                          : "Welcome to the Pokémon Nursery! How may I assist you today?"
                        : "Oh my! It seems the Incubator is out of order. Check back soon!"}
                    </p>
                  </div>
                  {activeMode && (
                    <button
                      className="home-btn next-sm"
                      onClick={() => handleHatch()}
                      disabled={userData.pokecoins < selectedOption?.finalPrice}
                    >
                      Hatch
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="home-text-container">
                    <p className="dialogue">
                      <span className="joy">JOY: </span>
                      Wait! The prices just shifted to{" "}
                      {priceChangedData.newPrice}₱. Proceed?
                    </p>
                  </div>
                  <div
                    className="grid-btn-container"
                    style={{ placeItems: "center" }}
                  >
                    <button
                      className="home-btn next-sm"
                      onClick={() => handleHatch(priceChangedData.newPrice)}
                      disabled={userData.pokecoins < priceChangedData.newPrice}
                    >
                      Confirm
                    </button>
                    <button
                      className="home-btn next-sm"
                      onClick={() => setPriceChangedData(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : errorMessage ? (
            <div className="home-container">
              <div className="home-text-container">
                <p className="dialogue">
                  <span className="joy">JOY: </span> {errorMessage}
                </p>
              </div>
              <button className="home-btn next-sm" onClick={() => pricingData.length > 0 ? resetNurseryState() : navigate("/")}>
                {pricingData.length > 0 ? "Back to Nursery" : "Go Back" }
              </button>
            </div>
          ) : hatchedPokemonList.length === 0 ? (
            <div className="home-container">
              <div className="home-text-container">
                <p className="dialogue">
                  <span className="joy">JOY: </span> Just a moment! Your eggs
                  are hatching...
                </p>
              </div>
            </div>
          ) : (
            <div className="home-container">
              <div className="grid-btn-container center-grid">
                {hatchedPokemonList.map((pokemon) => (
                  <button
                    key={pokemon._id}
                    className={`mode-btn capitalize ${selectedOption?.category === "legendary" ? "legendary-egg" : selectedOption?.category === "mythical" ? "mythical-egg" : ""}`}
                  >
                    {pokemon.name}
                  </button>
                ))}
              </div>
              <div className="home-text-container">
                <p className="dialogue">
                  <span className="joy">JOY: </span>
                  Congratulations! Your{" "}
                  {hatchedPokemonList.length === 1
                    ? "Pokémon has"
                    : "Pokémons have"}{" "}
                  hatched! Check them in your Pokédex.
                </p>
              </div>
              <div className="grid-btn-container">
                <button className="home-btn next" onClick={resetNurseryState}>
                  Shop More
                </button>
                <button
                  className="home-btn next btn-container"
                  onClick={() => navigate("/")}
                >
                  Leave
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="home-container">
            <div className="home-text-container">
              <p className="dialogue">
                <span className="joy">JOY: </span>{" "}
                {dialogues[currentDialogueIndex].dialogue}
              </p>
            </div>
            {currentDialogueIndex < dialogues.length - 1 ? (
              <button className="home-btn next-sm" onClick={handleNextDialogue}>
                Next
              </button>
            ) : (
              <button className="home-btn next-sm" onClick={handleVisited}>
                Start Shopping
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PokemonNursery;
