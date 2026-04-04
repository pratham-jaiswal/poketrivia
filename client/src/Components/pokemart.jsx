import joy from "../Images/Characters/joy.png";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PokeMart({ userData, setUserData, getAccessTokenSilently }) {
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
    { dialogue: "Welcome to the PokéMart! I'm Nurse Joy." },
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
          `${import.meta.env.VITE_APP_API_URL}/api/pokemart/pricing`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setPricingData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch pricing", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, [getAccessTokenSilently]);

  const handleHatch = async (confirmedPrice = null) => {
    try {
      setHatching(true);
      setErrorMessage("");
      const token = await getAccessTokenSilently();

      const currentSelection = pricingData.find((p) => p.mode === activeMode);
      const priceToSend =
        confirmedPrice !== null ? confirmedPrice : currentSelection?.finalPrice;

      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/pokemart/hatch`,
        {
          userId: userData._id,
          mode: activeMode,
          clientPrice: priceToSend,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
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
      } else {
        setErrorMessage(
          "Oops, it seems something unexpected occurred. Please take a moment to rest while I work on resolving the issue.",
        );
      }
      setHatching(false);
    }
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
        { userId: userData._id, field: "visitedPokeMart" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setUserData(res.data.user);
      handleNextDialogue();
    } catch {
      setErrorMessage("Error updating visit status.");
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

  return (
    <div className="center-container">
      {loading && (
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
      )}
      <div className="professors">
        <img draggable="false" className="joy" src={joy} alt="Joy" />

        {userData.visitedPokeMart ? (
          !hatching ? (
            <div className="home-container">
              {!priceChangedData ? (
                <>
                  <div className="grid-btn-container">
                    {pricingData.map((item) => (
                      <button
                        key={item.mode}
                        className={`mode-btn ${
                          item.category === "legendary"
                            ? "legendary-egg"
                            : item.category === "mythical"
                              ? "mythical-egg"
                              : ""
                        } ${activeMode === item.mode ? "active-btn" : ""}`}
                        onClick={() =>
                          setActiveMode(
                            activeMode === item.mode ? "" : item.mode,
                          )
                        }
                      >
                        {item.displayName} -{" "}
                        {item.finalPrice < item.basePrice && (
                          <small
                            style={{
                              textDecoration: "line-through",
                            }}
                          >
                            {item.basePrice}₱
                          </small>
                        )}{" "}
                        {item.finalPrice}₱{" "}
                      </button>
                    ))}
                  </div>

                  <div className="home-text-container">
                    <p>
                      <span className="joy">JOY: </span>
                      {activeMode
                        ? `${selectedOption?.dialogue}${getDiscountInfo() || ""}`
                        : "Welcome to the PokéMart! How may I assist you today?"}
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
                      Wait! The market prices just shifted. This will now cost{" "}
                      {priceChangedData.newPrice}₱ instead of{" "}
                      {priceChangedData.oldPrice}₱. Would you like to proceed?
                    </p>
                  </div>
                  <div
                    className="grid-btn-container"
                    style={{
                      placeItems: "center"
                    }}
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
          ) : hatchedPokemonList.length === 0 && !errorMessage ? (
            <div className="home-container">
              <div className="home-text-container">
                <p className="dialogue">
                  <span className="joy">JOY: </span>
                  Just a moment! Your eggs are hatching...
                </p>
              </div>
            </div>
          ) : (
            <div className="home-container">
              <div className="grid-btn-container center-grid">
                {hatchedPokemonList.map((pokemon) => (
                  <button
                    key={pokemon._id}
                    className={`mode-btn capitalize ${
                      selectedOption?.category === "legendary"
                        ? "legendary-egg"
                        : selectedOption?.category === "mythical"
                          ? "mythical-egg"
                          : ""
                    }`}
                  >
                    {pokemon.name}
                  </button>
                ))}
              </div>

              <div className="home-text-container">
                <p className="dialogue">
                  <span className="joy">JOY: </span>
                  {hatchedPokemonList.length === 1
                    ? "Congratulations, Trainer! Your Pokémon has hatched! You can now check it out in your Pokédex."
                    : "Congratulations, Trainer! Your Pokémons have hatched! You can now check them out in your Pokédex."}
                </p>
                {errorMessage && (
                  <p className="dialogue">
                    <span className="joy">JOY: </span>
                    {errorMessage}
                  </p>
                )}
              </div>

              <div className="grid-btn-container">
                <button
                  className="home-btn next"
                  onClick={() => {
                    setActiveMode("");
                    setHatching(false);
                    setHatchedPokemonList([]);
                  }}
                >
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
                <span className="joy">JOY: </span>
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

export default PokeMart;
