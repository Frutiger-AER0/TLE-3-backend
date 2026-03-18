import db from "../../database.js";

function keepOldIfEmpty(newValue, oldValue) {
    if (newValue === undefined || newValue === null) return oldValue;
    if (typeof newValue === "string" && newValue.trim() === "") return oldValue;
    return newValue;
}

export default function update(req, res) {
    const userId = req.params.id;
    const { username, email, password, role } = req.body;

    db.query("SELECT * FROM users WHERE id = ?", [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "user not found" });
        }

        const user = results[0];
        const updatedUsername = keepOldIfEmpty(username, user.username);
        const updatedEmail = keepOldIfEmpty(email, user.email);
        const updatedPassword = keepOldIfEmpty(password, user.password);
        const updatedRole = keepOldIfEmpty(role, user.role);

        db.query(
            `UPDATE users SET username = ?, email = ?, password = ?, role = ? WHERE id = ?`,
            [updatedUsername, updatedEmail, updatedPassword, updatedRole, userId],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: "user updated" });
            }
        );
    });
}