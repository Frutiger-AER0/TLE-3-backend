import express from 'express';
import dataRouter from "./routes/dataRouter.js";

// import authRouter from "./routes/auth.js";
import usersRouter from "./routes/usersRouter.js";
import familiesRouter from "./routes/familiesRouter.js";
import minigameSessions from './routes/minigameSessions.js';
import aiRouter from "./routes/aiRouter.js";

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

    app.use("/", dataRouter)

    // app.use("/auth", authRouter);
    app.use("/users", usersRouter);
    app.use("/families", familiesRouter);
    app.use("/minigame-sessions", minigameSessions);
    app.use("/ai", aiRouter);

    app.listen(3000, () => console.log('Server running on port 3000'));
}
catch (e){
    console.log(e);
}
