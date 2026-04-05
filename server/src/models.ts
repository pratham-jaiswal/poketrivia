import { Schema, model } from "mongoose";
import type {
  IUser,
  IPokemon,
  IGameSession,
  IEggPricing,
} from "./custom_types.ts";

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
  // visitedPokeMart: Boolean,
  visitedPokemonNursery: Boolean,
  visitedTrade: Boolean,
  visitedLeaderboards: Boolean,
});

export const User = model<IUser>("User", userSchema);

const pokemonSchema = new Schema<IPokemon>({
  id: Number,
  name: String,
  frontSpriteUrl: String,
  backSpriteUrl: String,
  silhouetteData: String,
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
  userId: { type: String, index: true, required: true },
  type: { type: String, enum: ["fact", "scramble", "image"], required: true },
  questions: [
    {
      questionId: { type: String, required: true },
      correctAnswer: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now, index: true },
  attemptedAt: Date,
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  isCompleted: { type: Boolean, default: false },
});
gameSessionSchema.index({ userId: 1, isCompleted: 1 });

export const GameSession = model<IGameSession>(
  "GameSession",
  gameSessionSchema,
);

const eggPricingSchema = new Schema<IEggPricing>({
  mode: { type: String, unique: true },
  displayName: String,
  description: String,
  category: {
    type: String,
    enum: ["normal", "legendary", "mythical"],
  },
  quantity: Number,
  dialogue: String,

  basePrice: Number,
  discountPercent: Number,
  discountExpiresAt: Date,

  isActive: { type: Boolean, default: true },
});

export const EggPricing = model<IEggPricing>("EggPricing", eggPricingSchema);
