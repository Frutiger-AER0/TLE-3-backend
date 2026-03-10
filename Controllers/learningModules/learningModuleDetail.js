import db from "../../database.js";

export default function show (req,res){
    const { id } = req.params;

    try{
        db.query("SELECT * FROM quizzes WHERE id = ?", [id], (err, results)=>{

            if (results.length===0){
                res.status(404).json({message: "Learning Module not found."})
            }else
                res.status(200).json(results);
        });


    } catch(e){
        res.status(500).json({ error: e.message });
    }
}