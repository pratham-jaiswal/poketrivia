import axios from "axios";
import { Types } from "mongoose";
import sharp from "sharp";
import type { GameQuestion, PokemonLean } from "../custom_types.ts";
import { Pokemon } from "../models.ts";

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

export async function generateFactQuiz(count = 20): Promise<GameQuestion[]> {
  const selection = await Pokemon.aggregate([
    { $match: { facts: { $exists: true, $not: { $size: 0 } } } },
    { $sample: { size: count } },
    { $project: { name: 1, facts: 1 } },
  ]);

  const distractorPool = await Pokemon.aggregate([
    { $sample: { size: count * 3 } },
    { $project: { name: 1, _id: 0 } },
  ]);

  return selection.map((p, i) => {
    const fact = p.facts[Math.floor(Math.random() * p.facts.length)];
    const sanitized = fact.replace(new RegExp(p.name, "gi"), "_____");

    const incorrect = distractorPool.slice(i * 3, i * 3 + 3).map((d) => d.name);

    return {
      questionId: new Types.ObjectId().toString(),
      question: sanitized,
      options: shuffle([p.name, ...incorrect]),
      correctAnswer: p.name,
    };
  });
}

export async function generateScrambleQuiz(
  count = 10,
): Promise<GameQuestion[]> {
  const selection = await Pokemon.aggregate([
    { $sample: { size: count } },
    { $project: { name: 1 } },
  ]);

  const distractorPool = await Pokemon.aggregate([
    { $sample: { size: count * 3 } },
    { $project: { name: 1, _id: 0 } },
  ]);

  return selection.map((p, i) => {
    const scrambled = shuffle(p.name.split("")).join("");
    const incorrect = distractorPool.slice(i * 3, i * 3 + 3).map((d) => d.name);

    return {
      questionId: new Types.ObjectId().toString(),
      question: scrambled,
      options: shuffle([p.name, ...incorrect]),
      correctAnswer: p.name,
    };
  });
}

export async function generateImageQuiz(count = 10): Promise<GameQuestion[]> {
  const selection = await Pokemon.aggregate([
    { $match: { silhouetteData: { $exists: true, $ne: null } } },
    { $sample: { size: count } },
    { $project: { name: 1, silhouetteData: 1 } },
  ]);

  const distractorPool = await Pokemon.aggregate([
    { $sample: { size: count * 3 } },
    { $project: { name: 1, _id: 0 } },
  ]);

  return selection.map((p, i) => {
    const incorrect = distractorPool
      .slice(i * 3, i * 3 + 3)
      .map((d) => d.name)
      .filter((name) => name !== p.name);

    while (incorrect.length < 3) {
      incorrect.push("Missingno");
    }

    return {
      questionId: new Types.ObjectId().toString(),
      question: p.silhouetteData,
      options: shuffle([p.name, ...incorrect]),
      correctAnswer: p.name,
    };
  });
}
