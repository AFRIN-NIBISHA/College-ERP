const { Pool } = require('pg');
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
        console.log("Dropping tables for clean applying...");
        await pool.query("DROP TABLE IF EXISTS timetable CASCADE");
        await pool.query("DROP TABLE IF EXISTS class_details CASCADE");
        // await pool.query("DROP TABLE IF EXISTS subjects CASCADE"); // subjects might have data, but let's be clean
        await pool.query("DROP TABLE IF EXISTS subjects CASCADE");

        const fs = require('fs');
        const schema = fs.readFileSync('schema.sql', 'utf8');
        await pool.query(schema);
        console.log("Schema applied successfully after drops!");
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        pool.end();
    }
}
run();
