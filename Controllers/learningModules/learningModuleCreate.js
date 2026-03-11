import db from "../../database.js";

export default function create(req, res) {

    const { name, description, theme_id, questions } = req.body;

    if (!name || !description || !theme_id) {
        return res.status(400).json({
            message: "name, description and theme_id are required"
        });
    }

    db.beginTransaction(err => {

        if (err) {
            return res.status(500).json({ error: err.message });
        }

        db.query(
            `INSERT INTO quizzes (name, description, theme_id, created_at)
             VALUES (?, ?, ?, NOW())`,
            [name, description, theme_id],
            (err, quizResult) => {

                if (err) {
                    return db.rollback(() =>
                        res.status(500).json({ error: err.message })
                    );
                }

                const quizId = quizResult.insertId;

                if (!questions || questions.length === 0) {
                    return db.commit(() =>
                        res.status(201).json({
                            message: "Quiz created",
                            quiz_id: quizId
                        })
                    );
                }

                let questionCount = questions.length;
                let processedQuestions = 0;

                questions.forEach(q => {

                    db.query(
                        `INSERT INTO questions (quiz_id, description, created_at)
                         VALUES (?, ?, NOW())`,
                        [quizId, q.description],
                        (err, questionResult) => {

                            if (err) {
                                return db.rollback(() =>
                                    res.status(500).json({ error: err.message })
                                );
                            }

                            const questionId = questionResult.insertId;

                            const answers = q.answers || [];

                            if (answers.length === 0) {
                                processedQuestions++;
                                if (processedQuestions === questionCount) finish();
                                return;
                            }

                            let answerValues = answers.map(a => [
                                questionId,
                                a.answer_text,
                                a.is_correct,
                                new Date()
                            ]);

                            db.query(
                                `INSERT INTO answers (question_id, answer_text, is_correct, created_at)
                                 VALUES ?`,
                                [answerValues],
                                (err) => {

                                    if (err) {
                                        return db.rollback(() =>
                                            res.status(500).json({ error: err.message })
                                        );
                                    }

                                    processedQuestions++;

                                    if (processedQuestions === questionCount) finish();
                                }
                            );
                        }
                    );

                });

                function finish() {
                    db.commit(err => {

                        if (err) {
                            return db.rollback(() =>
                                res.status(500).json({ error: err.message })
                            );
                        }

                        res.status(201).json({
                            message: "Quiz + questions + answers created",
                            quiz_id: quizId
                        });
                    });
                }

            }
        );

    });
}