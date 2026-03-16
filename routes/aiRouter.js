import express from "express";
import { db } from "../database.js";
import { createAIProfile } from "hugging_face_ai/youtubeAiProfile.js";
import { generateThemes, getThemes } from "/controllers/ai/theme.js";


const router = express.Router();

// Endpoint om AI-profiel te genereren
router.post("/generate-profile", async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await createAIProfile(userId);

        res.status(200).json(result);
    } catch (error) {
        console.error("Fout bij genereren AI-profiel:", error.message);

        res.status(500).json({
            error: error.message,
        });
    }
});

// Endpoint om themes te genereren
router.post("/generate", generateThemes);
router.get("/me", getThemes);


export default router;