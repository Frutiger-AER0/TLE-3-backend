// index.js
import express from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv'

dotenv.config()

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,    // replace with your host
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,         // replace with your password
    database: process.env.DB_NAME      // replace with your database name
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

export default db;