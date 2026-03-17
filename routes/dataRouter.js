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

    let query = 'SELECT * FROM ai_profiles';
    const params = [];

    if (userId) {
        query += ' WHERE user_id = ?';
        params.push(userId);
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

    let query = 'SELECT * FROM themes';
    const params = [];

    if (profileId) {
        query += ' WHERE profile_id = ?';
        params.push(profileId);
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