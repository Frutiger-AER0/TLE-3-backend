import db from "../../database.js";
import generateJoinCode from "../../services/minigames/generateJoinCode.js";

export default function create(req, res) {
    const { minigame_id, created_by_user_id } = req.body;
    if (!minigame_id || !created_by_user_id) {
        return res.status(400).json({
            error: "minigame_id and created_by_user_id are required"
        });
    }

    db.query("SELECT id FROM minigames WHERE id = ?",
        [minigame_id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    error: "Minigame not found"
                });
            }

            db.query("SELECT id FROM users WHERE id = ?",
                [created_by_user_id],
                (err, results) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    if (results.length === 0) {
                        return res.status(404).json({
                            error: "User not found"
                        });
                    }
                    const joinCode = generateJoinCode();

                    db.query(`INSERT INTO minigame_matches (minigame_id, status, join_code, created_by_user_id, created_at, ended_at) VALUES (?, ?, ?, ?, NOW(), NOW())`,
                        [minigame_id, "waiting", joinCode, created_by_user_id],
                        (err, result) => {
                            if (err) {
                                return res.status(500).json({ error: err.message });
                            }

                            const matchId = result.insertId;

                            db.query( `INSERT INTO match_users (match_id, user_id, team, is_host, joined_at, left_at) VALUES (?, ?, ?, ?, NOW(), NULL)`,
                                [matchId, created_by_user_id, 1, 1],
                                (err) => {
                                    if (err) {
                                        return res.status(500).json({ error: err.message });
                                    }

                                    return res.status(201).json({message: "Match created", match_id: matchId, join_code: joinCode, status: "waiting"
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
}