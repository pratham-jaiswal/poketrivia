import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { auth } from "express-oauth2-jwt-bearer";
import type {
  GameType,
  Answer,
  IPokemon,
  GameQuestion,
  IUser,
} from "./custom_types.ts";
import { EggPricing, GameSession, Pokemon, User } from "./models.ts";
import {
  generateFactQuiz,
  generateScrambleQuiz,
  generateImageQuiz,
} from "./utils/game_utils.ts";
import { calculateFinalPrice } from "./utils/pricing_util.ts";
import { AppError } from "./utils/AppError.ts";
import { catchAsync } from "./utils/catchAsync.ts";
import { globalErrorHandler } from "./middleware/errorHandler.ts";
import { currentUser } from "./middleware/currentUser.ts";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  cors({
    origin: process.env.ALLOWED_URI,
  }),
);

const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
  tokenSigningAlg: process.env.AUTH0_TOKEN_SIGN_ALGO,
});

app.use(jwtCheck);
app.use(currentUser);

if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(`${process.env.MONGODB_URI}/pokemonDB`, { family: 4 })
    .then(() => {
      console.log("DB connection successful!");
      const PORT = process.env.PORT || 8081;
      app.listen(PORT, () => {
        console.log(`[SERVER] Running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("DB Connection Error: ", err);
      process.exit(1);
    });
}

app.get(
  "/api/pokemons",
  catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;

    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const view = (req.query.view as string) || "all";
    const category = (req.query.category as string) || "all";

    let query: any = {};
    if (category === "legendary") query.isLegendary = true;
    if (category === "mythical") query.isMythical = true;

    const ownedIds = user.pokemons.map((p) => p.pokemon.toString());
    const ownedSet = new Set(ownedIds);

    if (view === "owned") {
      query._id = { $in: ownedIds };
    }

    const [pokemons, total] = await Promise.all([
      Pokemon.find(query, { backSpriteUrl: 0, facts: 0 })
        .sort({ id: 1 })
        .skip(offset * limit)
        .limit(limit)
        .lean<IPokemon[]>(),
      Pokemon.countDocuments(query),
    ]);

    const enriched = pokemons.map((p) => {
      const isOwned = ownedSet.has(p._id.toString());

      if (!isOwned) {
        return {
          _id: p._id,
          id: p.id,
          silhouetteData: p.silhouetteData,
          isOwned: false,
        };
      }

      return { ...p, isOwned: true };
    });

    res.status(200).json({
      data: enriched,
      pagination: {
        total,
        offset,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: (offset + 1) * limit < total,
        hasPrev: offset > 0,
      },
    });
  }),
);

app.post(
  "/api/new-user",
  catchAsync(async (req: Request, res: Response) => {
    const claims = req.auth?.payload;
    const email = claims?.["user_email"] as string;
    if (!email)
      throw new AppError("Authentication token missing user email.", 401);

    const { username } = req.body as { username: string };

    const existing = await User.findOne({ username });
    if (existing) throw new AppError("Username taken.", 400);

    const user = await User.create({
      username,
      email,
      pokemons: [],
      totalScore: 0,
      pokecoins: 0,
      totalPokemons: 0,
      uniquePokemons: 0,
      visitedPlayModes: false,
      // visitedPokedex: false,
      // visitedPokeMart: false,
      visitedPokemonNursery: false,
      // visitedTrade: false,
      // visitedLeaderboards: false,
      lastDailyBonus: new Date().setHours(0, 0, 0, 0),
    });

    res.status(200).json({ user });
  }),
);

app.get(
  "/api/user",

  catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;
    res.status(200).json({ user });
  }),
);

app.post(
  "/api/game/start",
  catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;
    const userId = String(user._id);

    const { type } = req.body as { type: GameType };

    const recent = await GameSession.findOne({
      userId,
      createdAt: { $gt: new Date(Date.now() - 5000) }, // 5s
    });

    if (recent) throw new AppError("Too many requests", 429);

    await GameSession.updateMany(
      { userId, isCompleted: false },
      { $set: { isCompleted: true } },
    );

    let generated: GameQuestion[];

    if (type === "fact") generated = await generateFactQuiz();
    else if (type === "scramble") generated = await generateScrambleQuiz();
    else if (type === "image") generated = await generateImageQuiz();
    else throw new AppError("Invalid game", 400);

    const session = await GameSession.create({
      userId,
      type,
      questions: generated.map((q) => ({
        questionId: q.questionId,
        correctAnswer: q.correctAnswer,
      })),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 60mins
    });

    res.status(200).json({
      sessionId: session._id,
      questions: generated.map((q) => ({
        questionId: q.questionId,
        question: q.question,
        options: q.options,
      })),
    });
  }),
);

app.post(
  "/api/game/submit",
  catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;

    const { sessionId, answers } = req.body as {
      sessionId: string;
      answers: Answer[];
    };

    const userId = String(user._id);

    const session = await GameSession.findById(sessionId);
    if (!session) throw new AppError("User account no longer exists.", 404);
    if (session.expiresAt < new Date())
      throw new AppError("Session expired.", 400);
    if (session.isCompleted)
      throw new AppError("This session has already been submitted.", 400);

    if (session.userId.toString() !== userId)
      throw new AppError(
        "You do not have permission to submit this session.",
        403,
      );

    if (!answers || answers.length !== session.questions.length)
      throw new AppError("Invalid session", 403);

    if (Date.now() - new Date(session.createdAt).getTime() < 3000)
      throw new AppError("Too many requests", 429);

    let score = 0;
    const map = new Map(answers.map((a) => [a.questionId, a.selected]));

    for (const q of session.questions) {
      if (map.get(q.questionId) === q.correctAnswer) score++;
    }

    let xp = 0;
    let coins = 0;

    if (session.type === "fact") {
      xp = score;
      coins = score * 2;
    } else if (session.type === "scramble") {
      xp = score;
      coins = score * 2;
    } else if (session.type === "image") {
      xp = score * 2;
      coins = score * 4;
    }
    session.attemptedAt = new Date();
    session.isCompleted = true;
    await session.save();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { totalScore: xp, pokecoins: coins } },
      { returnDocument: "after" },
    );

    res.status(200).json({ score, rewards: { xp, coins }, user: updatedUser });
  }),
);

app.post(
  "/api/user/visited",
  catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;
    const userId = String(user._id);

    const { field } = req.body as {
      field: keyof IUser;
    };

    // whitelist allowed fields
    const allowedFields = [
      "visitedPlayModes",
      // "visitedPokedex",
      // "visitedPokeMart",
      "visitedPokemonNursery",
      // "visitedTrade",
      // "visitedLeaderboards",
    ];

    if (!allowedFields.includes(field))
      throw new AppError("Invalid field", 400);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { [field]: true } },
      { returnDocument: "after" },
    );

    if (!updatedUser) throw new AppError("User account no longer exists.", 404);

    res.status(200).json({ user });
  }),
);

app.get(
  "/api/pokemon-nursery/pricing",
  catchAsync(async (req, res) => {
    const list = await EggPricing.find({ isActive: true }).lean();

    const data = list.map((item) => {
      const { finalPrice, isDiscountValid } = calculateFinalPrice(item);

      return {
        mode: item.mode,
        displayName: item.displayName,
        description: item.description,
        category: item.category,
        quantity: item.quantity,
        dialogue: item.dialogue,

        basePrice: item.basePrice,
        finalPrice,
        discountPercent: isDiscountValid ? item.discountPercent : null,
        discountExpiresAt: item.discountExpiresAt,
      };
    });

    res.status(200).json({ data });
  }),
);

app.post(
  "/api/pokemon-nursery/hatch",
  catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;
    if (!user) throw new AppError("User account no longer exists.", 404);
    const userId = String(user._id);

    const { mode, clientPrice } = req.body as {
      mode: string;
      clientPrice: number;
    };

    const eggsData = await EggPricing.findOne({
      mode,
      isActive: true,
    }).lean();
    if (!eggsData)
      throw new AppError("Selected item is currently unavailable.", 400);

    const { finalPrice } = calculateFinalPrice(eggsData);

    if (clientPrice !== finalPrice) {
      const error: any = new AppError(
        "Price has updated. Please review before hatching.",
        409,
        { newPrice: finalPrice, code: "PRICE_MISMATCH" },
      );
      throw error;
    }

    const poolQuery: any = {
      isLegendary: eggsData.category === "legendary",
      isMythical: eggsData.category === "mythical",
    };

    const ownedIds = user.pokemons.map((p) => p.pokemon);

    const selected = await Pokemon.aggregate([
      {
        $match: {
          ...poolQuery,
          _id: { $nin: ownedIds },
        },
      },
      { $sample: { size: eggsData.quantity } },
      { $project: { _id: 1, name: 1 } },
    ]);

    if (selected.length < eggsData.quantity) {
      const message =
        selected.length === 0
          ? "No new Pokémon left to hatch in this category!"
          : `Not enough new Pokémon left (Need ${eggsData.quantity}, but only ${selected.length} available).`;

      throw new AppError(message, 400);
    }

    const updates = selected.map((p) => ({
      pokemon: p._id,
      count: 1,
    }));

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        pokecoins: { $gte: finalPrice },
      },
      {
        $inc: { pokecoins: -finalPrice },
        $push: { pokemons: { $each: updates } },
      },
      { returnDocument: "after" },
    );

    if (!updatedUser)
      throw new AppError("Insufficient Pokecoins for this hatch.", 402);

    res.status(200).json({
      hatched: selected,
      user: updatedUser,
    });
  }),
);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
