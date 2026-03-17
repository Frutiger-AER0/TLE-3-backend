import express from 'express';
import dataRouter from "./routes/dataRouter.js";
import youtubeRouter from "./routes/youtubeRouter.js";

import adminRouter from "./routes/adminRouter.js";
import authRouter from "./routes/authRouter.js";
import usersRouter from "./routes/usersRouter.js";
import familiesRouter from "./routes/familiesRouter.js";
import minigameSessions from './routes/minigameSessions.js';
import learningModulesRouter from "./routes/learningModulesRouter.js";
import matchesRouter from "./routes/matchesRouter.js";


import dotenv from "dotenv";

dotenv.config();


try{

    const app = express();

    //Middelware to support application/JSON content-type
    app.use(express.json());
    //Middelware to support application/x-www-form-urlencoded content-type
    app.use(express.urlencoded({ extended: true }));

    app.use("/auth", youtubeRouter);
    app.use("/users", usersRouter);
    app.use("/admin", adminRouter);
    app.use("/login", authRouter);
    app.use("/families", familiesRouter);
    app.use("/minigame-sessions", minigameSessions);
    app.use("/minigame-matches", matchesRouter);
    app.use("/learningModules", learningModulesRouter);
    app.use("/", dataRouter);


    app.listen(3000, () => console.log('Server running on port 3000'));
}
catch (e){
    console.log(e);
}
