export type PokemonTypeName =
  | "normal"
  | "fighting"
  | "flying"
  | "poison"
  | "ground"
  | "rock"
  | "bug"
  | "ghost"
  | "steel"
  | "fire"
  | "water"
  | "grass"
  | "electric"
  | "psychic"
  | "ice"
  | "dragon"
  | "dark"
  | "fairy"
  | "unknown"
  | "shadow";

type TypeBadgeStyle = {
  backgroundColor: string;
  color: string;
};

const TYPE_BADGE_STYLES: Record<PokemonTypeName, TypeBadgeStyle> = {
  normal: { backgroundColor: "#A8A878", color: "#FFFFFF" },
  fighting: { backgroundColor: "#C03028", color: "#FFFFFF" },
  flying: { backgroundColor: "#A890F0", color: "#FFFFFF" },
  poison: { backgroundColor: "#A040A0", color: "#FFFFFF" },
  ground: { backgroundColor: "#E0C068", color: "#000000" },
  rock: { backgroundColor: "#B8A038", color: "#000000" },
  bug: { backgroundColor: "#A8B820", color: "#000000" },
  ghost: { backgroundColor: "#705898", color: "#FFFFFF" },
  steel: { backgroundColor: "#B8B8D0", color: "#000000" },
  fire: { backgroundColor: "#F08030", color: "#000000" },
  water: { backgroundColor: "#6890F0", color: "#000000" },
  grass: { backgroundColor: "#78C850", color: "#000000" },
  electric: { backgroundColor: "#F8D030", color: "#000000" },
  psychic: { backgroundColor: "#F85888", color: "#000000" },
  ice: { backgroundColor: "#98D8D8", color: "#000000" },
  dragon: { backgroundColor: "#7038F8", color: "#FFFFFF" },
  dark: { backgroundColor: "#705848", color: "#FFFFFF" },
  fairy: { backgroundColor: "#EE99AC", color: "#000000" },
  unknown: { backgroundColor: "#FFFFFF", color: "#000000" },
  shadow: { backgroundColor: "#000000", color: "#FFFFFF" },
};

export const getPokemonTypeBadgeStyle = (value: string) => {
  const normalized = value.toLowerCase() as PokemonTypeName;
  return TYPE_BADGE_STYLES[normalized] ?? TYPE_BADGE_STYLES.unknown;
};

