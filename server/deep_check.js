const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

async function check() {
    try {
        const studentRes = await pool.query("SELECT * FROM students WHERE roll_no = '960623104004'");
        const student = studentRes.rows[0];
        console.log("STUDENT:", JSON.stringify(student, null, 2));

        if (student) {
            const classRes = await pool.query("SELECT * FROM class_details WHERE year = $1 AND section = $2", [student.year, student.section]);
            console.log("CLASS DETAILS:", JSON.stringify(classRes.rows[0], null, 2));

            if (classRes.rows[0]) {
                const staffRes = await pool.query("SELECT name FROM staff WHERE id = $1", [classRes.rows[0].staff_id]);
                console.log("STAFF NAME:", staffRes.rows[0]?.name);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
check();
