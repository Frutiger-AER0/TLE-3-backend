import express from "express";
import learningModulesRouter from "./learningModulesRouter.js";
import db from "../database.js";
import show from "../controllers/recommendation/recommendationDetail.js";
import patch from "../controllers/recommendation/recommendationPatch.js";

const recommendationRouter = express.Router()

recommendationRouter.use((req, res, next)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");

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

recommendationRouter.options("/",(req, res)=>{
    res.header("Allow","GET, OPTIONS");
    res.header("Access-Control-Allow-Methods","GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
    res.status(204).send();
})

recommendationRouter.get("/",(req, res)=>{
    db.query('SELECT * FROM recommendations', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
})

recommendationRouter.options("/:id",(req,res)=>{
    res.header("Allow","GET, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Methods","GET, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
    res.status(204).send();
})

//get recommendation
recommendationRouter.get('/:id', show)

//patch recommendation
recommendationRouter.get("/:id", patch)

export default recommendationRouter
