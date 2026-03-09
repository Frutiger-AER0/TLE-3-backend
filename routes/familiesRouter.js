import express from "express";
import create from "../controllers/family/familyCreate.js";
import db from "../database.js";

import create from "../controllers/family/familyCreate.js";
import update from "../controllers/family/familyUpdate.js";
import show from "../controllers/family/familyDetail.js";

const router = express.Router();

// GET all families(voor admin ltr)
router.get("/", (req, res) => {
    db.query("SELECT * FROM families", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// CREATE family
router.post("/", create);

router.options("/:id", (req, res) => {
    res.set("Allow","GET,OPTIONS, PATCH, PUT,DELETE");
    res.sendStatus(204);
});

// GET detail
router.get("/:id", show);

// PATCH /users/:id (partial update)
router.put("/:id", update);

//Delete family
router.delete("/:id", (req, res) => {
    const familyId = req.params.id;

    db.query("DELETE FROM families WHERE id = ?", [familyId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Family not found" });
        }

        res.json({ message: "Family deleted" });
    });
});

export default router;