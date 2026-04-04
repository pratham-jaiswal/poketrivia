import { Types, type HydratedDocument } from "mongoose";

export type GameType = "fact" | "scramble" | "image";

export type Answer = {
  questionId: string;
  selected: string;
};

export type PokemonLean = {
  name: string;
  facts?: string[];
  frontSpriteUrl?: string;
};

export interface IUserPokemon {
  pokemon: Types.ObjectId;
  count: number;
}

export interface IUser {
  username: string;
  email: string;
  pokemons: IUserPokemon[];
  totalScore: number;
  weeklyScore: number;
  monthlyScore: number;
  pokecoins: number;
  totalPokemons: number;
  uniquePokemons: number;
  visitedPlayModes: boolean;
  visitedPokedex: boolean;
  // visitedPokeMart: boolean;
  visitedPokemonNursery: boolean;
  visitedTrade: boolean;
  visitedLeaderboards: boolean;
}

export type UserDoc = HydratedDocument<IUser>;

export interface IPokemon {
  _id: Types.ObjectId; 
  id: number;
  name: string;
  frontSpriteUrl: string;
  backSpriteUrl: string;
  stats: {
    hp: number;
    atk: number;
    def: number;
    splAtk: number;
    splDef: number;
    speed: number;
  };
  types: string[];
  facts: string[];
  isLegendary: boolean;
  isMythical: boolean;
}

export interface IGameSession {
  userId: string;
  type: GameType;
  questions: {
    questionId: string;
    correctAnswer: string;
  }[];
  createdAt: Date;
  attemptedAt: Date;
  expiresAt: Date;
  isCompleted: boolean;
}

export type GameSessionDoc = HydratedDocument<IGameSession>;

export type GameQuestion = {
  questionId: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

export interface IEggPricing {
  mode: string;
  displayName: string;
  description: string;
  category: "normal" | "legendary" | "mythical";
  quantity: number;
  dialogue: string;

  basePrice: number;
  discountPercent?: number;
  discountExpiresAt?: Date;

  isActive: boolean;
}