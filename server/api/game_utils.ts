import axios from "axios";
import { Types } from "mongoose";
import sharp from "sharp";
import type { GameQuestion, PokemonLean } from "./custom_types.ts";
import { Pokemon } from "./models.ts";

const shuffle = <T>(arr: T[]): T[] => arr.sort(() => Math.random() - 0.5);

const getRandomElements = <T>(arr: T[], count: number): T[] =>
  shuffle([...arr]).slice(0, count);

export async function generateFactQuiz(count = 20): Promise<GameQuestion[]> {
  const pokemons = (await Pokemon.find(
    {},
    { name: 1, facts: 1 },
  ).lean()) as PokemonLean[];

  const questions: GameQuestion[] = [];

  while (questions.length < count) {
    const p = pokemons[Math.floor(Math.random() * pokemons.length)];
    if (!p.facts?.length) continue;

    const fact = p.facts[Math.floor(Math.random() * p.facts.length)];
    const sanitized = fact.replace(new RegExp(p.name, "gi"), "_____");

    const incorrect = getRandomElements(
      pokemons.filter((x) => x.name !== p.name),
      3,
    ).map((x) => x.name);

    questions.push({
      questionId: new Types.ObjectId().toString(),
      question: sanitized,
      options: shuffle([p.name, ...incorrect]),
      correctAnswer: p.name,
    });
  }

  return questions;
}

export async function generateScrambleQuiz(count = 10): Promise<GameQuestion[]> {
  const pokemons = (await Pokemon.find(
    {},
    { name: 1 },
  ).lean()) as PokemonLean[];

  const questions: GameQuestion[] = [];

  while (questions.length < count) {
    const p = pokemons[Math.floor(Math.random() * pokemons.length)];

    const scrambled = shuffle(p.name.split("")).join("");

    const incorrect = getRandomElements(
      pokemons.filter((x) => x.name !== p.name),
      3,
    ).map((x) => x.name);

    questions.push({
      questionId: new Types.ObjectId().toString(),
      question: scrambled,
      options: shuffle([p.name, ...incorrect]),
      correctAnswer: p.name,
    });
  }

  return questions;
}

export async function generateImageQuiz(count = 10): Promise<GameQuestion[]> {
  const pokemons = (await Pokemon.find(
    {},
    { name: 1, frontSpriteUrl: 1 },
  ).lean()) as PokemonLean[];

  const questions: GameQuestion[] = [];

  while (questions.length < count) {
    const p = pokemons[Math.floor(Math.random() * pokemons.length)];
    if (!p.frontSpriteUrl) continue;

    const img = await axios.get<ArrayBuffer>(p.frontSpriteUrl, {
      responseType: "arraybuffer",
    });

    const silhouette = await sharp(Buffer.from(img.data))
      .grayscale()
      .threshold(50)
      .toBuffer();

    const base64 = `data:image/png;base64,${silhouette.toString("base64")}`;

    const incorrect = getRandomElements(
      pokemons.filter((x) => x.name !== p.name),
      3,
    ).map((x) => x.name);

    questions.push({
      questionId: new Types.ObjectId().toString(),
      question: base64,
      options: shuffle([p.name, ...incorrect]),
      correctAnswer: p.name,
    });
  }

  return questions;
}
