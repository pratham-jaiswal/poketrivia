function Card({ pokemon, isOwned }) {
  const typeColors = {
    normal: { bgColor: "#A8A878", textColor: "#FFFFFF" },
    fighting: { bgColor: "#C03028", textColor: "#FFFFFF" },
    flying: { bgColor: "#A890F0", textColor: "#FFFFFF" },
    poison: { bgColor: "#A040A0", textColor: "#FFFFFF" },
    ground: { bgColor: "#E0C068", textColor: "#000000" },
    rock: { bgColor: "#B8A038", textColor: "#000000" },
    bug: { bgColor: "#A8B820", textColor: "#000000" },
    ghost: { bgColor: "#705898", textColor: "#FFFFFF" },
    steel: { bgColor: "#B8B8D0", textColor: "#000000" },
    fire: { bgColor: "#F08030", textColor: "#000000" },
    water: { bgColor: "#6890F0", textColor: "#000000" },
    grass: { bgColor: "#78C850", textColor: "#000000" },
    electric: { bgColor: "#F8D030", textColor: "#000000" },
    psychic: { bgColor: "#F85888", textColor: "#000000" },
    ice: { bgColor: "#98D8D8", textColor: "#000000" },
    dragon: { bgColor: "#7038F8", textColor: "#FFFFFF" },
    dark: { bgColor: "#705848", textColor: "#FFFFFF" },
    fairy: { bgColor: "#EE99AC", textColor: "#000000" },
    unknown: { bgColor: "#FFFFFF", textColor: "#000000" }, // For unknown type
    shadow: { bgColor: "#000000", textColor: "#FFFFFF" }, // For shadow type
  };

  return (
    <div className={`card ${isOwned ? (pokemon.isMythical ? "mythical" : (pokemon.isLegendary ? "legendary" : "")) : "card-unknown"}`}>
      <div className="id">#{pokemon.id}</div>
      <div className="container">
        <div className="pokemon-img">
          {isOwned && (
            <>
              <img src={pokemon.frontSpriteUrl} alt="pokemon" loading="lazy" />
              <img src={pokemon.frontSpriteUrl} alt="pokemon" loading="lazy" />
            </>
          )}
        </div>
      </div>
      <div className="details-container">
        <div className="data">
          <div className="name">{isOwned ? pokemon.name : "???"}</div>
        </div>
        <div className="data">
          {isOwned ? (
            pokemon.types.map((type, index) => (
              <div
                style={{
                  backgroundColor: typeColors[type].bgColor,
                  color: typeColors[type].textColor,
                }}
                className="type"
                key={index}
              >
                {type}
              </div>
            ))
          ) : (
            <div className="type-unknown">???</div>
          )}
        </div>
        <div className="stats-container">
          <div className="stats">
            <div className="title">HP:&nbsp;</div>
            <div className="value">{isOwned ? pokemon.stats.hp : "???"}</div>
          </div>
          <div className="stats">
            <div className="title">Speed:&nbsp;</div>
            <div className="value">{isOwned ? pokemon.stats.speed : "???"}</div>
          </div>
          <div className="stats">
            <div className="title">ATK:&nbsp;</div>
            <div className="value">{isOwned ? pokemon.stats.atk : "???"}</div>
          </div>
          <div className="stats">
            <div className="title">SplATK:&nbsp;</div>
            <div className="value">
              {isOwned ? pokemon.stats.splAtk : "???"}
            </div>
          </div>
          <div className="stats">
            <div className="title">DEF:&nbsp;</div>
            <div className="value">{isOwned ? pokemon.stats.def : "???"}</div>
          </div>
          <div className="stats">
            <div className="title">SplDEF:&nbsp;</div>
            <div className="value">
              {isOwned ? pokemon.stats.splDef : "???"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
