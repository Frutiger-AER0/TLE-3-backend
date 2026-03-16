import axios from "axios";
import { InferenceClient } from "@huggingface/inference";
import { db } from "../database.js";

// CONFIG

const HF_TOKEN = process.env.HF_TOKEN;
const hf = new InferenceClient(HF_TOKEN);

// 1. Haal YouTube token op
async function getYoutubeToken(userId) {
    const [rows] = await db.query(
        `
            SELECT access_token
            FROM youtube_tokens
            WHERE user_id = ?
                LIMIT 1
        `,
        [userId]
    );

    if (rows.length === 0) {
        throw new Error("Geen YouTube token gevonden voor deze gebruiker.");
    }

    return rows[0].access_token;
}

// 2. Haal watch history op
async function getWatchHistory(accessToken) {
    const playlistsResponse = await axios.get(
        "https://www.googleapis.com/youtube/v3/playlists",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                part: "snippet,contentDetails",
                mine: true,
                maxResults: 50,
            },
        }
    );

    const playlists = playlistsResponse.data.items || [];

    const historyPlaylist = playlists.find((playlist) => {
        const title = playlist?.snippet?.title?.toLowerCase() || "";
        return title.includes("watch history") || title.includes("kijkgeschiedenis");
    });

    if (!historyPlaylist) {
        throw new Error(
            "Watch history playlist niet gevonden. Controleer de YouTube-scope en accounttoegang."
        );
    }

    const playlistId = historyPlaylist.id;

    const historyResponse = await axios.get(
        "https://www.googleapis.com/youtube/v3/playlistItems",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                part: "snippet,contentDetails",
                playlistId,
                maxResults: 20,
            },
        }
    );

    const items = historyResponse.data.items || [];

    return items.map((item) => ({
        videoId: item?.contentDetails?.videoId || null,
        title: item?.snippet?.title || "Onbekende titel",
        channel: item?.snippet?.videoOwnerChannelTitle || "Onbekend kanaal",
        publishedAt: item?.contentDetails?.videoPublishedAt || null,
    }));
}

// Analyseer met AI
async function analyzeWithAI(watchHistory) {
    if (!watchHistory || watchHistory.length === 0) {
        return {
            likes: "Geen duidelijke interesses gevonden",
            watch_history: "Geen watch history beschikbaar",
            overview: "Er was geen watch history beschikbaar om te analyseren.",
        };
    }

    const prompt = `
You are analyzing a user's YouTube watch history.

Watch history:
${JSON.stringify(watchHistory, null, 2)}

Return ONLY valid JSON in this exact structure:
{
  "likes": "short comma-separated interests",
  "watch_history": "short summary of viewing behavior",
  "overview": "short user profile overview"
}
`;

    const result = await hf.textGeneration({
        model: "CohereLabs/tiny-aya-water",
        inputs: prompt,
        max_new_tokens: 250,
    });

    const rawText = result.generated_text || "";

    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
        return {
            likes: "Analyse mislukt",
            watch_history: "Analyse mislukt",
            overview: rawText.trim() || "Geen bruikbare AI-output ontvangen.",
        };
    }

    const jsonText = rawText.slice(firstBrace, lastBrace + 1);

    try {
        const parsed = JSON.parse(jsonText);

        return {
            likes: parsed.likes || "Onbekend",
            watch_history: parsed.watch_history || "Onbekend",
            overview: parsed.overview || "Onbekend",
        };
    } catch (error) {
        return {
            likes: "Analyse gedeeltelijk mislukt",
            watch_history: "Analyse gedeeltelijk mislukt",
            overview: rawText.trim() || "JSON kon niet worden gelezen.",
        };
    }
}

// 4. Sla profiel op
async function saveAIProfile(userId, aiData, originalWatchHistory) {
    await db.query(
        `
    INSERT INTO ai_profiles (
      user_id,
      likes,
      watch_history,
      overview,
      timestamp
    )
    VALUES (?, ?, ?, ?, NOW())
    `,
        [
            userId,
            aiData.likes,
            JSON.stringify({
                summary: aiData.watch_history,
                raw: originalWatchHistory,
            }),
            aiData.overview,
        ]
    );
}

// 5. Complete pipeline
export async function createAIProfile(userId) {
    const accessToken = await getYoutubeToken(userId);
    const watchHistory = await getWatchHistory(accessToken);
    const aiData = await analyzeWithAI(watchHistory);

    await saveAIProfile(userId, aiData, watchHistory);

    return {
        message: "AI-profiel succesvol aangemaakt.",
        userId,
        aiData,
        watchHistoryCount: watchHistory.length,
    };
}

export default createAIProfile;