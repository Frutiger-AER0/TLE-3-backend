import db from "../../database.js";

export default function show(req, res) {
    const userId = req.params.id;

    db.query(`SELECT id, username, email, role, language, language_level, family_id, created_at FROM users WHERE id = ?`, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(results[0]);
    });
}