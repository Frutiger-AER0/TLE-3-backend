import bcrypt from "bcrypt";
import db from "../../database.js";

export default async function create(req, res) {
    const {username, email, password, role = 0, language = "english", language_level = "A1",} = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            error: "username, email and password are required",
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(`SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1`, [username, email], (checkErr, checkResults) => {
                if (checkErr) {
                    return res.status(500).json({ error: checkErr.message });
                }

                if (checkResults.length > 0) {
                    return res.status(409).json({
                        error: "Username or email already exists",
                    });
                }

                db.query(`INSERT INTO users(username,email,password,role,language,language_level,family_id,created_at) VALUES (?,?,?,?,?,?,NULL,NOW())`,
                    [username, email, hashedPassword, role, language, language_level],
                    (err, result) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }

                        return res.status(201).json({
                            message: "User created",
                            id: result.insertId,
                        });
                    }
                );
            }
        );
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}