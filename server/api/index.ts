import express, { type Request, type Response } from "express";
import mongoose from "mongoose";
// import cors from "cors";
import dotenv from "dotenv";
import type { GameType, Answer, IPokemon, GameQuestion } from "./custom_types.ts";
import { GameSession, Pokemon, User } from "./models.ts";
import { generateFactQuiz, generateScrambleQuiz, generateImageQuiz } from "./game_utils.ts";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// app.use(
//   cors({
//     origin: `${process.env.ALLOWED_URI}`,
//   }),
// );

if (mongoose.connection.readyState === 0) {
  mongoose.connect(`${process.env.MONGODB_URI}/pokemonDB`, { family: 4 });
}

app.get("/api/pokemons", async (req: Request, res: Response) => {
  try {
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const skip = offset * limit;

    const [pokemons, total] = await Promise.all([
      Pokemon.find(
        {},
        { backSpriteUrl: 0, facts: 0 }, // exclude fields
      )
        .sort({ id: 1 })
        .skip(skip)
        .limit(limit)
        .lean<IPokemon[]>(),

      Pokemon.countDocuments(),
    ]);

    res.json({
      data: pokemons,
      pagination: {
        total,
        offset,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: offset * limit < total,
        hasPrev: offset > 0,
      },
    });
  } catch (error) {
    console.error("Error fetching Pokémon data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/new-user", async (req: Request, res: Response) => {
  const { username, email } = req.body as { username: string; email: string };

  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ error: "Username taken" });

  const user = await User.create({
    username,
    email,
    pokemons: [],
    totalScore: 0,
    weeklyScore: 0,
    monthlyScore: 0,
    pokecoins: 0,
    totalPokemons: 0,
    uniquePokemons: 0,
    visitedPlayModes: false,
    visitedPokedex: false,
    visitedPokeMart: false,
    visitedTrade: false,
    visitedLeaderboards: false,
  });

  res.json({ user });
});

app.get("/api/user", async (req: Request, res: Response) => {
  const email = req.query.email as string;
  const user = await User.findOne({ email });
  res.json({ user });
});

app.post("/api/game/start", async (req: Request, res: Response) => {
  const { type, userId } = req.body as { type: GameType; userId: string };

  let generated: GameQuestion[];

  if (type === "fact") generated = await generateFactQuiz();
  else if (type === "scramble") generated = await generateScrambleQuiz();
  else if (type === "image") generated = await generateImageQuiz();
  else return res.status(400).json({ error: "Invalid type" });

  const session = await GameSession.create({
    userId,
    type,
    questions: generated.map((q) => ({
      questionId: q.questionId,
      correctAnswer: q.correctAnswer,
    })),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  res.json({
    sessionId: session._id,
    questions: generated.map((q) => ({
      questionId: q.questionId,
      question: q.question,
      options: q.options,
    })),
  });
});

app.post("/api/game/submit", async (req: Request, res: Response) => {
  const { sessionId, answers, userId } = req.body as {
    sessionId: string;
    answers: Answer[];
    userId: string;
  };

  const session = await GameSession.findById(sessionId);
  if (!session) return res.status(404).json({ error: "Session not found" });
  if (session.isCompleted)
    return res.status(400).json({ error: "Already submitted" });

  let score = 0;
  const map = new Map(answers.map((a) => [a.questionId, a.selected]));

  for (const q of session.questions) {
    if (map.get(q.questionId) === q.correctAnswer) score++;
  }

  const xp = score;
  const coins = score * 2;

  session.isCompleted = true;
  await session.save();

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { totalScore: xp, pokecoins: coins } },
    { new: true },
  );

  res.json({ score, rewards: { xp, coins }, user });
});

app.listen(3000, () => {
  console.log('Server Started');
});