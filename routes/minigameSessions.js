import express from "express";
import create from "../Controllers/minigameSessions/create.js";
import show from "../Controllers/minigameSessions/show.js";
import guess from "../Controllers/minigameSessions/guess.js";

const router = express.Router();

router.post("/", create);
router.get("/:id", show);
router.post("/:id/guess", guess);

export default router;