import db from "../../database.js";

export default function create(req, res){

    const {name, description, theme} = req.body;

    if (!name || !description || !theme){
        return res.status(400).json({message:"name, description and theme are required"
        });
    }

    try{

        db.query(`INSERT INTO quizzes
            (name,description,theme,created_at)
            VALUES (?,?,?,NOW())`, [name, description, theme],
            (err, result) => {

            if (err){
                return res.status(500).json({ error: err.message });

            }else {
                res.status(201).json({
                    message: "Quiz created successfully",
                    id: result.insertId
                });
            }

        })
    }catch (e){
        res.status(500).json({ error: e.message });
    }
}