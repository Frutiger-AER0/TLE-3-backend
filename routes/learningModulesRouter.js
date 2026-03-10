import express from "express";
import db from "../database.js";
import show from "../Controllers/learningModules/learningModuleDetail.js";
import create from "../Controllers/learningModules/learningModuleCreate.js";
import edit from "../Controllers/learningModules/learningModuleUpdate.js";
import remove from "../Controllers/learningModules/learningModuleDelete.js";


const learningModulesRouter = express.Router()

learningModulesRouter.use((req, res, next)=>{

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

//OPTIONS
learningModulesRouter.options("/",(req, res)=>{
    res.header("Allow","GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Methods","GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
    res.status(204).send();
})

//GET READ
learningModulesRouter.get("/",(req, res)=>{
    db.query('SELECT * FROM quizzes', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
})
//OPTIONS DETAILS
//
learningModulesRouter.options("/:id",(req,res)=>{
    res.header("Allow","GET, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Methods","GET, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
    res.status(204).send();
})

//GET detail
learningModulesRouter.get("/:id", show )
//CREATE quiz
learningModulesRouter.post("/create", create)
//EDIT quiz
learningModulesRouter.put("/:id", edit)
//DELETE quiz
learningModulesRouter.delete("/:id", remove)

export default learningModulesRouter

