import db from "../../database.js";

export default function players(req, res) {
    const { id } = req.params;

    db.query(`SELECT mu.id,mu.match_id,mu.user_id,mu.team,mu.is_host,mu.joined_at,mu.left_at,u.username,u.emailFROM match_users muINNER JOIN users u ON mu.user_id = u.idWHERE mu.match_id = ?ORDER BY mu.joined_at ASC`,
        [id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        }
    );
}