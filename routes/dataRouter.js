import express from "express";
import db from "../database.js";

const dataRouter = express.Router()

dataRouter.use((req,res, next)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Skip Accept header check for redirects and auth callbacks
    if (req.method === 'GET' && (req.path.includes('youtube') || req.path.includes('callback'))) {
        next();
        return;
    }

    console.log("Check accept header");
    if(req.headers.accept === "application/json"){
        next();
    }else {
        if (req.method === "OPTIONS"){
            next();
        }else {
            res.status(406).json({message: "Webservice only supports json. Did you forget the Accept header?"})
        }
    }
})

dataRouter.options("/",(req,res)=>{
    res.header("Allow","GET, OPTIONS");
    res.header("Access-Control-Allow-Methods","GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
    res.status(204).send();
})


dataRouter.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (results.length === 0){
            res.status(404).json({message: "Collection not found."})
        }else
            res.status(200).json(results);
    });
});

dataRouter.get('/ai_profiles', (req, res) => {
    const userId = req.query.user_id;
    const likedVideoTitles = req.query.liked_video_titles;
    const likedVideoDescriptions = req.query.liked_video_descriptions;
    const likedVideoTags = req.query.liked_video_tags;

    // Determine which columns to select
    let selectColumns = '*';

    // If filtering by specific field, return only those columns
    if (likedVideoTags) {
        selectColumns = 'user_id, liked_video_tags';
    } else if (likedVideoTitles) {
        selectColumns = 'user_id, liked_video_titles';
    } else if (likedVideoDescriptions) {
        selectColumns = 'user_id, liked_video_descriptions';
    }

    let query = `SELECT ${selectColumns} FROM ai_profiles`;
    const params = [];
    const conditions = [];

    // Filter by user_id
    if (userId) {
        conditions.push('user_id = ?');
        params.push(userId);
    }

    // Filter by liked_video_titles (partial match)
    if (likedVideoTitles) {
        conditions.push('liked_video_titles LIKE ?');
        params.push(`%${likedVideoTitles}%`);
    }

    // Filter by liked_video_descriptions (partial match)
    if (likedVideoDescriptions) {
        conditions.push('liked_video_descriptions LIKE ?');
        params.push(`%${likedVideoDescriptions}%`);
    }

    // Filter by liked_video_tags (partial match)
    if (likedVideoTags) {
        conditions.push('liked_video_tags LIKE ?');
        params.push(`%${likedVideoTags}%`);
    }

    // Build WHERE clause if there are any conditions
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    // If filtering by user_id, get only the most recent profile
    if (userId) {
        query += ' ORDER BY created_at DESC LIMIT 1';
    }

    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({message: "Database error", error: err.message});
        }
        if (results.length === 0) {
            res.status(404).json({message: "Collection not found."});
        } else {
            res.status(200).json(results);
        }
    });
});

dataRouter.get('/themes', (req, res) => {
    const profileId = req.query.profile_id;
    const movie = req.query.movie;
    const movieGenre = req.query.movie_genre;
    const artist = req.query.artist;
    const food = req.query.food;
    const place = req.query.place;
    const music = req.query.music;
    const musicGenre = req.query.music_genre;
    const holidayCountry = req.query.holiday_country;
    const clothingStyle = req.query.clothing_style;
    const animal = req.query.animal;
    const color = req.query.color;

    // Determine which columns to select
    let selectColumns = '*';

    // If filtering by specific field, return only those columns
    if (movie) {
        selectColumns = 'profile_id, movie';
    } else if (movieGenre) {
        selectColumns = 'profile_id, movie_genre';
    } else if (artist) {
        selectColumns = 'profile_id, artist';
    } else if (food) {
        selectColumns = 'profile_id, food';
    } else if (place) {
        selectColumns = 'profile_id, place';
    } else if (music) {
        selectColumns = 'profile_id, music';
    } else if (musicGenre) {
        selectColumns = 'profile_id, music_genre';
    } else if (holidayCountry) {
        selectColumns = 'profile_id, holiday_country';
    } else if (clothingStyle) {
        selectColumns = 'profile_id, clothing_style';
    } else if (animal) {
        selectColumns = 'profile_id, animal';
    } else if (color) {
        selectColumns = 'profile_id, color';
    }

    let query = `SELECT ${selectColumns} FROM themes`;
    const params = [];
    const conditions = [];

    // Filter by profile_id
    if (profileId) {
        conditions.push('profile_id = ?');
        params.push(profileId);
    }

    // Filter by movie (partial match)
    if (movie) {
        conditions.push('movie LIKE ?');
        params.push(`%${movie}%`);
    }

    // Filter by movie_genre (partial match)
    if (movieGenre) {
        conditions.push('movie_genre LIKE ?');
        params.push(`%${movieGenre}%`);
    }

    // Filter by artist (partial match)
    if (artist) {
        conditions.push('artist LIKE ?');
        params.push(`%${artist}%`);
    }

    // Filter by food (partial match)
    if (food) {
        conditions.push('food LIKE ?');
        params.push(`%${food}%`);
    }

    // Filter by place (partial match)
    if (place) {
        conditions.push('place LIKE ?');
        params.push(`%${place}%`);
    }

    // Filter by music (partial match)
    if (music) {
        conditions.push('music LIKE ?');
        params.push(`%${music}%`);
    }

    // Filter by music_genre (partial match)
    if (musicGenre) {
        conditions.push('music_genre LIKE ?');
        params.push(`%${musicGenre}%`);
    }

    // Filter by holiday_country (partial match)
    if (holidayCountry) {
        conditions.push('holiday_country LIKE ?');
        params.push(`%${holidayCountry}%`);
    }

    // Filter by clothing_style (partial match)
    if (clothingStyle) {
        conditions.push('clothing_style LIKE ?');
        params.push(`%${clothingStyle}%`);
    }

    // Filter by animal (partial match)
    if (animal) {
        conditions.push('animal LIKE ?');
        params.push(`%${animal}%`);
    }

    // Filter by color (partial match)
    if (color) {
        conditions.push('color LIKE ?');
        params.push(`%${color}%`);
    }

    // Build WHERE clause if there are any conditions
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    // If filtering by profile_id, get only the most recent theme
    if (profileId) {
        query += ' ORDER BY created_at DESC LIMIT 1';
    }

    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({message: "Database error", error: err.message});
        }
        if (results.length === 0) {
            res.status(404).json({message: "Collection not found."});
        } else {
            res.status(200).json(results);
        }
    });
});


