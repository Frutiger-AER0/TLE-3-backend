import db from "../../database.js";

export default function show (req,res){
    const { id } = req.params;

    try{
        db.query("SELECT * FROM quizzes WHERE id = ?", [id], (err, results)=>{

            if (!results){
                res.status(404).json({message: "Learning Module not found."})
            }else
                res.status(200).json(results);
        });


    } catch(e){
        res.status(404).json({message: "Learning Module not found."})
    }



}



// router.get("/:id", async (req, res) => {
//     const prehistoricAnimalId = req.params.id;
//
//     try{
//         const prehistoricAnimal = await PrehistoricAnimal.findById(prehistoricAnimalId);
//
//         if (!prehistoricAnimal){
//             res.status(404).json({message: "Resource not found."})
//         }else{
//             res.status(200).json(prehistoricAnimal)
//         }
//
//     }catch (e){
//         res.status(404).json({message: "Resource not found."})
//     }
// })