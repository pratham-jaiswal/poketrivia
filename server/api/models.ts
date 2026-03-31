import { Schema, model } from "mongoose";
import type { IUser, IPokemon, IGameSession } from "./custom_types.ts"

const userSchema = new Schema<IUser>({
  username: String,
  email: String,
  pokemons: [
    {
      pokemon: { type: Schema.Types.ObjectId, ref: "Pokemon" },
      count: Number,
    },
  ],
  totalScore: Number,
  weeklyScore: Number,
  monthlyScore: Number,
  pokecoins: Number,
  totalPokemons: Number,
  uniquePokemons: Number,
  visitedPlayModes: Boolean,
  visitedPokedex: Boolean,
  visitedPokeMart: Boolean,
  visitedTrade: Boolean,
  visitedLeaderboards: Boolean,
});

export const User = model<IUser>("User", userSchema);

const pokemonSchema = new Schema<IPokemon>({
  id: Number,
  name: String,
  frontSpriteUrl: String,
  backSpriteUrl: String,
  stats: {
    hp: Number,
    atk: Number,
    def: Number,
    splAtk: Number,
    splDef: Number,
    speed: Number,
  },
  types: [String],
  facts: [String],
  isLegendary: Boolean,
  isMythical: Boolean,
});

export const Pokemon = model<IPokemon>("Pokemon", pokemonSchema);

const gameSessionSchema = new Schema<IGameSession>({
  userId: String,
  type: { type: String, enum: ["fact", "scramble", "image"] },
  questions: [
    {
      questionId: String,
      correctAnswer: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, index: { expires: 0 } },
  isCompleted: { type: Boolean, default: false },
});

export const GameSession = model<IGameSession>("GameSession", gameSessionSchema);