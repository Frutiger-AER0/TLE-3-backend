import express from "express";
import requireAuth from "../middleware/auth.js";
import requireAdmin from "../middleware/admin.js";
import db from "../database.js";

const router = express.Router();

router.get("/", requireAuth, requireAdmin, (req, res) => {
    res.json({
        message: "Welcome admin",
        user: req.user
    });
});

router.get("/users", requireAuth, requireAdmin, (req, res) => {
    db.query(
        "SELECT id, username, email, role, language, language_level, created_at FROM users",
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: "Database error",
                    error: err.message
                });
            }

            return res.json(results);
        }
    );
});

export default router;