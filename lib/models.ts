import { Schema, model, models, Types } from "mongoose";
import type { Document } from "mongoose";

// User Schema
export interface IUserPokemon {
  pokemon: Types.ObjectId;
  count: number;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  pokemons: IUserPokemon[];
  totalScore: number;
  pokecoins: number;
  lastDailyBonus: Date;
  loginStreak: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, index: true },
    pokemons: [
      {
        pokemon: { type: Schema.Types.ObjectId, ref: "Pokemon" },
        count: { type: Number, default: 1 },
      },
    ],
    totalScore: { type: Number, default: 0 },
    pokecoins: { type: Number, default: 0 },
    lastDailyBonus: { type: Date, default: () => new Date(0) },
    loginStreak: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const User = models.User || model<IUser>("User", userSchema);

// Pokemon Schema
export interface IPokemon extends Document {
  id: number;
  name: string;
  frontSpriteUrl?: string;
  backSpriteUrl?: string;
  silhouetteData?: string;
  stats?: any;
  types?: string[];
  facts?: string[];
  isLegendary?: boolean;
  isMythical?: boolean;
}

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
  isLegendary: { type: Boolean, default: false },
  isMythical: { type: Boolean, default: false },
});

export const Pokemon =
  models.Pokemon || model<IPokemon>("Pokemon", pokemonSchema);

// Game Session Schema
export interface IGameSession extends Document {
  _id: Types.ObjectId;
  userId: string;
  type: "fact" | "scramble" | "image";
  questions: {
    questionId: string;
    correctAnswer: string;
  }[];
  createdAt: Date;
  attemptedAt?: Date;
  expiresAt: Date;
  isCompleted: boolean;
}

const gameSessionSchema = new Schema<IGameSession>(
  {
    userId: { type: String, required: true, index: true },
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
  },
  { timestamps: false },
);
gameSessionSchema.index({ userId: 1, isCompleted: 1 });

export const GameSession =
  models.GameSession || model<IGameSession>("GameSession", gameSessionSchema);

// Egg Pricing Schema
export interface IEggPricing extends Document {
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

const eggPricingSchema = new Schema<IEggPricing>({
  mode: { type: String, unique: true, required: true },
  displayName: String,
  description: String,
  category: {
    type: String,
    enum: ["normal", "legendary", "mythical"],
    required: true,
  },
  quantity: Number,
  dialogue: String,
  basePrice: Number,
  discountPercent: Number,
  discountExpiresAt: Date,
  isActive: { type: Boolean, default: true },
});

export const EggPricing =
  models.EggPricing || model<IEggPricing>("EggPricing", eggPricingSchema);
