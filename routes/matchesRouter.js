import express from "express";
import create from "../controllers/minigameMatches/create.js";
import join from "../controllers/minigameMatches/join.js";
import players from "../controllers/minigameMatches/players.js";
import start from "../controllers/minigameMatches/start.js";
import auth from "../middleware/auth.js";



const router = express.Router();

router.post("/", create);
router.post("/join", join);
router.get("/:id/players", players);
router.post("/:id/start", auth, start);

export default router;