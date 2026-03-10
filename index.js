import express from 'express';
import db from './database.js';

import minigameSessions from './routes/minigameSessions.js';

const app = express();

app.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

//Middelware to support application/JSON content-type
app.use(express.json());
//Middelware to support application/x-www-form-urlencoded content-type
app.use(express.urlencoded({ extended: true }));

app.use("/minigame-sessions", minigameSessions);

app.listen(3000, () => console.log('Server running on port 3000'));