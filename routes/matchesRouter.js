import express from "express";
import create from "../controllers/minigameMatches/create.js";
import join from "../controllers/minigameMatches/join.js";
import players from "../controllers/minigameMatches/players.js";
import start from "../controllers/minigameMatches/start.js";
import auth from "../middleware/auth.js";
import guess from "../controllers/minigameMatches/guess.js";
import state from "../controllers/minigameMatches/state.js";

const router = express.Router();

router.post("/", create);
router.post("/join", join);
router.get("/:id/players", players);
router.post("/:id/start", auth, start);
router.post("/:id/guess", guess);
router.get("/:id/state", state)

export default router;