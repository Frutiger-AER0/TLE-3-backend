import db from "../../database.js";

export default async function show(req, res) {

    const { id } = req.params;
    const connection = db.promise();

    try {

        const [rows] = await connection.query(
            `SELECT
            quizzes.id AS quiz_id,
            quizzes.name,
            quizzes.description,
            quizzes.theme_id,
            quizzes.times_played,
            quizzes.created_at,

            themes.movie,
            themes.movie_genre,
            themes.artist,
            themes.food,
            themes.place,
            themes.music,
            themes.music_genre,
            themes.holiday_country,
            themes.clothing_style,
            themes.animal,
            themes.color,

            questions.id AS question_id,
            questions.description AS description,

            answers.id AS answer_id,
            answers.is_correct,

            users.id AS user_id,
            users.username,

            answers.response

        FROM quizzes

        LEFT JOIN themes 
            ON themes.id = quizzes.theme_id

        LEFT JOIN questions 
            ON questions.quiz_id = quizzes.id

        LEFT JOIN answers 
            ON answers.question_id = questions.id

        LEFT JOIN users 
            ON users.id = answers.user_id

        WHERE quizzes.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        const quiz = {
            id: rows[0].quiz_id,
            name: rows[0].name,
            description: rows[0].description,
            times_played: rows[0].times_played,
            created_at: rows[0].created_at,

            theme: {
                movie: rows[0].movie,
                movie_genre: rows[0].movie_genre,
                artist: rows[0].artist,
                food: rows[0].food,
                place: rows[0].place,
                music: rows[0].music,
                music_genre: rows[0].music_genre,
                holiday_country: rows[0].holiday_country,
                clothing_style: rows[0].clothing_style,
                animal: rows[0].animal,
                color: rows[0].color
            },

            questions: []
        };

        const questionMap = {};

        rows.forEach(row => {

            if (!row.question_id) return;

            if (!questionMap[row.question_id]) {
                questionMap[row.question_id] = {
                    id: row.question_id,
                    description: row.description,
                    answers: []
                };

                quiz.questions.push(questionMap[row.question_id]);
            }

            if (row.answer_id) {
                questionMap[row.question_id].answers.push({
                    id: row.answer_id,
                    user_id: row.user_id,
                    username: row.username,
                    is_correct: row.is_correct,
                    response: row.response
                });
            }

        });

        res.json(quiz);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
}

