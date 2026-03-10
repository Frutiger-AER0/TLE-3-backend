import express from 'express';
import dataRouter from "./routes/dataRouter.js";
import youtubeRouter from "./routes/youtubeRouter.js";

const app = express();

try {

    app.use(express.json());

    app.use(express.urlencoded({ extended: true }));

    app.use("/", dataRouter)

} catch (e) {
    app.use((req,res)=>{
        res.status(500).json({
            message:"Database is down"
        })
    })

}

app.listen(3000, () => console.log('Server running on port 3000'));