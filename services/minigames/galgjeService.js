const activeGames = new Map();
const activeMatches = new Map();

const WORDS = ["pasta", "pannekoek", "appel", "pizza", "bord"];

function maskWord(word, guessedLetters) {
    return word
        .split("")
        .map((char) => (guessedLetters.includes(char.toLowerCase()) ? char : "_"))
        .join(" ");
}

//single state
function buildGameState(sessionId, game) {
    return {
        sessionId: Number(sessionId),
        minigameId: game.minigameId,
        userId: game.userId,
        maskedWord: maskWord(game.word, game.guessedLetters),
        guessedLetters: game.guessedLetters,
        wrongLetters: game.wrongLetters,
        wrongCount: game.wrongLetters.length,
        maxWrong: game.maxWrong,
        status: game.status
    };
}

//multi state
function buildMatchState(matchId, game) {
    return {
        matchId: Number(matchId),
        minigameId: game.minigameId,
        players: game.players,
        maskedWord: maskWord(game.word, game.guessedLetters),
        guessedLetters: game.guessedLetters,
        wrongLetters: game.wrongLetters,
        wrongCount: game.wrongLetters.length,
        maxWrong: game.maxWrong,
        status: game.status
    };
}

export function createGalgje(sessionId, minigameId, userId) {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];

    const game = {
        word: randomWord,
        guessedLetters: [],
        wrongLetters: [],
        maxWrong: 10,
        status: "active",
        minigameId,
        userId
    };

    activeGames.set(Number(sessionId), game);
    return buildGameState(sessionId, game);
}

export function getGalgje(sessionId) {
    const game = activeGames.get(Number(sessionId));
    if (!game) return null;
    return buildGameState(sessionId, game);
}

export function guessLetter(sessionId, letter) {
    const game = activeGames.get(Number(sessionId));

    if (!game) return null;

    if (game.status !== "active") {
        return {
            result: "finished",
            state: buildGameState(sessionId, game)
        };
    }

    const normalizedLetter = letter.trim().toLowerCase();

    if (
        game.guessedLetters.includes(normalizedLetter) ||
        game.wrongLetters.includes(normalizedLetter)
    ) {
        return {
            result: "duplicate",
            state: buildGameState(sessionId, game)
        };
    }

    if (game.word.toLowerCase().includes(normalizedLetter)) {
        game.guessedLetters.push(normalizedLetter);

        const allLettersFound = [...new Set(game.word.toLowerCase().split(""))]
            .every((char) => game.guessedLetters.includes(char));

        if (allLettersFound) {
            game.status = "won";
        }

        return {
            result: "correct",
            state: buildGameState(sessionId, game)
        };
    }

    game.wrongLetters.push(normalizedLetter);

    if (game.wrongLetters.length >= game.maxWrong) {
        game.status = "lost";
    }

    return {
        result: "wrong",
        state: buildGameState(sessionId, game)
    };
}

export function guessWord(sessionId, guessedWord) {
    const game = activeGames.get(Number(sessionId));

    if (!game) return null;

    if (game.status !== "active") {
        return {
            result: "finished",
            state: buildGameState(sessionId, game)
        };
    }
    const normalizedWord = guessedWord.trim().toLowerCase();
    const actualWord = game.word.toLowerCase();

    if (normalizedWord === actualWord) {
        game.guessedLetters = [...new Set(game.word.toLowerCase().split(""))];
        game.status = "won";

        return {
            result: "correct_word",
            state: buildGameState(sessionId, game)
        };
    }

    if (!game.wrongLetters.includes(normalizedWord)) {
        game.wrongLetters.push(normalizedWord);
    }

    if (game.wrongLetters.length >= game.maxWrong) {
        game.status = "lost";
    }

    return {
        result: "wrong_word",
        state: buildGameState(sessionId, game)
    };
}

export function getInternalGame(sessionId) {
    return activeGames.get(Number(sessionId));
}


export function createGalgjeMatch(matchId, minigameId, players) {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];

    const game = {
        word,
        guessedLetters: [],
        wrongLetters: [],
        maxWrong: 10,
        status: "active",
        players,
        minigameId
    };

    activeMatches.set(Number(matchId), game);

    return buildMatchState(matchId, game);
}

export function getGalgjeMatchState(matchId) {
    const game = activeMatches.get(Number(matchId));
    if (!game) return null;
    return buildMatchState(matchId, game);
}

export function guessMatchLetter(matchId, letter) {
    const game = activeMatches.get(Number(matchId));

    if (!game) return null;

    if (game.status !== "active") {
        return {
            result: "finished",
            state: buildMatchState(matchId, game)
        };
    }

    const normalizedLetter = letter.trim().toLowerCase();

    if (game.guessedLetters.includes(normalizedLetter) ||game.wrongLetters.includes(normalizedLetter)) {
        return {
            result: "duplicate",
            state: buildMatchState(matchId, game)
        };
    }

    if (game.word.toLowerCase().includes(normalizedLetter)) {
        game.guessedLetters.push(normalizedLetter);
        const allLettersFound = [...new Set(game.word.toLowerCase().split(""))]
            .every((char) => game.guessedLetters.includes(char));
        if (allLettersFound) {
            game.status = "won";
        }
        return {
            result: "correct",
            state: buildMatchState(matchId, game)
        };
    }
    game.wrongLetters.push(normalizedLetter);
    if (game.wrongLetters.length >= game.maxWrong) {
        game.status = "lost";
    }
    return {
        result: "wrong",
        state: buildMatchState(matchId, game)
    };
}

export function guessMatchWord(matchId, guessedWord) {
    const game = activeMatches.get(Number(matchId));
    if (!game) return null;
    if (game.status !== "active") {
        return {
            result: "finished",
            state: buildMatchState(matchId, game)
        };
    }
    const normalizedWord = guessedWord.trim().toLowerCase();
    const actualWord = game.word.toLowerCase();
    if (normalizedWord === actualWord) {
        game.guessedLetters = [...new Set(game.word.toLowerCase().split(""))];
        game.status = "won";
        return {
            result: "correct_word",
            state: buildMatchState(matchId, game)
        };
    }
    if (!game.wrongLetters.includes(normalizedWord)) {
        game.wrongLetters.push(normalizedWord);
    }
    if (game.wrongLetters.length >= game.maxWrong) {
        game.status = "lost";
    }
    return {
        result: "wrong_word",
        state: buildMatchState(matchId, game)
    };
}

export function getInternalMatch(matchId) {
    return activeMatches.get(Number(matchId));
}