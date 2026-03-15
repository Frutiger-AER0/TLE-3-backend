import db from "../../database.js";

export default async function create(req, res) {

    const { name, description, theme_id, questions } = req.body;

    if (!name || !description || !theme_id) {
        return res.status(400).json({
            message: "name, description and theme_id are required"
        });
    }

    const connection = db.promise();

    try {

        await connection.beginTransaction();

        //Create quiz
        const [quizResult] = await connection.query(
            `INSERT INTO quizzes (name, description, theme_id, created_at)
             VALUES (?, ?, ?, NOW())`,
            [name, description, theme_id]
        );

        const quizId = quizResult.insertId;

        //Insert questions + answers
        if (questions && questions.length > 0) {

            for (const q of questions) {

                const [questionResult] = await connection.query(
                    `INSERT INTO questions (quiz_id, description, created_at)
                     VALUES (?, ?, NOW())`,
                    [quizId, q.description]
                );

                const questionId = questionResult.insertId;

                if (q.answers && q.answers.length > 0) {

                    const answerValues = q.answers.map(a => [
                        questionId,
                        a.answer_text,
                        a.is_correct,
                        new Date()
                    ]);

                    await connection.query(
                        `INSERT INTO answers (question_id, answer_text, is_correct, created_at)
                         VALUES ?`,
                        [answerValues]
                    );
                }
            }
        }

        await connection.commit();

        res.status(201).json({
            message: "Quiz created with questions and answers",
            quiz_id: quizId
        });

    } catch (err) {

        await connection.rollback();

        res.status(500).json({
            error: err.message
        });
    }
}