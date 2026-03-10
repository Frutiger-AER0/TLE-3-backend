import db from "../../database.js";
import { guessLetter, getInternalGame } from "../../services/minigames/galgjeService.js";

export default function guess(req, res) {
    const { id } = req.params;
    const { letter } = req.body;

    if (!letter || typeof letter !== "string" || letter.length !== 1) {
        return res.status(400).json({
            error: "letter must be a single character"
        });
    }

    const response = guessLetter(id, letter);

    if (!response) {
        return res.status(404).json({
            error: "Session not found"
        });
    }

    const eventType = response.result === "correct"? "correct": response.result === "wrong" ? "wrong" : "choice";

    db.query(`INSERT INTO minigame_events (session_id, event_type, event_data, timestamp)VALUES (?, ?, ?, NOW())`,
        [id, eventType, JSON.stringify({ guess: letter })],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const game = getInternalGame(id);

            if (game.status === "won" || game.status === "lost") {
                db.query(`UPDATE minigame_sessions SET end_time = NOW(),result = ?,score = ? WHERE id = ?`,
                    [
                        JSON.stringify({word: game.word, status: game.status, guessedLetters: game.guessedLetters, wrongLetters: game.wrongLetters}),
                        game.status === "won" ? 100 : 0, id
                    ]
                );
            }
            res.json({message: "Guess processed", result: response.result, state: response.state
            });
        }
    );
}