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
        const res = await pool.query("SELECT * FROM class_details LIMIT 1");
        console.log("CLASS_DETAILS SAMPLE:", res.rows[0]);
        const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'class_details'");
        console.log("COLUMNS:");
        cols.rows.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
run();
