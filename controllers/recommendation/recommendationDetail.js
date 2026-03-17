import db from "../../database.js";

export default async function show(req, res) {
    const { id } = req.params;

    db.query(`SELECT id, user_id, minigame_id, quiz_id, recommendation, explanation, confidence_score, response, created_at FROM recommendations WHERE id = ?`,
        [id],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: "Database error",
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            return res.json(results[0]);
        }
    );
}