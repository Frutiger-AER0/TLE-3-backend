import db from "../../database.js";

export default async function update(req, res) {

    const { id } = req.params;
    const { name, description, theme_id, questions } = req.body;



    if (!id) {
        return res.status(400).json({ message: "Quiz id is required" });
    }

    const connection = db.promise();

    const [quiz] = await connection.query(
        "SELECT id FROM quizzes WHERE id = ?",
        [id]
    );

    if (quiz.length === 0) {
        return res.status(404).json({ message: "Quiz not found" });
    }

    try {

        await connection.beginTransaction();

        // Update quiz info
        await connection.query(
            `UPDATE quizzes 
             SET name = ?, description = ?, theme_id = ?
             WHERE id = ?`,
            [name, description, theme_id, id]
        );

        // Delete old answers
        await connection.query(
            `DELETE a FROM answers a
             JOIN questions q ON a.question_id = q.id
             WHERE q.quiz_id = ?`,
            [id]
        );

        // Delete old questions
        await connection.query(
            `DELETE FROM questions WHERE quiz_id = ?`,
            [id]
        );

        // Insert new questions + answers
        if (questions && questions.length > 0) {

            for (const q of questions) {

                const [questionResult] = await connection.query(
                    `INSERT INTO questions (quiz_id, description, created_at)
                     VALUES (?, ?, NOW())`,
                    [id, q.description]
                );

                const questionId = questionResult.insertId;

                if (q.answers && q.answers.length > 0) {

                    const answerValues = q.answers.map(a => [
                        questionId,
                        a.user_id,
                        a.is_correct,
                        new Date(),
                    ]);

                    await connection.query(
                        `INSERT INTO answers (question_id, user_id, is_correct, created_at)
                         VALUES ?`,
                        [answerValues]
                    );
                }
            }
        }

        await connection.commit();

        res.json({
            message: "Quiz updated successfully",
            quiz_id: id
        });

    } catch (err) {

        await connection.rollback();

        res.status(500).json({
            error: err.message
        });
    }
}