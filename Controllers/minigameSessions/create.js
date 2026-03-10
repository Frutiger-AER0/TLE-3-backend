import db from "../../database.js";
import { createGalgje } from "../../services/minigames/galgjeService.js";

export default function create(req, res) {
    const { minigame_id, user_id } = req.body;

    if (!minigame_id || !user_id) {
        return res.status(400).json({
            error: "minigame_id and user_id are required"
        });
    }

    db.query(
        `INSERT INTO minigame_sessions 
        (minigame_id, user_id, start_time, end_time, duration, score, result, match_id)
        VALUES (?, ?, NOW(), NOW(), NULL, NULL, NULL, NULL)`,
        [minigame_id, user_id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const sessionId = result.insertId;
            const state = createGalgje(sessionId, minigame_id, user_id);

            res.status(201).json({
                message: "Session started",
                state
            });
        }
    );
}