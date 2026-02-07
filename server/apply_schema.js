const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

async function run() {
    try {
        const schema = fs.readFileSync('schema.sql', 'utf8');
        await pool.query(schema);
        console.log("Schema applied successfully!");
    } catch (err) {
        console.error("Schema application error:", err.message);
    } finally {
        pool.end();
    }
}
run();
