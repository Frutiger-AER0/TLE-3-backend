const activeGames = new Map();

const WORDS = ["pasta", "pannekoek", "appel", "pizza", "bord"];

function maskWord(word, guessedLetters) {
    return word
        .split("")
        .map((char) => (guessedLetters.includes(char) ? char : "_"))
        .join(" ");
}

function buildState(sessionId, game) {
    return {sessionId, minigameId: game.minigameId, userId: game.userId, maskedWord: maskWord(game.word, game.guessedLetters),
        guessedLetters: game.guessedLetters, wrongLetters: game.wrongLetters, wrongCount: game.wrongLetters.length,
        maxWrong: game.maxWrong, status: game.status};
}

export function createGalgje(sessionId, minigameId, userId) {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    const game = {word: randomWord, guessedLetters: [], wrongLetters: [], maxWrong: 6, status: "active", minigameId, userId};

    activeGames.set(sessionId, game);
    return buildState(sessionId, game);
}

export function getGalgje(sessionId) {
    const game = activeGames.get(Number(sessionId));
    if (!game) return null;
    return buildState(Number(sessionId), game);
}

export function guessLetter(sessionId, letter) {
    const game = activeGames.get(Number(sessionId));

    if (!game) return null;
    if (game.status !== "active") {
        return {
            result: "finished",
            state: buildState(Number(sessionId), game)
        };
    }

    const normalizedLetter = letter.toLowerCase();
    if (
        game.guessedLetters.includes(normalizedLetter) ||
        game.wrongLetters.includes(normalizedLetter)
    ) {
        return {
            result: "duplicate",
            state: buildState(Number(sessionId), game)
        };
    }

    if (game.word.includes(normalizedLetter)) {
        game.guessedLetters.push(normalizedLetter);
        const allLettersFound = game.word
            .split("")
            .every((char) => game.guessedLetters.includes(char));
        if (allLettersFound) {
            game.status = "won";
        }
        return {
            result: "correct",
            state: buildState(Number(sessionId), game)
        };
    }

    game.wrongLetters.push(normalizedLetter);

    if (game.wrongLetters.length >= game.maxWrong) {
        game.status = "lost";
    }

    return {
        result: "wrong",
        state: buildState(Number(sessionId), game)
    };
}

export function getInternalGame(sessionId) {
    return activeGames.get(Number(sessionId));
}