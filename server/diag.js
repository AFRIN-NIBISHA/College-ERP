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
        const students = await pool.query("SELECT roll_no, name, year, section FROM students WHERE roll_no = '960623104004'");
        console.log("Students for 960623104004:", students.rows);

        const classes = await pool.query("SELECT year, section, staff_id FROM class_details");
        console.log("All Class Details Records:", classes.rows);

        const staff = await pool.query("SELECT id, name FROM staff");
        console.log("All Staff Records (first 5):", staff.rows.slice(0, 5));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
run();
