const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});
pool.query("SELECT id FROM staff LIMIT 1").then(res => {
    console.log("SUCCESS:", res.rows);
    pool.end();
}).catch(err => {
    console.error("FAIL:", err.message);
    pool.end();
});
