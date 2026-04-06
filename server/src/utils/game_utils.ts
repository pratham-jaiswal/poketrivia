import { Types } from "mongoose";
import type { GameQuestion } from "../custom_types.ts";
import { Pokemon } from "../models.ts";

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const scrambleString = (str: string): string => {
  if (str.length <= 1) return str;

  const arr = str.split("");
  let scrambled = "";

  do {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    scrambled = arr.join("");
  } while (scrambled === str);

  return scrambled;
};

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
    const scrambled = scrambleString(p.name);
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
