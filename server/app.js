const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(cors({
  origin: rocess.env.ALLOWED_URI
}));


mongoose
  .connect(`${process.env.MONGODB_URI}/pokemonDB`, { family: 4 })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  pokemons: [
    {
      pokemon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pokemon",
      },
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

const User = mongoose.model("User", userSchema);

const pokemonSchema = new mongoose.Schema({
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

const Pokemon = mongoose.model("Pokemon", pokemonSchema);

app.post("/api/new-user", async (req, res) => {
  try {
    const { username, email } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res
        .status(400)
        .json({ error: "Username is already taken by another user" });
    } else {
      const newUser = new User({
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
      await newUser.save();
      res
        .status(200)
        .json({ user: newUser });
    }
  } catch (error) {
    console.error("Error processing username:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/user", async (req, res) => {
  try {
    const userEmail = req.query.email;
    const existingUser = await User.findOne({ email: userEmail });
    res.json({ user: existingUser });
  } catch (error) {
    console.error("Error processing user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/pokemons", async (req, res) => {
  try {
    const allPokemons = await Pokemon.find();
    res.json(allPokemons);
  } catch (error) {
    console.error("Error fetching Pokémon data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/update-user", async (req, res) => {
  try {
    const { email, updates } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { $set: updates },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/update-user-pokemons", async (req, res) => {
  try {
    const { email, pokemonList, cost } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    for (const item of pokemonList) {
      const existingPokemon = user.pokemons.find(p => String(p.pokemon) === item.pokemon);
      if (existingPokemon) {
        existingPokemon.count += item.count;
      } else {
        user.pokemons.push({ pokemon: item.pokemon, count: item.count });
      }
    }

    user.totalPokemons += pokemonList.length;

    const uniquePokemonIds = new Set(user.pokemons.map(p => String(p.pokemon)));
    user.uniquePokemons = uniquePokemonIds.size;

    user.pokecoins -= cost;

    await user.save();

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error updating user's Pokémon data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.listen(3000, () => {
  console.log(`Listening on port 3000`);
});
