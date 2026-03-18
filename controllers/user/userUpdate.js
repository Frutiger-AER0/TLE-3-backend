import db from "../../database.js";
import bcrypt from "bcrypt";

function keepOldIfEmpty(newValue, oldValue) {
    if (newValue === undefined || newValue === null) return oldValue;
    if (typeof newValue === "string" && newValue.trim() === "") return oldValue;
    return newValue;
}

export default async function update(req, res) {
    const userId = req.params.id;
    const { username, email, password, role } = req.body;

    db.query("SELECT * FROM users WHERE id = ?", [userId], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "user not found" });
        }
        const user = results[0];
        const updatedUsername = keepOldIfEmpty(username, user.username);
        const updatedEmail = keepOldIfEmpty(email, user.email);
        const updatedRole = keepOldIfEmpty(role, user.role);

        let updatedPassword = user.password;

        //check
        if (password && password.trim() !== "") {
            try {
                if (!password.startsWith("$2b$")) {
                    updatedPassword = await bcrypt.hash(password, 10);
                } else {
                    updatedPassword = password;
                }
            } catch (error) {
                return res.status(500).json({ error: error.message });
            }
        }

        db.query(`UPDATE users SET username = ?, email = ?, password = ?, role = ? WHERE id = ?`,
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