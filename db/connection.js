// connect to database
const mysql = require('mysql2');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.sqlPassword,
    database: 'company'
});

module.exports = db;
