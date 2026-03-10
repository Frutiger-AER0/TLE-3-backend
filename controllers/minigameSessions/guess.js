import db from "../../database.js";
import {
    guessLetter,
    guessWord,
    getInternalGame
} from "../../services/minigames/galgjeService.js";

function isOnlyLetters(value) {
    return typeof value === "string" && /^[a-zA-ZÀ-ÿ]+$/.test(value);
}

export default function guess(req, res) {
    const { id } = req.params;
    const { letter, word } = req.body;

    if (!letter && !word) {
        return res.status(400).json({
            error: "Provide either a letter or a word"
        });
    }

    if (letter && word) {
        return res.status(400).json({
            error: "Provide either a letter or a word, not both"
        });
    }

    let response;
    let eventType;
    let eventData;

    if (letter) {
        if (
            typeof letter !== "string" ||
            letter.trim().length !== 1 ||
            !isOnlyLetters(letter.trim())
        ) {
            return res.status(400).json({
                error: "letter must be a single alphabetic character"
            });
        }

        const normalizedLetter = letter.trim().toLowerCase();
        response = guessLetter(id, normalizedLetter);

        if (!response) {
            return res.status(404).json({
                error: "Session not found"
            });
        }

        eventType = response.result === "correct" ? "correct" : response.result === "wrong" ? "wrong" : "choice";

        eventData = {
            guessType: "letter",
            guess: normalizedLetter
        };
    }

    if (word) {
        if (!isOnlyLetters(word.trim())) {
            return res.status(400).json({
                error: "word can only contain letters"
            });
        }

        const normalizedWord = word.trim().toLowerCase();
        response = guessWord(id, normalizedWord);

        if (!response) {
            return res.status(404).json({
                error: "Session not found"
            });
        }

        eventType = response.result === "correct_word" ? "correct" : response.result === "wrong_word" ? "wrong" : "choice";
        eventData = {
            guessType: "word",
            guess: normalizedWord
        };
    }

    db.query(`INSERT INTO minigame_events (session_id, event_type, event_data, timestamp)VALUES (?, ?, ?, NOW())`,
        [id, eventType, JSON.stringify(eventData)],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const game = getInternalGame(id);
            if (game && (game.status === "won" || game.status === "lost")) {
                db.query(`UPDATE minigame_sessions SET end_time = NOW(), result = ?, score = ? WHERE id = ?`,
                    [JSON.stringify({word: game.word, status: game.status, guessedLetters: game.guessedLetters, wrongLetters: game.wrongLetters}),
                        game.status === "won" ? 100 : 0, id],
                    (updateErr) => {
                        if (updateErr) {
                            return res.status(500).json({ error: updateErr.message });
                        }
                        return res.json({message: "Guess processed", result: response.result, state: response.state
                        });
                    }
                );
            } else {
                return res.json({
                    message: "Guess processed",
                    result: response.result,
                    state: response.state
                });
            }
        }
    );
}