dataRouter.get('/families', (req, res) => {
    db.query('SELECT * FROM families', (err, results) => {
        if (results.length === 0){
            res.status(404).json({message: "Collection not found."})
        }else
            res.status(200).json(results);
    });
});

dataRouter.get('/recommendations', (req, res) => {
    db.query('SELECT * FROM recommendations', (err, results) => {
        if (results.length === 0){
            res.status(404).json({message: "Collection not found."})
        }else
            res.status(200).json(results);
    });
});

dataRouter.get('/logs', (req, res) => {
    db.query('SELECT * FROM logs', (err, results) => {
        if (results.length === 0){
            res.status(404).json({message: "Collection not found."})
        }else
            res.status(200).json(results);
    });
});

dataRouter.get('/family_quizzes', (req, res) => {
    db.query('SELECT * FROM family_quizzes', (err, results) => {
        if (results.length === 0){
            res.status(404).json({message: "Collection not found."})
        }else
            res.status(200).json(results);
    });
});

dataRouter.get('/quizzes', (req, res) => {
    db.query('SELECT * FROM quizzes', (err, results) => {
        if (results.length === 0){
            res.status(404).json({message: "Collection not found."})
        }else
            res.status(200).json(results);
    });
});

dataRouter.get('/questions', (req, res) => {
    const quizId = req.query.quiz_id;

    let query = 'SELECT * FROM questions';
    const params = [];

    if (quizId) {
        query += ' WHERE quiz_id = ?';
        params.push(quizId);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({message: "Database error", error: err.message});
        }
        if (results.length === 0) {
            res.status(404).json({message: "Collection not found."});
        } else {
            res.status(200).json(results);
        }
    });
});

dataRouter.get('/answers', (req, res) => {
    const questionId = req.query.question_id;

    let query = 'SELECT * FROM answers';
    const params = [];

    if (questionId) {
        query += ' WHERE question_id = ?';
        params.push(questionId);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({message: "Database error", error: err.message});
        }
        if (results.length === 0) {
            res.status(404).json({message: "Collection not found."});
        } else {
            res.status(200).json(results);
        }
    });
});

dataRouter.get('/user_minigames', (req, res) => {
    db.query('SELECT * FROM user_minigames', (err, results) => {
        if (results.length === 0){
            res.status(404).json({message: "Collection not found."})
        }else
            res.status(200).json(results);
    });
});

dataRouter.get('/minigames', (req, res) => {
    db.query('SELECT * FROM minigames', (err, results) => {
        if (results.length === 0){
            res.status(404).json({message: "Collection not found."})
        }else
            res.status(200).json(results);
    });
});

dataRouter.get('/minigame_matches', (req, res) => {
    db.query('SELECT * FROM minigame_matches', (err, results) => {
        if (results.length === 0){
            res.status(404).json({message: "Collection not found."})
        }else
            res.status(200).json(results);
    });
});
dataRouter.get('/minigame_sessions', (req, res) => {
    db.query('SELECT * FROM minigame_sessions', (err, results) => {
        if (results.length === 0){
            res.status(404).json({message: "Collection not found."})
        }else
            res.status(200).json(results);
    });
});

dataRouter.get('/minigame_events', (req, res) => {
    db.query('SELECT * FROM minigame_events', (err, results) => {
        if (results.length === 0){
            res.status(404).json({message: "Collection not found."})
        }else
            res.status(200).json(results);
    });
});

dataRouter.get('/match_users', (req, res) => {
    db.query('SELECT * FROM match_users', (err, results) => {
        if (results.length === 0){
            res.status(404).json({message: "Collection not found."})
        }else
            res.status(200).json(results);
    });
});

export default dataRouter