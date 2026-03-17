import db from "../../database.js";
import { createGalgjeMatch } from "../../services/minigames/galgjeService.js";

export default function start(req, res) {
    const { id } = req.params;
    const user_id = req.user.id;

    db.query("SELECT * FROM minigame_matches WHERE id = ?",
        [id],
        (err, matchResults) => {
            if (err) return res.status(500).json({ error: err.message });
            if (matchResults.length === 0) {
                return res.status(404).json({ error: "Match not found" });
            }

            const match = matchResults[0];
            if (Number(match.created_by_user_id) !== Number(user_id)) {
                return res.status(403).json({
                    error: "Only host can start the match"
                });
            }
            if (match.status !== "waiting") {
                return res.status(400).json({
                    error: "Match already started"
                });
            }

            db.query("SELECT user_id FROM match_users WHERE match_id = ?",
                [id],
                (err, playersResults) => {
                    if (err) return res.status(500).json({ error: err.message });
                    const players = playersResults.map(p => Number(p.user_id));
                    const state = createGalgjeMatch(id, match.minigame_id, players);

                    db.query("UPDATE minigame_matches SET status = 'active' WHERE id = ?",
                        [id],
                        (err) => {
                            if (err) return res.status(500).json({ error: err.message });
                            res.json({
                                message: "Match started",
                                state
                            });
                        }
                    );
                }
            );
        }
    );
}