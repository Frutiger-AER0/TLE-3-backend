import db from "../../database.js";

export default function join(req, res) {
    const { join_code, user_id } = req.body;

    if (!join_code || !user_id) {
        return res.status(400).json({
            error: "join_code and user_id are required"
        });
    }

    db.query("SELECT id FROM users WHERE id = ?",
        [user_id],
        (err, userResults) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (userResults.length === 0) {
                return res.status(404).json({
                    error: "User not found"
                });
            }

            db.query(
                "SELECT * FROM minigame_matches WHERE join_code = ? LIMIT 1",
                [join_code],
                (err, matchResults) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    if (matchResults.length === 0) {
                        return res.status(404).json({
                            error: "Match not found"
                        });
                    }

                    const match = matchResults[0];
                    if (match.status !== "waiting") {
                        return res.status(400).json({
                            error: "Match is not open for joining"
                        });
                    }

                    db.query("SELECT * FROM match_users WHERE match_id = ? AND user_id = ?",
                        [match.id, user_id],
                        (err, existingResults) => {
                            if (err) {
                                return res.status(500).json({ error: err.message });
                            }

                            if (existingResults.length > 0) {
                                return res.status(400).json({
                                    error: "User already joined this match"
                                });
                            }

                            db.query(`INSERT INTO match_users(match_id, user_id, team, is_host, joined_at, left_at) VALUES (?, ?, ?, ?, NOW(), NULL)`,
                                [match.id, user_id, 1, 0],
                                (err) => {
                                    if (err) {
                                        return res.status(500).json({ error: err.message });
                                    }

                                    return res.json({
                                        message: "Joined match",
                                        match_id: match.id,
                                        user_id
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