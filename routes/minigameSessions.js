import express from "express";
import create from "../controllers/minigameSessions/create.js";
import show from "../controllers/minigameSessions/show.js";
import guess from "../controllers/minigameSessions/guess.js";

const router = express.Router();

router.post("/", create);
router.get("/:id", show);
router.post("/:id/guess", guess);

export default router;