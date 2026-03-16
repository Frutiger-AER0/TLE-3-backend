import db from "../../database.js";

export default function show(req, res) {
    const { id } = req.params;

    db.query("SELECT * FROM families WHERE id = ?", [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Family not found" });
        }

        const family = results[0];

        db.query(
            "SELECT id, username, email, role, language, language_level, family_id, created_at FROM users WHERE family_id = ?",
            [id],
            (err, results) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.json({
                    ...family,
                    users: results
                });
            }
        );
    });
}