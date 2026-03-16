import express from "express";
import db from "../database.js";

import create from "../controllers/User/userCreate.js";
import show from "../controllers/User/userDetail.js";
import update from "../controllers/User/userUpdate.js";

const router = express.Router();


router.options("/", (req, res) => {
    res.set("Allow", "GET,POST,OPTIONS");
    res.sendStatus(204);
});

// GET all users(voor admin ltr)
router.get("/", (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
        if (err) return res.status(500).json(err);

        res.json(results);
    });
});

// CREATE user
router.post("/", create);

router.options("/:id", (req, res) => {
    res.set("Allow","GET,OPTIONS, PATCH, PUT,DELETE");
    res.sendStatus(204);
});

// GET detail
router.get("/:id", show);
// PATCH /users/:id (partial update)
router.patch("/:id", update);

// DELETE /users/:id
router.delete("/:id", (req, res) => {
    const userId = req.params.id;

    db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted" });
    });
});
export default router;