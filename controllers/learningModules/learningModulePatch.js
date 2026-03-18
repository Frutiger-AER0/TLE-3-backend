import db from "../../database.js";

    export default async function patch(req, res) {

        const { id } = req.params;
        const { response } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Answer id is required" });
        }

        const connection = db.promise();

        const [answer] = await connection.query(
            "SELECT id FROM answers WHERE id = ?",
            [id]
        );

        if (answer.length === 0) {
            return res.status(404).json({ message: "Answer not found" });
        }
        try {
            await connection.query(
                `UPDATE answers 
                SET response = ?
                WHERE id = ?`,
                [response, id]
            );

            await connection.commit();

            res.status(200).json({ message: "Answer updated successfully" });

        }catch (err){
            await connection.rollback();

            res.status(500).json({
                error: err.message
            });
        }
}