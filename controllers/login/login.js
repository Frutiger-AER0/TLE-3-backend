import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import db from "../../database.js";

export default function login(req, res) {
    const { email, password } = req.body;

    const isEmpty = (v) => typeof v !== "string" || v.trim() === "";

    if (isEmpty(email) || isEmpty(password)) {
        return res.status(400).json({
            message: "Missing credentials",
        });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            message: "JWT_SECRET is not set",
        });
    }

    db.query(`SELECT id, username, email, password, role, language, language_level FROM users WHERE email = ? LIMIT 1`, [email],
        async (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: "Database error",
                    error: err.message,
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    message: "Invalid credentials",
                });
            }

            const user = results[0];

            try {
                const passwordMatch = await bcrypt.compare(password, user.password);

                if (!passwordMatch) {
                    return res.status(401).json({
                        message: "Invalid credentials",
                    });
                }

                const token = jwt.sign({id: user.id, username: user.username, email: user.email, role: user.role, language: user.language, language_level: user.language_level,},
                    process.env.JWT_SECRET,
                    {
                        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
                    }
                );

                return res.json({
                    access_token: token,
                    token_type: "Bearer",
                    expires_in: process.env.JWT_EXPIRES_IN || "1d",
                    user: {id: user.id, username: user.username, email: user.email, role: user.role, language: user.language, language_level: user.language_level,},
                });

            } catch (error) {
                return res.status(500).json({
                    message: "Server error",
                    error: error.message,
                });
            }
        }
    );
}
