import db from "../../database.js";

function keepOldIfEmpty(newValue, oldValue) {
    if (newValue === undefined || newValue === null) return oldValue;
    if (typeof newValue === "string" && newValue.trim() === "") return oldValue;
    return newValue;
}

export default function patch(req, res) {
    const { id } = req.params;
    const { family_admin } = req.body;

    db.query(
        "SELECT * FROM families WHERE id = ?",
        [id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (results.length === 0) {
                return res.status(404).json({
                    error: "Family not found"
                });
            }

            const family = results[0];
            const updatedFamilyAdmin = keepOldIfEmpty(family_admin, family.family_admin);

            db.query(
                "UPDATE families SET family_admin = ? WHERE id = ?", [updatedFamilyAdmin, id],
                (err) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    res.json({message: "Family updated", id: Number(id), family_admin: updatedFamilyAdmin});
                }
            );
        }
    );
}