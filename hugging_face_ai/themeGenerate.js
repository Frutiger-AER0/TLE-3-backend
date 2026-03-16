import dotenv from "dotenv";
import db from "../database.js";
import { InferenceClient } from "@huggingface/inference";

const hf = new InferenceClient(process.env.HF_TOKEN);
dotenv.config();

// THEMA'S GENEREREN
async function generateThemesFromProfile(profile) {
    const prompt = `
Je bent een assistent die gebruikersinteresses omzet naar thema's.

Analyseer het volgende ai_profile en geef ALLEEN geldige JSON terug.

Gebruik exact deze keys:
movie, movie_genre, artist, food, place, music, music_genre, holiday_country, clothing_style, animal, color

Regels:
- Geef alleen JSON terug
- Geen uitleg
- Geen markdown
- Gebruik null als je iets niet weet

AI_PROFILE:
${JSON.stringify(profile)}
`;

    const result = await hf.chatCompletion({
        model: "CohereLabs/tiny-aya-water",
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        max_tokens: 300,
        temperature: 0.6,
    });

    const content = result.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("Geen antwoord van Hugging Face.");
    }

    try {
        return JSON.parse(content);
    } catch {
        throw new Error("AI gaf geen geldige JSON terug.");
    }
}

/*
    AI PROFILE OPHALEN
*/
async function getAiProfile(userId) {
    const [rows] = await db.query(
        `SELECT *
     FROM ai_profiles
     WHERE user_id = ?
     LIMIT 1`,
        [userId]
    );

    return rows[0] || null;
}

// THEMES OPSLAAN
async function saveThemes(profileId, themes) {
    const [existing] = await db.query(
        `SELECT id FROM themes WHERE profile_id = ?`,
        [profileId]
    );

    if (existing.length > 0) {
        await db.query(
            `UPDATE themes SET movie = ?, movie_genre = ?, artist = ?, food = ?, place = ?, music = ?, music_genre = ?, holiday_country = ?, clothing_style = ?, animal = ?, color = ?, timestamp = NOW() WHERE profile_id = ?`,
            [
                themes.movie,
                themes.movie_genre,
                themes.artist,
                themes.food,
                themes.place,
                themes.music,
                themes.music_genre,
                themes.holiday_country,
                themes.clothing_style,
                themes.animal,
                themes.color,
                profileId,
            ]
        );

        return "updated";
    }

    await db.query(
        `INSERT INTO themes (profile_id, movie, movie_genre, artist, food, place, music, music_genre, holiday_country, clothing_style, animal, color, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
            profileId,
            themes.movie,
            themes.movie_genre,
            themes.artist,
            themes.food,
            themes.place,
            themes.music,
            themes.music_genre,
            themes.holiday_country,
            themes.clothing_style,
            themes.animal,
            themes.color,
        ]
    );

    return "inserted";
}

export async function generateThemesForUser(userId) {
    const profile = await getAiProfile(userId);

    if (!profile) {
        throw new Error("Geen ai_profile gevonden.");
    }

    const themes = await generateThemesFromProfile(profile);

    await saveThemes(profile.id, themes);

    return themes;
}

// THEMES OPHALEN
export async function getThemesForUser(userId) {
    const profile = await getAiProfile(userId);

    if (!profile) {
        return null;
    }

    const [rows] = await db.query(
        `SELECT *
     FROM themes
     WHERE profile_id = ?
     LIMIT 1`,
        [profile.id]
    );

    return rows[0] || null;
}