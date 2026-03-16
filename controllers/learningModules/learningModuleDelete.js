import db from "../../database.js";

export default function remove(req, res){
    const id = req.params.id;

    db.query("DELETE FROM quizzes WHERE id = ?", [id], (err, result) => {

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "Quiz deleted succesfully" });
    });

}