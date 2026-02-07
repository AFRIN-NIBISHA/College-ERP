const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

async function debug() {
    try {
        const res = await pool.query("SELECT * FROM students WHERE roll_no = '960623104004'");
        console.log("Student Info:", res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

debug();
