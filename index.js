import express from 'express';
import dataRouter from "./routes/dataRouter.js";
import usersRouter from "./routes/usersRouter.js";
import familiesRouter from "./routes/familiesRouter.js";

try{

    const app = express();
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        next();
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
    app.use("/users", usersRouter);
    app.use("/families", familiesRouter);
    
    app.listen(8000, () => console.log('Server running on port 8000'));
}
catch (e){
    console.log(e);
}
