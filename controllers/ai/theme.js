import { generateThemesForUser, getThemesForUser } from "../../hf_ai/themeGenerate.js";
import db from "../../database.js";

export function generateThemes(req, res) {
    const userId = req.user.id;

    generateThemesForUser(userId, (err, themes) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
            });
        }

        res.json({
            message: "Themes gegenereerd",
            themes,
        });
    });
}

export function getThemes(req, res) {
    const userId = req.user.id;

    getThemesForUser(userId, (err, themes) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
            });
        }

        if (!themes) {
            return res.status(404).json({
                error: "Geen themes gevonden",
            });
        }

        res.json(themes);
    });
}

// export async function generateThemes(req, res) {
//     try {
//         const userId = req.user.id;
//
//         const themes = await generateThemesForUser(userId);
//
//         res.json({
//             message: "Themes gegenereerd",
//             themes,
//         });
//     } catch (error) {
//         res.status(500).json({
//             error: error.message,
//         });
//     }
// }

// export async function getThemes(req, res) {
//     try {
//         const userId = req.user.id;
//
//         const themes = await getThemesForUser(userId);
//
//         if (!themes) {
//             return res.status(404).json({
//                 error: "Geen themes gevonden",
//             });
//         }
//
//         res.json(themes);
//     } catch (error) {
//         res.status(500).json({
//             error: error.message,
//         });
//     }
// }