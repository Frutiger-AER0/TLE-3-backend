import { generateThemesForUser, getThemesForUser } from "hugging_face_ai/themeGenerate.js";

export async function generateThemes(req, res) {
    try {
        const userId = req.user.id;

        const themes = await generateThemesForUser(userId);

        res.json({
            message: "Themes gegenereerd",
            themes,
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
}

export async function getThemes(req, res) {
    try {
        const userId = req.user.id;

        const themes = await getThemesForUser(userId);

        if (!themes) {
            return res.status(404).json({
                error: "Geen themes gevonden",
            });
        }

        res.json(themes);
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
}