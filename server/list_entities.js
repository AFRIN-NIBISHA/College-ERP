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
        const staff = await pool.query("SELECT id, name FROM staff ORDER BY name");
        console.log("--- STAFF ---");
        staff.rows.forEach(s => console.log(`${s.id}: ${s.name}`));

        const subjects = await pool.query("SELECT id, subject_code, subject_name FROM subjects ORDER BY subject_code");
        console.log("\n--- SUBJECTS ---");
        subjects.rows.forEach(s => console.log(`${s.id}: ${s.subject_code} - ${s.subject_name}`));

        const class_details = await pool.query("SELECT * FROM class_details");
        console.log("\n--- CLASS DETAILS ---");
        console.table(class_details.rows);

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
run();
