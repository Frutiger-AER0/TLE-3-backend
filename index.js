import express from 'express';
import dataRouter from "./routes/dataRouter.js";
import youtubeRouter from "./routes/youtubeRouter.js";
import adminRouter from "./routes/adminRouter.js";
import authRouter from "./routes/authRouter.js";
import usersRouter from "./routes/usersRouter.js";
import familiesRouter from "./routes/familiesRouter.js";
import minigameSessions from './routes/minigameSessions.js';
import learningModulesRouter from "./routes/learningModulesRouter.js";
import db from "./database.js";
import matchesRouter from "./routes/matchesRouter.js";
import aiRouter from "./routes/aiRouter.js";
import apiKeysRouter from "./routes/apiKeysRouter.js";
import { verifyApiKey } from "./middleware/apiKey.js";

import dotenv from "dotenv";

dotenv.config();

try{
    const app = express();
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        next();
    });

    app.get('/', (req, res) => {
        db.query('SELECT * FROM users', (err, results) => {
            if (err) throw err;
            res.json(results);
        });
    });

    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");

        if (req.method === "OPTIONS") {
            return res.sendStatus(204);
        }
        next();
    });

    //Middelware to support application/JSON content-type
    app.use(express.json());
    //Middelware to support application/x-www-form-urlencoded content-type
    app.use(express.urlencoded({ extended: true }));

    app.use("/login", authRouter);
    app.use("/auth", youtubeRouter);

    // API Key middleware - applies to all routes below
    console.log(`API key is required? ${process.env.REQUIRE_API_KEY === "true" ? "ENABLED" : "DISABLED"}`);
    app.use(verifyApiKey);

    app.use("/users", usersRouter);
    app.use("/admin", adminRouter);
    app.use("/families", familiesRouter);
    app.use("/minigame-sessions", minigameSessions);
    app.use("/ai", aiRouter);
    app.use("/learningModules", learningModulesRouter)
    app.use("/minigame-matches", matchesRouter);
    app.use("/learningModules", learningModulesRouter);
    app.use("/", dataRouter);


    app.listen(8000, () => console.log('Server running on port 8000'));
}
catch (e){
    console.log(e);
}
