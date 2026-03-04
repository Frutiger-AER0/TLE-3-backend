import express from 'express';
import db from './database.js';

const app = express();

app.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));