import db from "../../database.js";

function keepOldIfEmpty(newValue, oldValue) {
    if (newValue === undefined || newValue === null) return oldValue;
    if (typeof newValue === "string" && newValue.trim() === "") return oldValue;
    return newValue;
}
export default function edit (req, res){

    const { id } = req.params;
    const {name, description, theme} = req.body;

    try{
        db.query("SELECT * FROM quizzes WHERE id = ?", [id], (err, results)=>{

            if (results.length === 0) {
                return res.status(404).json({ message: "Learning Module not found." });
            }

        const quiz = results[0];
        const updatedName = keepOldIfEmpty(name, quiz.name);
        const updatedDescription = keepOldIfEmpty(description, quiz.description);
        const updatedTheme = keepOldIfEmpty(theme, quiz.theme);

        db.query(
            `UPDATE quizzes SET name = ?, description = ?, theme = ? WHERE id = ?`,
            [updatedName, updatedDescription, updatedTheme, id],
            (err, results) => {
                if (err){
                    return res.status(500).json({ error: err.message });
                }else {
                    res.status(201).json({
                        message: "Quiz updated succesfully",
                        affectedRows: results.affectedRows
                    });
                }
            }
        );
    });

    } catch(e){
        res.status(500).json({ error: e.message });
    }
}