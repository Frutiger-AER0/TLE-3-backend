import db from "../../database.js";

export default function create(req, res) {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({
            error: "user_id is required"
        });
    }

    db.query(
        "SELECT id, family_id FROM users WHERE id = ?",
        [user_id],
        (err, users) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (users.length === 0) {
                return res.status(404).json({
                    error: "User not found"
                });
            }

            const user = users[0];

            if (user.family_id !== null) {
                return res.status(400).json({
                    error: "User already belongs to a family"
                });
            }

            db.query(
                "INSERT INTO families (user_id, family_admin, created_at) VALUES (?, ?, NOW())",
                [user_id, user_id],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    const familyId = result.insertId;

                    db.query(
                        "UPDATE users SET family_id = ? WHERE id = ?",
                        [familyId, user_id],
                        (err) => {
                            if (err) {
                                return res.status(500).json({ error: err.message });
                            }

                            return res.status(201).json({
                                message: "Family created",
                                family_id: familyId,
                                family_admin: user_id
                            });
                        }
                    );
                }
            );
        }
    );
}