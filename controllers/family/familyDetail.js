import db from "../../database.js";

export default function show(req, res) {
    const familyId = Number(req.params.id);
    const loggedInUserId = req.user.id;

    if (!familyId) {
        return res.status(400).json({ error: "Invalid family id" });
    }

    db.query(
        "SELECT family_id FROM users WHERE id = ?",
        [loggedInUserId],
        (err, authUserResults) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (authUserResults.length === 0) {
                return res.status(401).json({ error: "Authenticated user not found" });
            }

            const userFamilyId = authUserResults[0].family_id;

            if (!userFamilyId) {
                return res.status(403).json({ error: "You are not linked to a family" });
            }

            if (userFamilyId !== familyId) {
                return res.status(403).json({ error: "Not allowed to view this family" });
            }

            db.query("SELECT * FROM families WHERE id = ?", [familyId], (err, familyResults) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                if (familyResults.length === 0) {
                    return res.status(404).json({ error: "Family not found" });
                }

                const family = familyResults[0];

                db.query( `SELECT id, username, email, role, language, language_level, family_id, created_at FROM users WHERE family_id = ?`,
                    [familyId],
                    (err, userResults) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        return res.json({
                            ...family,
                            users: userResults
                        });
                    }
                );
            });
        }
    );
}