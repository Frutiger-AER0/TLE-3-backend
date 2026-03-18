import express from "express";
import { createAIProfile } from "../hf_ai/youtubeAiProfile.js";
import { generateThemes, getThemes } from "../controllers/ai/theme.js";
import requireAuth from "../middleware/auth.js";



const router = express.Router();

// Endpoint om AI-profiel te genereren
// router.post("/generate-profile", async (req, res) => {
//     try {
//         const userId = req.user.id;
//
//         const result = await createAIProfile(userId);
//
//         res.status(200).json(result);
//     } catch (error) {
//         console.error("Fout bij genereren AI-profiel:", error.message);
//
//         res.status(500).json({
//             error: error.message,
//         });
//     }
// });

// Endpoint om themes te genereren
router.post("/generate", requireAuth,generateThemes);
router.get("/me", requireAuth,getThemes);


export default router;