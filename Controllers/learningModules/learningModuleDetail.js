import db from "../../database.js";

export default async function show(req, res) {

    const { id } = req.params;

    const connection = db.promise();

    try {

        // 1️⃣ Get quiz
        const [quizRows] = await connection.query(
            `SELECT * FROM quizzes WHERE id = ?`,
            [id]
        );

        if (quizRows.length === 0) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        const quiz = quizRows[0];

        // 2️⃣ Get questions
        const [questions] = await connection.query(
            `SELECT * FROM questions WHERE quiz_id = ?`,
            [id]
        );

        // 3️⃣ Get answers
        const [answers] = await connection.query(
            `SELECT * FROM answers 
             WHERE question_id IN (
                SELECT id FROM questions WHERE quiz_id = ?
             )`,
            [id]
        );

        // 4️⃣ Attach answers to questions
        const questionsWithAnswers = questions.map(q => {

            const questionAnswers = answers.filter(
                a => a.question_id === q.id
            );

            return {
                ...q,
                answers: questionAnswers
            };
        });

        quiz.questions = questionsWithAnswers;

        res.json(quiz);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
}