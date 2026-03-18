import express from "express";
import db from "../database.js";

import userdelete from "../controllers/user/userDelete.js";
import create from "../controllers/user/userCreate.js";
import show from "../controllers/user/userDetail.js";
import update from "../controllers/user/userUpdate.js";


import requireAuth from "../middleware/auth.js";

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
router.get("/:id", requireAuth, show);
// PATCH /users/:id (partial update)
router.patch("/:id", requireAuth, update);

// DELETE /users/:id
router.delete("/:id", requireAuth, userdelete);

export default router;