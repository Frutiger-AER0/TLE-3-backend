import db from "../../database.js";
import { guessMatchLetter, guessMatchWord, getInternalMatch} from "../../services/minigames/galgjeService.js";

function isOnlyLetters(value) {
    return typeof value === "string" && /^[a-zA-ZÀ-ÿ]+$/.test(value);
}

export default function guess(req, res) {
    const { id } = req.params;
    const { user_id, letter, word } = req.body;

    if (!user_id) {
        return res.status(400).json({
            error: "user_id is required"
        });
    }

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

    db.query("SELECT * FROM match_users WHERE match_id = ? AND user_id = ?",
        [id, user_id],
        (err, playerResults) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (playerResults.length === 0) {
                return res.status(403).json({
                    error: "User is not part of this match"
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
                response = guessMatchLetter(id, normalizedLetter);

                if (!response) {
                    return res.status(404).json({
                        error: "Match state not found"
                    });
                }

                eventType = response.result === "correct" ? "correct" : response.result === "wrong" ? "wrong" : "choice";
                eventData = { user_id, guessType: "letter", guess: normalizedLetter };
            }

            if (word) {
                if (!isOnlyLetters(word.trim())) {
                    return res.status(400).json({
                        error: "word can only contain letters"
                    });
                }
                const normalizedWord = word.trim().toLowerCase();
                response = guessMatchWord(id, normalizedWord);
                if (!response) {
                    return res.status(404).json({
                        error: "Match state not found"
                    });
                }

                eventType =
                    response.result === "correct_word" ? "correct" : response.result === "wrong_word" ? "wrong" : "choice";
                eventData = {user_id,guessType: "word",guess: normalizedWord};
            }
            const game = getInternalMatch(id);

            db.query( `INSERT INTO minigame_events (session_id, event_type, event_data, timestamp) VALUES (?, ?, ?, NOW())`,
                [1, eventType, JSON.stringify(eventData)],
                (eventErr) => {
                    if (eventErr) {
                        return res.status(500).json({ error: eventErr.message });
                    }

                    if (game && (game.status === "won" || game.status === "lost")) {
                        db.query( `UPDATE minigame_matches SET status = ?, ended_at = NOW() WHERE id = ?`,
                            [game.status, id],
                            (updateErr) => {
                                if (updateErr) {
                                    return res.status(500).json({ error: updateErr.message });
                                }
                                return res.json({ message: "Guess processed", result: response.result, state: response.state});
                            }
                        );
                    } else {
                        return res.json({ message: "Guess processed", result: response.result, state: response.state});
                    }
                }
            );
        }
    );
}