import bcrypt from "bcrypt";
import db from "../../database.js";

export default async function create(req, res) {

    const {username, email, password, role = 1, language = "english", language_level = "A1"} = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            error: "username, email and password are required"
        });
    }

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(`INSERT INTO users
            (username,email,password,role,language,language_level,family_id,created_at)
            VALUES (?,?,?,?,?,?,NULL,NOW())`, [username, email, hashedPassword, role, language, language_level],
            (err, result) => {

                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.json({
                    message: "User created",
                    id: result.insertId
                });

            }
        );

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}