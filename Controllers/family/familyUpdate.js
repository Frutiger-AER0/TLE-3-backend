import db from "../../database.js";

export default function update(req, res) {
    const { id } = req.params;
    const { family_admin } = req.body;

    if (!family_admin) {
        return res.status(400).json({
            error: "family_admin is required"
        });
    }

    db.query(
        "SELECT * FROM families WHERE id = ?",
        [id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: "Family not found" });
            }

            db.query(
                "UPDATE families SET family_admin = ? WHERE id = ?",
                [family_admin, id],
                (err) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    res.json({
                        message: "Family updated",
                        id: Number(id),
                        family_admin
                    });
                }
            );
        }
    );
}